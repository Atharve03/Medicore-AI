import { useCallback, useState } from 'react';
import { Users as UsersIcon, Plus, UserX, UserCheck } from 'lucide-react';

import { adminApi } from '../../api/admin.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import TextField from '../../components/common/TextField.jsx';
import Select from '../../components/common/Select.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import CreateUserModal from './CreateUserModal.jsx';

const ROLES = [
  'admin',
  'doctor',
  'patient',
  'receptionist',
  'nurse',
  'pharmacist',
  'labTechnician',
];

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = useCallback(
    () => adminApi.listUsers({ search: search || undefined, role: role || undefined, limit: 50 }),
    [search, role]
  );
  const { data, loading, error, refetch } = useFetch(fetchUsers, [search, role]);
  const users = data?.items || [];

  async function toggleActive(user) {
    setBusyId(user.id);
    try {
      if (user.isActive) {
        await adminApi.deactivateUser(user.id);
      } else {
        await adminApi.updateUser(user.id, { isActive: true });
      }
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            Users
          </h2>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
            Every account in the system, by role.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Create account
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <TextField
          id="search"
          label="Search"
          placeholder="Name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select id="role" label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      </div>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && users.length === 0 && (
        <EmptyState icon={UsersIcon} title="No users match" description="Try a different search or role filter." />
      )}

      <div className="flex flex-col gap-2">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium text-ink-light dark:text-ink-dark">{u.fullName}</p>
              <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">{u.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-clinical-50 px-2.5 py-0.5 text-xs font-medium capitalize text-clinical-700 dark:bg-clinical-800 dark:text-clinical-200">
                {u.role}
              </span>
              <span
                className={`text-xs font-medium ${
                  u.isActive ? 'text-vital-500' : 'text-critical-500'
                }`}
              >
                {u.isActive ? 'Active' : 'Inactive'}
              </span>
              <Button
                variant="secondary"
                loading={busyId === u.id}
                onClick={() => toggleActive(u)}
              >
                {u.isActive ? (
                  <>
                    <UserX className="h-4 w-4" /> Deactivate
                  </>
                ) : (
                  <>
                    <UserCheck className="h-4 w-4" /> Reactivate
                  </>
                )}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <CreateUserModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
