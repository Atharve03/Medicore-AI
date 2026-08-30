import {
  LayoutDashboard,
  CalendarClock,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  Receipt,
  Boxes,
  BedDouble,
  Bell,
  Sparkles,
} from 'lucide-react';

/**
 * One entry per role. Phase 17-20 dashboards render at these `to` paths;
 * this phase only needs the paths to exist and resolve to a placeholder.
 */
export const ROLE_NAV = {
  admin: [
    { label: 'Overview', to: '/admin', icon: LayoutDashboard },
    { label: 'Users', to: '/admin/users', icon: Users },
    { label: 'Appointments', to: '/admin/appointments', icon: CalendarClock },
    { label: 'Billing', to: '/admin/billing', icon: Receipt },
    { label: 'Inventory', to: '/admin/inventory', icon: Boxes },
    { label: 'AI Assistant', to: '/ai-assistant', icon: Sparkles },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  doctor: [
    { label: 'Overview', to: '/doctor', icon: LayoutDashboard },
    { label: 'Appointments', to: '/doctor/appointments', icon: CalendarClock },
    { label: 'Patients', to: '/doctor/patients', icon: Users },
    { label: 'AI Assistant', to: '/doctor/ai', icon: Sparkles },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  patient: [
    { label: 'Overview', to: '/patient', icon: LayoutDashboard },
    { label: 'Appointments', to: '/patient/appointments', icon: CalendarClock },
    { label: 'Records', to: '/patient/records', icon: Stethoscope },
    { label: 'Lab Reports', to: '/patient/lab', icon: FlaskConical },
    { label: 'Prescriptions', to: '/patient/prescriptions', icon: Pill },
    { label: 'Billing', to: '/patient/billing', icon: Receipt },
    { label: 'AI Assistant', to: '/patient/ai', icon: Sparkles },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  receptionist: [
    { label: 'Overview', to: '/receptionist', icon: LayoutDashboard },
    { label: 'Appointments', to: '/receptionist/appointments', icon: CalendarClock },
    { label: 'Patients', to: '/receptionist/patients', icon: Users },
    { label: 'Billing', to: '/receptionist/billing', icon: Receipt },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  nurse: [
    { label: 'Overview', to: '/nurse', icon: LayoutDashboard },
    { label: 'Admissions', to: '/nurse/admissions', icon: BedDouble },
    { label: 'Inventory', to: '/nurse/inventory', icon: Boxes },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  pharmacist: [
    { label: 'Overview', to: '/pharmacist', icon: LayoutDashboard },
    { label: 'Medicines', to: '/pharmacist/medicines', icon: Pill },
    { label: 'Dispense', to: '/pharmacist/dispense', icon: FlaskConical },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
  labTechnician: [
    { label: 'Overview', to: '/lab', icon: LayoutDashboard },
    { label: 'Orders', to: '/lab/orders', icon: FlaskConical },
    { label: 'Notifications', to: '/notifications', icon: Bell },
  ],
};

/** The default landing route once a user of this role logs in. */
export const ROLE_HOME = {
  admin: '/admin',
  doctor: '/doctor',
  patient: '/patient',
  receptionist: '/receptionist',
  nurse: '/nurse',
  pharmacist: '/pharmacist',
  labTechnician: '/lab',
};
