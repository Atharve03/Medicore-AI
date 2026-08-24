const { Appointment } = require('../models/appointment.model');

const ACTIVE_STATUSES = ['requested', 'confirmed'];

const appointmentRepository = {
  create(data) {
    return Appointment.create(data);
  },

  findById(id) {
    return Appointment.findById(id);
  },

  /**
   * Two appointments for the same doctor "conflict" if their scheduled
   * times fall within `windowMinutes` of each other and both are still
   * active (requested/confirmed). Used to prevent double-booking a slot.
   */
  findConflicting({ doctorId, scheduledAt, windowMinutes, excludeId }) {
    const windowMs = windowMinutes * 60 * 1000;
    const from = new Date(scheduledAt.getTime() - windowMs);
    const to = new Date(scheduledAt.getTime() + windowMs);

    const filter = {
      doctorId,
      status: { $in: ACTIVE_STATUSES },
      scheduledAt: { $gt: from, $lt: to },
    };
    if (excludeId) filter._id = { $ne: excludeId };

    return Appointment.findOne(filter);
  },

  async listForPatient({ patientId, status, page = 1, limit = 20 }) {
    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Appointment.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(limit),
      Appointment.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  async listForDoctor({ doctorId, status, page = 1, limit = 20 }) {
    const filter = { doctorId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Appointment.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(limit),
      Appointment.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  async listAll({ doctorId, patientId, status, from, to, page = 1, limit = 20 }) {
    const filter = {};
    if (doctorId) filter.doctorId = doctorId;
    if (patientId) filter.patientId = patientId;
    if (status) filter.status = status;
    if (from || to) {
      filter.scheduledAt = {};
      if (from) filter.scheduledAt.$gte = from;
      if (to) filter.scheduledAt.$lte = to;
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Appointment.find(filter).sort({ scheduledAt: -1 }).skip(skip).limit(limit),
      Appointment.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  updateStatus(id, status) {
    return Appointment.findByIdAndUpdate(id, { status }, { new: true });
  },
};

module.exports = appointmentRepository;
