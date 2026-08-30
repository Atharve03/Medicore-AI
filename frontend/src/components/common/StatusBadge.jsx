/**
 * Every domain in MediCore AI is fundamentally a tracked state machine —
 * appointments, prescriptions, lab orders, invoices, admissions all move
 * through an explicit status enum (see backend Phases 7-14). This
 * component is the single place that maps *any* of those statuses to one
 * consistent color language, so a user learns the meaning once and
 * recognizes it everywhere: a left-border "rail" plus a matching dot,
 * rather than a different badge style per module.
 *
 * Phase 17+ dashboards should always render status through this
 * component instead of ad hoc colored spans.
 */

const STATUS_TONE = {
  // neutral / waiting
  requested: 'waiting',
  ordered: 'waiting',
  pending: 'waiting',

  // active / in motion
  confirmed: 'active',
  admitted: 'active',
  inProgress: 'active',
  active: 'active',

  // resolved / success
  completed: 'resolved',
  paid: 'resolved',
  dispensed: 'resolved',
  discharged: 'resolved',

  // needs attention
  partiallyPaid: 'attention',
  lowStock: 'attention',

  // stopped / danger
  cancelled: 'stopped',
  void: 'stopped',
  noShow: 'stopped',
  expired: 'stopped',
};

const TONE_STYLES = {
  waiting: {
    dot: 'bg-clinical-300',
    rail: 'border-clinical-300',
    text: 'text-clinical-600 dark:text-clinical-200',
  },
  active: {
    dot: 'bg-clinical-600',
    rail: 'border-clinical-600',
    text: 'text-clinical-700 dark:text-clinical-200',
  },
  resolved: {
    dot: 'bg-vital-500',
    rail: 'border-vital-500',
    text: 'text-vital-500',
  },
  attention: {
    dot: 'bg-alert-500',
    rail: 'border-alert-500',
    text: 'text-alert-500',
  },
  stopped: {
    dot: 'bg-critical-500',
    rail: 'border-critical-500',
    text: 'text-critical-500',
  },
};

function humanize(status) {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());
}

export function StatusBadge({ status }) {
  const tone = STATUS_TONE[status] || 'waiting';
  const styles = TONE_STYLES[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles.text} ${styles.rail} bg-transparent`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${styles.dot}`} aria-hidden="true" />
      {humanize(status)}
    </span>
  );
}

/**
 * The left-border "rail" variant for list rows / cards, using the same
 * tone mapping as StatusBadge so a table row and its badge always agree.
 */
export function statusRailClass(status) {
  const tone = STATUS_TONE[status] || 'waiting';
  return `border-l-4 ${TONE_STYLES[tone].rail}`;
}

export default StatusBadge;
