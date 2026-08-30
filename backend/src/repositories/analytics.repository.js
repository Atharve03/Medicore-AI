const { User } = require('../models/user.model');
const { Patient } = require('../models/patient.model');
const { Doctor } = require('../models/doctor.model');
const { Appointment } = require('../models/appointment.model');
const { Invoice } = require('../models/invoice.model');
const { Medicine } = require('../models/medicine.model');
const { InventoryItem } = require('../models/inventoryItem.model');
const { PharmacyOrder } = require('../models/pharmacyOrder.model');
const { LabReport } = require('../models/labReport.model');
const { Admission } = require('../models/admission.model');
const { Prescription } = require('../models/prescription.model');
const aiUsageRepository = require('./aiUsage.repository');

const match = (field, period, extra = {}) => ({ ...extra, [field]: { $gte: period.from, $lte: period.to } });
const distribution = (field) => [{ $group: { _id: `$${field}`, count: { $sum: 1 } } }, { $project: { _id: 0, label: { $ifNull: ['$_id', 'Unspecified'] }, count: 1 } }, { $sort: { count: -1 } }];
const daily = (field) => [{ $group: { _id: { $dateToString: { date: `$${field}`, format: '%Y-%m-%d', timezone: 'UTC' } }, count: { $sum: 1 } } }, { $project: { _id: 0, date: '$_id', count: 1 } }, { $sort: { date: 1 } }];

module.exports = {
  async overview(period) {
    const [patients, doctors, staff, appointments, activeAdmissions, prescriptions, labs, money, usersByRole] = await Promise.all([
      Patient.countDocuments(match('createdAt', period)), Doctor.countDocuments(), User.countDocuments({ role: { $nin: ['patient', 'doctor'] }, isActive: true }),
      Appointment.aggregate([{ $match: match('scheduledAt', period) }, ...distribution('status')]), Admission.countDocuments({ status: 'admitted' }),
      Prescription.countDocuments(match('createdAt', period)), LabReport.countDocuments(match('orderedAt', period)),
      Invoice.aggregate([{ $match: match('createdAt', period) }, { $group: { _id: null, billed: { $sum: '$totalAmount' }, paid: { $sum: '$paidAmount' } } }]),
      User.aggregate([...distribution('role')]),
    ]);
    const byStatus = Object.fromEntries(appointments.map((x) => [x.label, x.count])); const billed = money[0]?.billed || 0; const paid = money[0]?.paid || 0;
    return { totalPatients: patients, totalDoctors: doctors, totalStaff: staff, totalAppointments: appointments.reduce((n, x) => n + x.count, 0), appointmentsByStatus: byStatus, usersByRole, byType: usersByRole, activeAdmissions, totalPrescriptions: prescriptions, totalLaboratoryReports: labs, totalBilled: billed, totalRevenue: paid, outstandingAmount: billed - paid };
  },
  appointments(period, doctorId) { const base = match('scheduledAt', period, doctorId ? { doctorId } : {}); return Promise.all([Appointment.aggregate([{ $match: base }, ...daily('scheduledAt')]), Appointment.aggregate([{ $match: base }, ...distribution('status')]), Appointment.countDocuments(base)]).then(([trend, byStatus, total]) => ({ total, trend, byStatus })); },
  patients(period) { return Promise.all([Patient.countDocuments(), Patient.countDocuments(match('createdAt', period)), Patient.aggregate([{ $match: match('createdAt', period) }, ...daily('createdAt')]), Patient.aggregate([...distribution('gender')])]).then(([total, newPatients, registrationTrend, byGender]) => ({ total, newPatients, registrationTrend, byGender })); },
  doctors(period) { return Appointment.aggregate([{ $match: match('scheduledAt', period) }, { $group: { _id: '$doctorId', appointments: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } } } }, { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctor' } }, { $unwind: '$doctor' }, { $project: { _id: 0, doctor: '$doctor.fullName', department: '$doctor.department', appointments: 1, completed: 1, cancelled: 1 } }, { $sort: { appointments: -1 } }]); },
  billing(period) { return Promise.all([Invoice.aggregate([{ $match: match('createdAt', period) }, { $group: { _id: null, billed: { $sum: '$totalAmount' }, paid: { $sum: '$paidAmount' }, count: { $sum: 1 } } }]), Invoice.aggregate([{ $match: match('createdAt', period) }, ...distribution('status')])]).then(([rows, byStatus]) => { const x = rows[0] || {}; return { invoiceCount: x.count || 0, totalBilled: x.billed || 0, totalPaid: x.paid || 0, outstanding: (x.billed || 0) - (x.paid || 0), byStatus }; }); },
  pharmacy(period) { return Promise.all([Medicine.countDocuments(), Medicine.countDocuments({ $expr: { $lte: ['$stockQuantity', '$reorderLevel'] } }), Medicine.aggregate([{ $group: { _id: null, value: { $sum: { $multiply: ['$stockQuantity', '$unitPrice'] } } } }]), PharmacyOrder.aggregate([{ $match: match('dispensedAt', period) }, { $unwind: '$items' }, { $group: { _id: '$items.medicineId', quantity: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.quantity', '$items.unitPrice'] } } } }, { $sort: { quantity: -1 } }, { $limit: 10 }]), InventoryItem.countDocuments({ $expr: { $lte: ['$quantityInStock', '$reorderLevel'] } })]).then(([medicines, lowStockMedicines, value, topUsage, lowStockInventory]) => ({ medicines, lowStockMedicines, lowStockInventory, inventoryValue: value[0]?.value || 0, topUsage })); },
  laboratory(period) { return Promise.all([LabReport.countDocuments(match('orderedAt', period)), LabReport.aggregate([{ $match: match('orderedAt', period) }, ...distribution('status')]), LabReport.aggregate([{ $match: match('orderedAt', period) }, ...distribution('testType')]), LabReport.aggregate([{ $match: match('orderedAt', period) }, ...daily('orderedAt')])]).then(([total, byStatus, byType, trend]) => ({ total, byStatus, byType, trend })); },
  admissions(period) { return Promise.all([Admission.countDocuments({ status: 'admitted' }), Admission.aggregate([{ $match: match('admittedAt', period) }, ...distribution('status')]), Admission.aggregate([{ $match: match('admittedAt', period) }, ...distribution('wardType')]), Admission.aggregate([{ $match: match('admittedAt', period) }, ...daily('admittedAt')])]).then(([active, byStatus, byWard, trend]) => ({ active, byStatus, byWard, trend })); },
  departments(period) { return Appointment.aggregate([{ $match: match('scheduledAt', period) }, { $lookup: { from: 'doctors', localField: 'doctorId', foreignField: '_id', as: 'doctor' } }, { $unwind: '$doctor' }, { $group: { _id: { $ifNull: ['$doctor.department', 'Unspecified'] }, appointments: { $sum: 1 }, completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }, doctors: { $addToSet: '$doctorId' } } }, { $project: { _id: 0, department: '$_id', appointments: 1, completed: 1, doctorCount: { $size: '$doctors' } } }, { $sort: { appointments: -1 } }]); },
  async aiUsage(period) { const [providers,trend]=await Promise.all([aiUsageRepository.summary(period),aiUsageRepository.trend(period)]); const totals=providers.reduce((a,x)=>({requests:a.requests+x.requests,successful:a.successful+x.successful,failed:a.failed+x.failed,totalTokens:a.totalTokens+x.totalTokens,cost:a.cost+x.cost}),{requests:0,successful:0,failed:0,totalTokens:0,cost:0}); return {...totals,costCurrency:'INR',providers,trend}; },
};
