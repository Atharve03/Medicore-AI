const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const appointmentRepository = require('../../repositories/appointment.repository');
const patientRepository = require('../../repositories/patient.repository');
const doctorRepository = require('../../repositories/doctor.repository');

// Used only to detect double-booking conflicts (no separate duration field
// exists in the DB design); two active appointments for the same doctor
// within this many minutes of each other are treated as a conflict.
const APPOINTMENT_DURATION_MINUTES = 30;

const JS_DAY_TO_CODE = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

// requested -> confirmed | cancelled
// confirmed -> completed | cancelled | noShow
// completed | cancelled | noShow are terminal
const ALLOWED_TRANSITIONS = {
  requested: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled', 'noShow'],
  completed: [],
  cancelled: [],
  noShow: [],
};

function assertWithinDoctorAvailability(doctor, scheduledAt) {
  if (!doctor.availability || doctor.availability.length === 0) {
    throw ApiError.badRequest(
      'This doctor has not published their availability yet'
    );
  }

  const dayCode = JS_DAY_TO_CODE[scheduledAt.getDay()];
  const hh = String(scheduledAt.getHours()).padStart(2, '0');
  const mm = String(scheduledAt.getMinutes()).padStart(2, '0');
  const time = `${hh}:${mm}`;

  const fitsASlot = doctor.availability.some(
    (slot) => slot.day === dayCode && time >= slot.startTime && time < slot.endTime
  );

  if (!fitsASlot) {
    throw ApiError.badRequest(
      'Requested time is outside the doctor\'s published availability'
    );
  }
}

async function createAppointment(payload, requestingUser) {
  const { doctorId, scheduledAt, reasonForVisit } = payload;

  const doctor = await doctorRepository.findById(doctorId);
  if (!doctor) {
    throw ApiError.notFound('Doctor not found');
  }

  let patientId;
  if (requestingUser.role === 'patient') {
    const patient = await patientRepository.findByUserId(requestingUser.id);
    if (!patient) {
      throw ApiError.notFound('Patient profile not found');
    }
    patientId = patient._id;
  } else {
    // receptionist booking on a patient's behalf
    if (!payload.patientId) {
      throw ApiError.badRequest('patientId is required when booking as staff');
    }
    const patient = await patientRepository.findById(payload.patientId);
    if (!patient) {
      throw ApiError.notFound('Patient not found');
    }
    patientId = patient._id;
  }

  const scheduledDate = new Date(scheduledAt);
  assertWithinDoctorAvailability(doctor, scheduledDate);

  const conflict = await appointmentRepository.findConflicting({
    doctorId,
    scheduledAt: scheduledDate,
    windowMinutes: APPOINTMENT_DURATION_MINUTES,
  });
  if (conflict) {
    throw ApiError.conflict('This doctor already has an appointment near that time');
  }

  const appointment = await appointmentRepository.create({
    patientId,
    doctorId,
    scheduledAt: scheduledDate,
    reasonForVisit: reasonForVisit || null,
    createdBy: requestingUser.id,
  });

  return appointment.toClientJSON();
}

async function listMine(requestingUser, query) {
  const { page, limit } = parsePagination(query);

  let result;
  if (requestingUser.role === 'patient') {
    const patient = await patientRepository.findByUserId(requestingUser.id);
    if (!patient) throw ApiError.notFound('Patient profile not found');
    result = await appointmentRepository.listForPatient({
      patientId: patient._id,
      status: query.status,
      page,
      limit,
    });
  } else {
    // doctor
    const doctor = await doctorRepository.findByUserId(requestingUser.id);
    if (!doctor) throw ApiError.notFound('Doctor profile not found');
    result = await appointmentRepository.listForDoctor({
      doctorId: doctor._id,
      status: query.status,
      page,
      limit,
    });
  }

  return buildPaginatedResult({
    items: result.items.map((a) => a.toClientJSON()),
    total: result.total,
    page,
    limit,
  });
}

async function listAll(query) {
  const { page, limit } = parsePagination(query);
  const result = await appointmentRepository.listAll({
    doctorId: query.doctorId,
    patientId: query.patientId,
    status: query.status,
    from: query.from ? new Date(query.from) : undefined,
    to: query.to ? new Date(query.to) : undefined,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: result.items.map((a) => a.toClientJSON()),
    total: result.total,
    page,
    limit,
  });
}

async function updateStatus(id, nextStatus) {
  const appointment = await appointmentRepository.findById(id);
  if (!appointment) {
    throw ApiError.notFound('Appointment not found');
  }

  const allowed = ALLOWED_TRANSITIONS[appointment.status] || [];
  if (!allowed.includes(nextStatus)) {
    throw ApiError.badRequest(
      `Cannot transition appointment from '${appointment.status}' to '${nextStatus}'`
    );
  }

  const updated = await appointmentRepository.updateStatus(id, nextStatus);
  return updated.toClientJSON();
}

/**
 * Cancellation is just a status transition to 'cancelled' — the document is
 * never removed, preserving history for billing/analytics in later phases.
 */
async function cancelAppointment(id) {
  return updateStatus(id, 'cancelled');
}

module.exports = {
  createAppointment,
  listMine,
  listAll,
  updateStatus,
  cancelAppointment,
  // Exported for unit testing pure logic without a database.
  ALLOWED_TRANSITIONS,
  APPOINTMENT_DURATION_MINUTES,
  assertWithinDoctorAvailability,
};
