import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Users, Pencil } from 'lucide-react';

import { useAuthStore } from '../../store/authStore.js';
import { doctorsApi } from '../../api/doctors.api.js';
import { appointmentsApi } from '../../api/appointments.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import { StatusBadge } from '../../components/common/StatusBadge.jsx';
import DoctorProfileEditModal from './DoctorProfileEditModal.jsx';

export default function DoctorOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const [editOpen, setEditOpen] = useState(false);

  const fetchProfile = useCallback(() => doctorsApi.getMe(), []);
  const { data: profile, loading, refetch } = useFetch(fetchProfile, []);

  const fetchTodays = useCallback(() => appointmentsApi.listMine({ limit: 50 }), []);
  const { data: appts } = useFetch(fetchTodays, []);
  const today = new Date().toDateString();
  const todaysAppointments = (appts?.items || []).filter(
    (a) => new Date(a.scheduledAt).toDateString() === today
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
          Welcome, Dr. {user?.fullName?.split(' ').pop()}
        </h2>
        <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
          Here&apos;s today at a glance.
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
              <Field label="Specialization" value={profile?.specialization} />
              <Field label="Department" value={profile?.department} />
              <Field
                label="Consultation fee"
                value={profile?.consultationFee ? `₹${profile.consultationFee}` : null}
              />
              <Field
                label="Qualifications"
                value={profile?.qualifications?.join(', ')}
              />
              <Field
                label="Weekly slots"
                value={profile?.availability?.length ? `${profile.availability.length} configured` : null}
              />
            </dl>
          )}
        </Card>

        <Card title="Today">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="font-data text-xl font-semibold text-ink-light dark:text-ink-dark">
                {todaysAppointments.length}
              </p>
              <p className="text-xs text-ink-light/60 dark:text-ink-dark/60">
                appointment{todaysAppointments.length === 1 ? '' : 's'} today
              </p>
            </div>
          </div>
          <Link
            to="/doctor/appointments"
            className="mt-4 flex items-center gap-1 text-sm font-medium text-clinical-600 dark:text-clinical-300"
          >
            View schedule →
          </Link>
        </Card>
      </div>

      <Card title="Upcoming today">
        {todaysAppointments.length === 0 ? (
          <p className="text-sm text-ink-light/50">Nothing scheduled for today.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {todaysAppointments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between rounded-lg bg-clinical-50 px-3 py-2 dark:bg-clinical-800"
              >
                <span className="font-data text-sm text-ink-light dark:text-ink-dark">
                  {new Date(a.scheduledAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <StatusBadge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Link
        to="/doctor/patients"
        className="flex items-center gap-3 rounded-xl border border-clinical-100 bg-white p-5 transition-colors hover:border-clinical-300 dark:border-clinical-800 dark:bg-clinical-900"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clinical-50 text-clinical-600 dark:bg-clinical-800 dark:text-clinical-300">
          <Users className="h-5 w-5" />
        </span>
        <div>
          <p className="font-medium text-ink-light dark:text-ink-dark">Your patients</p>
          <p className="text-sm text-ink-light/60 dark:text-ink-dark/60">
            View charts, add records, prescribe, order labs
          </p>
        </div>
      </Link>

      <DoctorProfileEditModal
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
