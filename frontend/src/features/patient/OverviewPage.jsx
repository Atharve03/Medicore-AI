import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Pill, FlaskConical, Receipt, Pencil } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { patientsApi } from '../../api/patients.api.js';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import ProfileEditModal from './ProfileEditModal.jsx';

const QUICK_LINKS = [
  { label: 'Book appointment', to: '/patient/appointments', icon: CalendarClock },
  { label: 'Prescriptions', to: '/patient/prescriptions', icon: Pill },
  { label: 'Lab reports', to: '/patient/lab', icon: FlaskConical },
  { label: 'Billing', to: '/patient/billing', icon: Receipt },
];

export default function PatientOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = useCallback(() => patientsApi.getMe(), []);
  const { data: profile, loading, refetch } = useFetch(fetchProfile, []);

  const fetchUpcoming = useCallback(
    () => appointmentsApi.listMine({ status: 'confirmed', limit: 1 }),
    []
  );
  const { data: upcoming } = useFetch(fetchUpcoming, []);
  const nextAppointment = upcoming?.items?.[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, {user?.fullName?.split(' ')[0]}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Here&apos;s a quick look at your care.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title="Your profile"
          action={
            <button
              onClick={() => setEditOpen(true)}
              className="flex items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </button>
          }
          className="lg:col-span-2"
        >
          {loading ? (
            <p className="text-sm text-ink-light/50">Loading…</p>
          ) : (
            <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
              <Field label="Date of birth" value={formatDate(profile?.dateOfBirth)} />
              <Field label="Gender" value={profile?.gender} />
              <Field label="Blood group" value={profile?.bloodGroup} />
              <Field label="Contact" value={profile?.contactNumber} />
              <Field
                label="Allergies"
                value={profile?.allergies?.length ? profile.allergies.join(', ') : '—'}
              />
              <Field
                label="Emergency contact"
                value={
                  profile?.emergencyContact
                    ? `${profile.emergencyContact.name} (${profile.emergencyContact.relation})`
                    : '—'
                }
              />
            </dl>
          )}
        </Card>

        <Card title="Next appointment">
          {nextAppointment ? (
            <div className="flex flex-col gap-2">
              <p className="font-data text-sm text-ink-light dark:text-ink-dark">
                {new Date(nextAppointment.scheduledAt).toLocaleString()}
              </p>
              <StatusBadge status={nextAppointment.status} />
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
                No confirmed appointment yet.
              </p>
              <Link to="/patient/appointments">
                <Button variant="secondary" className="w-full">
                  Book one
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {QUICK_LINKS.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-2 rounded-xl border border-clinical-100 bg-white p-5 text-center transition-colors hover:border-clinical-300 dark:border-clinical-800 dark:bg-clinical-900"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-medium text-ink-light dark:text-ink-dark">
              {label}
            </span>
          </Link>
        ))}
      </div>

      <ProfileEditModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={() => {
          setEditOpen(false);
          refetch();
        }}
      />
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-ink-light/40 dark:text-ink-dark/40">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink-light dark:text-ink-dark">{value || '—'}</dd>
    </div>
  );
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : null;
}
