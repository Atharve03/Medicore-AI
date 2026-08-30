/* eslint-disable no-console */
const crypto = require('crypto');
const dns = require('dns');
const mongoose = require('mongoose');

dns.setServers(['1.1.1.1', '8.8.8.8']);

const env = require('../src/config/env');
const { signAccessToken } = require('../src/utils/jwt');
const { buildOtpRecord } = require('../src/utils/otp');
const userRepository = require('../src/repositories/user.repository');
const notificationRepository = require('../src/repositories/notification.repository');

const { User } = require('../src/models/user.model');
const { Patient } = require('../src/models/patient.model');
const { Doctor } = require('../src/models/doctor.model');
const { Appointment } = require('../src/models/appointment.model');
const { MedicalRecord } = require('../src/models/medicalRecord.model');
const { Prescription } = require('../src/models/prescription.model');
const { LabReport } = require('../src/models/labReport.model');
const { Medicine } = require('../src/models/medicine.model');
const { PharmacyOrder } = require('../src/models/pharmacyOrder.model');
const { Invoice } = require('../src/models/invoice.model');
const { InventoryItem } = require('../src/models/inventoryItem.model');
const { Admission } = require('../src/models/admission.model');
const { Notification } = require('../src/models/notification.model');
const { KnowledgeDocument } = require('../src/models/knowledgeDocument.model');
const { KnowledgeChunk } = require('../src/models/knowledgeChunk.model');

