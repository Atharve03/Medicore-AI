import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { attachAuthStore } from '../api/client.js';
import { useAuthStore } from '../store/authStore.js';
import { useUiStore } from '../store/uiStore.js';
import { ROLE_HOME } from '../routes/roleNav.js';
import ProtectedRoute from '../routes/ProtectedRoute.jsx';
import PublicOnlyRoute from '../routes/PublicOnlyRoute.jsx';
import AppShell from '../components/layout/AppShell.jsx';

import LoginPage from '../features/auth/LoginPage.jsx';
import RegisterPage from '../features/auth/RegisterPage.jsx';
import ForgotPasswordPage from '../features/auth/ForgotPasswordPage.jsx';
import NotificationsPage from '../features/shared/NotificationsPage.jsx';
import NotFoundPage from '../features/shared/NotFoundPage.jsx';
import AiAssistantPage from '../features/aiAssistant/AiAssistantPage.jsx';
const AnalyticsPage = lazy(() => import('../features/analytics/AnalyticsPage.jsx'));

import AdminOverviewPage from '../features/admin/OverviewPage.jsx';
import AdminUsersPage from '../features/admin/UsersPage.jsx';
import AdminAppointmentsPage from '../features/admin/AppointmentsPage.jsx';
import AdminBillingPage from '../features/admin/BillingPage.jsx';
import AdminInventoryPage from '../features/admin/InventoryPage.jsx';
import DoctorOverviewPage from '../features/doctor/OverviewPage.jsx';
import DoctorAppointmentsPage from '../features/doctor/AppointmentsPage.jsx';
import DoctorPatientsPage from '../features/doctor/PatientsPage.jsx';
import DoctorPatientDetailPage from '../features/doctor/PatientDetailPage.jsx';
import PatientOverviewPage from '../features/patient/OverviewPage.jsx';
import PatientAppointmentsPage from '../features/patient/AppointmentsPage.jsx';
import PatientRecordsPage from '../features/patient/RecordsPage.jsx';
import PatientLabReportsPage from '../features/patient/LabReportsPage.jsx';
import PatientPrescriptionsPage from '../features/patient/PrescriptionsPage.jsx';
import PatientBillingPage from '../features/patient/BillingPage.jsx';
import ReceptionistOverviewPage from '../features/receptionist/OverviewPage.jsx';
import ReceptionistAppointmentsPage from '../features/receptionist/AppointmentsPage.jsx';
import ReceptionistPatientsPage from '../features/receptionist/PatientsPage.jsx';
import ReceptionistBillingPage from '../features/receptionist/BillingPage.jsx';
import NurseOverviewPage from '../features/nurse/OverviewPage.jsx';
import NurseAdmissionsPage from '../features/nurse/AdmissionsPage.jsx';
import NurseInventoryPage from '../features/nurse/InventoryPage.jsx';
import PharmacistOverviewPage from '../features/pharmacist/OverviewPage.jsx';
import PharmacistMedicinesPage from '../features/pharmacist/MedicinesPage.jsx';
import PharmacistDispensePage from '../features/pharmacist/DispensePage.jsx';
import LabTechnicianOverviewPage from '../features/labTechnician/OverviewPage.jsx';
import LabTechnicianOrdersPage from '../features/labTechnician/OrdersPage.jsx';

// Wired once at module scope so the axios client can read the current
// token without a React import cycle (see api/client.js).
attachAuthStore(useAuthStore);

export default function App() {
  const user = useAuthStore((s) => s.user);
  const darkMode = useUiStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin', 'superAdmin']} />}>
            <Route path="/ai-assistant" element={<AiAssistantPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['admin','superAdmin','doctor','receptionist','nurse','pharmacist','labTechnician']} />}>
            <Route path="/analytics" element={<Suspense fallback={<p>Loading analytics…</p>}><AnalyticsPage /></Suspense>} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'superAdmin']} />}>
            <Route path="/admin" element={<AdminOverviewPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            <Route path="/admin/billing" element={<AdminBillingPage />} />
            <Route path="/admin/inventory" element={<AdminInventoryPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor" element={<DoctorOverviewPage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/patients" element={<DoctorPatientsPage />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientDetailPage />} />
            <Route path="/doctor/ai" element={<Navigate to="/ai-assistant" replace />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient" element={<PatientOverviewPage />} />
            <Route path="/patient/appointments" element={<PatientAppointmentsPage />} />
            <Route path="/patient/records" element={<PatientRecordsPage />} />
            <Route path="/patient/lab" element={<PatientLabReportsPage />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptionsPage />} />
            <Route path="/patient/billing" element={<PatientBillingPage />} />
            <Route path="/patient/ai" element={<Navigate to="/ai-assistant" replace />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
            <Route path="/receptionist" element={<ReceptionistOverviewPage />} />
            <Route path="/receptionist/appointments" element={<ReceptionistAppointmentsPage />} />
            <Route path="/receptionist/patients" element={<ReceptionistPatientsPage />} />
            <Route path="/receptionist/billing" element={<ReceptionistBillingPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['nurse']} />}>
            <Route path="/nurse" element={<NurseOverviewPage />} />
            <Route path="/nurse/admissions" element={<NurseAdmissionsPage />} />
            <Route path="/nurse/inventory" element={<NurseInventoryPage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['pharmacist']} />}>
            <Route path="/pharmacist" element={<PharmacistOverviewPage />} />
            <Route path="/pharmacist/medicines" element={<PharmacistMedicinesPage />} />
            <Route path="/pharmacist/dispense" element={<PharmacistDispensePage />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['labTechnician']} />}>
            <Route path="/lab" element={<LabTechnicianOverviewPage />} />
            <Route path="/lab/orders" element={<LabTechnicianOrdersPage />} />
          </Route>

          <Route path="/" element={<HomeRedirect user={user} />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function HomeRedirect({ user }) {
  return <Navigate to={ROLE_HOME[user?.role] || '/login'} replace />;
}