const API_BASE = process.env.E2E_API_BASE_URL || 'http://localhost:5000/api/v1';
const KEEP_DATA = process.env.KEEP_E2E_DATA === '1';
const runId = `${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;
const testPassword = `E2e@${crypto.randomBytes(8).toString('hex')}Aa1`;
const resetPassword = `Reset@${crypto.randomBytes(8).toString('hex')}Bb2`;
const changedPassword = `Changed@${crypto.randomBytes(8).toString('hex')}Cc3`;
const otpCode = '482913';

const created = Object.fromEntries([
  'users', 'patients', 'doctors', 'appointments', 'records', 'prescriptions',
  'labs', 'medicines', 'pharmacyOrders', 'invoices', 'inventory', 'admissions',
  'notifications', 'knowledgeDocuments',
].map((key) => [key, []]));
const results = [];

function remember(type, id) {
  if (id && !created[type].includes(String(id))) created[type].push(String(id));
  return id;
}

async function api(name, method, path, { token, body, expected = [200] } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  const pass = expected.includes(response.status);
  results.push({ name, method, path, status: response.status, pass });
  if (!pass) {
    const message = payload?.message || 'Non-JSON response';
    throw new Error(`${name}: expected ${expected.join('/')} but received ${response.status}: ${message}`);
  }
  return payload?.data;
}

async function tokenFor(user) {
  return signAccessToken({ _id: user.id || user._id, role: user.role });
}

async function setKnownOtp(email, purpose) {
  const user = await userRepository.findByEmail(email);
  if (!user) throw new Error(`Cannot set test OTP: user ${email} not found`);
  await userRepository.setOtp(user._id, buildOtpRecord(otpCode, purpose));
  return user;
}

async function createAdminManagedUser(adminToken, role, label = role) {
  const user = await api(`Admin creates ${label}`, 'POST', '/admin/users', {
    token: adminToken,
    expected: [201],
    body: {
      fullName: `E2E ${label} ${runId}`,
      email: `e2e-${label}-${runId}@example.com`,
      password: testPassword,
      role,
    },
  });
  remember('users', user.id);
  return { ...user, token: await tokenFor(user) };
}

async function cleanup() {
  if (KEEP_DATA) return;
  const remove = async (Model, ids) => {
    if (ids.length) await Model.deleteMany({ _id: { $in: ids } });
  };
  await remove(KnowledgeChunk, created.knowledgeDocuments.length
    ? await KnowledgeChunk.find({ documentId: { $in: created.knowledgeDocuments } }).distinct('_id') : []);
  await remove(KnowledgeDocument, created.knowledgeDocuments);
  await remove(Notification, created.notifications);
  await remove(PharmacyOrder, created.pharmacyOrders);
  await remove(Prescription, created.prescriptions);
  await remove(MedicalRecord, created.records);
  await remove(LabReport, created.labs);
  await remove(Invoice, created.invoices);
  await remove(Admission, created.admissions);
  await remove(Appointment, created.appointments);
  await remove(Medicine, created.medicines);
  await remove(InventoryItem, created.inventory);
  await remove(Patient, created.patients);
  await remove(Doctor, created.doctors);
  await remove(User, created.users);
}

async function run() {
  await mongoose.connect(env.mongoUri);
  let completed = false;
  try {
    await api('Health', 'GET', '/health');

    let admin = await User.findOne({ role: 'admin', isActive: true });
    if (!admin) {
      admin = await userRepository.create({
        fullName: `E2E Bootstrap Admin ${runId}`,
        email: `e2e-admin-${runId}@example.com`,
        password: testPassword,
        role: 'admin',
        isEmailVerified: true,
      });
      remember('users', admin._id);
    }
    const adminToken = await tokenFor(admin);

    await api('Admin overview', 'GET', '/admin/overview', { token: adminToken });
    await api('Admin list users', 'GET', '/admin/users?limit=5', { token: adminToken });
    await api('MCP tool registry', 'GET', '/mcp/tools', { token: adminToken });

    const patientEmail = `e2e-patient-${runId}@example.com`;
    await api('Public patient registration', 'POST', '/auth/register', {
      expected: [201],
      body: {
        fullName: `E2E Patient ${runId}`,
        email: patientEmail,
        password: testPassword,
        role: 'patient',
      },
    });
    let patientUser = await setKnownOtp(patientEmail, 'registration');
    remember('users', patientUser._id);
    const patientProfileDoc = await Patient.findOne({ userId: patientUser._id });
    remember('patients', patientProfileDoc?._id);

    await api('Registration OTP verification', 'POST', '/auth/verify-otp', {
      body: { email: patientEmail, code: otpCode, purpose: 'registration' },
    });
    await api('Login credentials', 'POST', '/auth/login', {
      body: { email: patientEmail, password: testPassword },
    });
    await api('OTP resend cooldown', 'POST', '/auth/resend-otp', {
      expected: [400],
      body: { email: patientEmail, purpose: 'login' },
    });
    await setKnownOtp(patientEmail, 'login');
    let auth = await api('Login OTP verification', 'POST', '/auth/verify-otp', {
      body: { email: patientEmail, code: otpCode, purpose: 'login' },
    });

    await api('Forgot password request', 'POST', '/auth/forgot-password', {
      body: { email: patientEmail },
    });
    await setKnownOtp(patientEmail, 'password_reset');
    const reset = await api('Forgot password OTP verification', 'POST', '/auth/verify-forgot-password-otp', {
      body: { email: patientEmail, otp: otpCode },
    });
    await api('Reset password', 'POST', '/auth/reset-password', {
      body: {
        resetToken: reset.resetToken,
        newPassword: resetPassword,
        confirmPassword: resetPassword,
      },
    });
    await api('Reset token single use', 'POST', '/auth/reset-password', {
      expected: [401],
      body: {
        resetToken: reset.resetToken,
        newPassword: testPassword,
        confirmPassword: testPassword,
      },
    });
    await api('Login after password reset', 'POST', '/auth/login', {
      body: { email: patientEmail, password: resetPassword },
    });
    await setKnownOtp(patientEmail, 'login');
    auth = await api('Post-reset login OTP', 'POST', '/auth/verify-otp', {
      body: { email: patientEmail, code: otpCode, purpose: 'login' },
    });
    const refreshed = await api('Refresh token rotation', 'POST', '/auth/refresh', {
      body: { refreshToken: auth.refreshToken },
    });
    let patientToken = refreshed.accessToken;
    await api('Authenticated user profile', 'GET', '/auth/me', { token: patientToken });

    const doctor = await createAdminManagedUser(adminToken, 'doctor');
    const receptionist = await createAdminManagedUser(adminToken, 'receptionist');
    const nurse = await createAdminManagedUser(adminToken, 'nurse');
    const pharmacist = await createAdminManagedUser(adminToken, 'pharmacist');
    const labTechnician = await createAdminManagedUser(adminToken, 'labTechnician');
    const disposable = await createAdminManagedUser(adminToken, 'nurse', 'nurse-disposable');

    const doctorProfileDoc = await Doctor.findOne({ userId: doctor.id });
    remember('doctors', doctorProfileDoc?._id);

    await api('Admin updates user', 'PATCH', `/admin/users/${disposable.id}`, {
      token: adminToken,
      body: { fullName: `E2E Updated Nurse ${runId}` },
    });
    await api('Admin deactivates user', 'DELETE', `/admin/users/${disposable.id}`, {
      token: adminToken,
    });

    await api('Patient updates profile', 'PATCH', '/patients/me', {
      token: patientToken,
      body: {
        gender: 'other', bloodGroup: 'O+', contactNumber: '9000000000',
        address: `E2E address ${runId}`, allergies: ['none'],
        emergencyContact: { name: 'E2E Contact', phone: '9000000001', relation: 'friend' },
      },
    });
    const patientProfile = await api('Patient gets own profile', 'GET', '/patients/me', {
      token: patientToken,
    });
    const patientId = patientProfile.id;

    const scheduledAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    scheduledAt.setHours(10, 0, 0, 0);
    const dayCodes = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    await api('Doctor updates profile', 'PATCH', '/doctors/me', {
      token: doctor.token,
      body: {
        specialization: 'General Medicine', department: 'Medicine',
        qualifications: ['MBBS'], consultationFee: 500,
        availability: [{ day: dayCodes[scheduledAt.getDay()], startTime: '00:00', endTime: '23:59' }],
      },
    });
    const doctorProfile = await api('Doctor gets own profile', 'GET', '/doctors/me', {
      token: doctor.token,
    });
    const doctorId = doctorProfile.id;
    await api('Patient lists doctors', 'GET', '/doctors?limit=10', { token: patientToken });
    await api('Patient gets doctor', 'GET', `/doctors/${doctorId}`, { token: patientToken });
    await api('Receptionist lists patients', 'GET', '/patients?limit=10', { token: receptionist.token });
    await api('Doctor gets patient', 'GET', `/patients/${patientId}`, { token: doctor.token });

    const appointment = await api('Patient creates appointment', 'POST', '/appointments', {
      token: patientToken,
      expected: [201],
      body: {
        doctorId, scheduledAt: scheduledAt.toISOString(), reasonForVisit: `E2E checkup ${runId}`,
      },
    });
    remember('appointments', appointment.id);
    await api('Patient lists appointments', 'GET', '/appointments/mine', { token: patientToken });
    await api('Receptionist lists appointments', 'GET', '/appointments?limit=10', { token: receptionist.token });
    await api('Doctor confirms appointment', 'PATCH', `/appointments/${appointment.id}/status`, {
      token: doctor.token, body: { status: 'confirmed' },
    });
    await api('Doctor completes appointment', 'PATCH', `/appointments/${appointment.id}/status`, {
      token: doctor.token, body: { status: 'completed' },
    });
    await api('Doctor lists own appointments', 'GET', '/appointments/mine', { token: doctor.token });

    const nextAppointmentTime = new Date(scheduledAt);
    nextAppointmentTime.setHours(12, 0, 0, 0);
    const nextAppointment = await api('Receptionist creates future appointment', 'POST', '/appointments', {
      token: receptionist.token,
      expected: [201],
      body: {
        doctorId, patientId, scheduledAt: nextAppointmentTime.toISOString(),
        reasonForVisit: `E2E follow-up ${runId}`,
      },
    });
    remember('appointments', nextAppointment.id);

    const medicine = await api('Pharmacist creates medicine', 'POST', '/pharmacy/medicines', {
      token: pharmacist.token,
      expected: [201],
      body: {
        name: `E2E Medicine ${runId}`, genericName: 'Test medicine', manufacturer: 'E2E Labs',
        category: 'General', unitPrice: 25, stockQuantity: 100, reorderLevel: 10,
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    remember('medicines', medicine.id);
    await api('Pharmacist updates medicine', 'PATCH', `/pharmacy/medicines/${medicine.id}`, {
      token: pharmacist.token, body: { unitPrice: 30, stockQuantity: 120 },
    });
    await api('Pharmacist lists medicines', 'GET', '/pharmacy/medicines?limit=10', {
      token: pharmacist.token,
    });

    const record = await api('Doctor creates medical record', 'POST', '/medical-records', {
      token: doctor.token,
      expected: [201],
      body: {
        patientId, appointmentId: appointment.id, symptoms: ['fatigue'],
        diagnosis: 'E2E routine evaluation', notes: `Automated E2E record ${runId}`,
      },
    });
    remember('records', record.id);
    await api('Patient lists medical records', 'GET', `/medical-records/patient/${patientId}`, {
      token: patientToken,
    });
    await api('Doctor gets medical record', 'GET', `/medical-records/${record.id}`, {
      token: doctor.token,
    });

    const prescription = await api('Doctor creates prescription', 'POST', '/prescriptions', {
      token: doctor.token,
      expected: [201],
      body: {
        medicalRecordId: record.id,
        medicines: [{ medicineId: medicine.id, dosage: '1 tablet', frequency: 'once daily', durationDays: 5 }],
      },
    });
    remember('prescriptions', prescription.id);
    await api('Patient lists prescriptions', 'GET', `/prescriptions/patient/${patientId}`, {
      token: patientToken,
    });
    await api('Pharmacist gets prescription', 'GET', `/prescriptions/${prescription.id}`, {
      token: pharmacist.token,
    });

    const pharmacyOrder = await api('Pharmacist dispenses prescription', 'POST', '/pharmacy/dispense', {
      token: pharmacist.token,
      expected: [201],
      body: { prescriptionId: prescription.id, items: [{ medicineId: medicine.id, quantity: 2 }] },
    });
    remember('pharmacyOrders', pharmacyOrder.id);
    await api('Admin lists pharmacy orders', 'GET', '/pharmacy/orders?limit=10', { token: adminToken });

    const lab = await api('Doctor creates lab order', 'POST', '/lab/orders', {
      token: doctor.token,
      expected: [201],
      body: { patientId, testType: 'Complete Blood Count' },
    });
    remember('labs', lab.id);
    await api('Lab technician submits results', 'PATCH', `/lab/orders/${lab.id}/results`, {
      token: labTechnician.token,
      body: {
        results: [{ parameter: 'Hemoglobin', value: '14', unit: 'g/dL', referenceRange: '12-16' }],
      },
    });
    await api('Patient lists lab reports', 'GET', `/lab/reports/patient/${patientId}`, {
      token: patientToken,
    });

    const invoice = await api('Receptionist creates invoice', 'POST', '/billing/invoices', {
      token: receptionist.token,
      expected: [201],
      body: {
        patientId,
        relatedTo: { type: 'appointment', refId: appointment.id },
        lineItems: [{ description: 'E2E consultation', amount: 500 }],
      },
    });
    remember('invoices', invoice.id);
    await api('Patient lists invoices', 'GET', `/billing/invoices/patient/${patientId}`, {
      token: patientToken,
    });
    await api('Receptionist records partial payment', 'PATCH', `/billing/invoices/${invoice.id}/pay`, {
      token: receptionist.token, body: { amount: 200 },
    });

    const inventory = await api('Nurse creates inventory item', 'POST', '/inventory/items', {
      token: nurse.token,
      expected: [201],
      body: {
        name: `E2E Gloves ${runId}`, category: 'PPE', unit: 'box',
        quantityInStock: 20, reorderLevel: 5, location: 'E2E store',
      },
    });
    remember('inventory', inventory.id);
    await api('Admin updates inventory', 'PATCH', `/inventory/items/${inventory.id}`, {
      token: adminToken, body: { quantityInStock: 25 },
    });
    await api('Nurse lists inventory', 'GET', '/inventory/items?limit=10', { token: nurse.token });

    const admission = await api('Nurse admits patient', 'POST', '/admissions', {
      token: nurse.token,
      expected: [201],
      body: {
        patientId, doctorId, wardType: `E2E Ward ${runId}`,
        bedNumber: `BED-${runId}`, expectedDischargeAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    });
    remember('admissions', admission.id);
    await api('Patient lists admissions', 'GET', `/admissions/patient/${patientId}`, {
      token: patientToken,
    });
    await api('Doctor discharges patient', 'PATCH', `/admissions/${admission.id}/discharge`, {
      token: doctor.token,
    });

    const notification = await notificationRepository.create({
      userId: patientUser._id,
      type: 'system',
      title: `E2E notification ${runId}`,
      message: 'Automated API test notification',
    });
    remember('notifications', notification._id);
    await api('Patient lists notifications', 'GET', '/notifications/mine?isRead=false', {
      token: patientToken,
    });
    await api('Patient marks notification read', 'PATCH', `/notifications/${notification._id}/read`, {
      token: patientToken,
    });

    const knowledge = await api('Admin ingests RAG document', 'POST', '/rag/documents', {
      token: adminToken,
      expected: [201],
      body: {
        title: `E2E Diabetes Guide ${runId}`,
        source: `MediCore E2E Clinical Guide ${runId}`,
        mimeType: 'text/plain',
        content: 'Diabetes is a chronic condition involving blood glucose regulation. Common management principles include clinician-guided monitoring, nutrition, activity, and prescribed medicines. This educational text is general information and not individual medical advice.'.repeat(3),
        metadata: { runId, trusted: true },
      },
    });
    remember('knowledgeDocuments', knowledge.id);
    await api('Admin lists RAG documents', 'GET', '/rag/documents?limit=10', { token: adminToken });

    const ragChat = await api('AI chat with RAG', 'POST', '/ai/chat', {
      token: patientToken, body: { message: 'What is diabetes?' },
    });
    if (ragChat.retrievalMode !== 'rag') throw new Error('AI RAG chat did not use RAG mode');
    const mcpChat = await api('AI chat with MCP', 'POST', '/ai/chat', {
      token: patientToken, body: { message: 'What is my next appointment?' },
    });
    if (mcpChat.retrievalMode !== 'mcp') throw new Error('AI appointment chat did not use MCP mode');
    const bothChat = await api('AI chat with MCP + RAG', 'POST', '/ai/chat', {
      token: patientToken, body: { message: 'Explain my latest lab report' },
    });
    if (bothChat.retrievalMode !== 'both') throw new Error('AI lab explanation did not use combined mode');
    await api('AI clears conversation', 'DELETE', '/ai/conversation', { token: patientToken });

    await api('Patient isolation check', 'GET', `/medical-records/patient/${new mongoose.Types.ObjectId()}`, {
      token: patientToken, expected: [403],
    });
    await api('Role authorization check', 'GET', '/admin/overview', {
      token: nurse.token, expected: [403],
    });

    await api('Change password', 'POST', '/auth/change-password', {
      token: patientToken,
      body: {
        currentPassword: resetPassword,
        newPassword: changedPassword,
        confirmPassword: changedPassword,
      },
    });
    await api('Login after password change', 'POST', '/auth/login', {
      body: { email: patientEmail, password: changedPassword },
    });
    await setKnownOtp(patientEmail, 'login');
    auth = await api('Post-change login OTP', 'POST', '/auth/verify-otp', {
      body: { email: patientEmail, code: otpCode, purpose: 'login' },
    });
    patientToken = auth.accessToken;
    await api('Logout', 'POST', '/auth/logout', { token: patientToken });
    await api('Revoked refresh rejected', 'POST', '/auth/refresh', {
      expected: [401], body: { refreshToken: auth.refreshToken },
    });

    await api('Admin deletes RAG document', 'DELETE', `/rag/documents/${knowledge.id}`, {
      token: adminToken,
    });
    completed = true;
  } finally {
    await cleanup();
    await mongoose.disconnect();
  }

  const passed = results.filter((item) => item.pass).length;
  console.log(JSON.stringify({
    runId,
    completed,
    passed,
    total: results.length,
    failed: results.filter((item) => !item.pass),
    keptData: KEEP_DATA,
    endpoints: results,
  }, null, 2));
}

run().catch((error) => {
  console.error(JSON.stringify({ runId, completed: false, error: error.message }, null, 2));
  process.exit(1);
});
