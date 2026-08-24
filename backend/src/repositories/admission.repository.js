const { Admission } = require('../models/admission.model');

const admissionRepository = {
  create(data) {
    return Admission.create(data);
  },

  findById(id) {
    return Admission.findById(id);
  },

  /**
   * A bed is occupied if there's any admission for this exact ward/bed
   * that's still status: 'admitted' (i.e. hasn't been discharged yet).
   */
  findOccupiedBed({ wardType, bedNumber }) {
    return Admission.findOne({ wardType, bedNumber, status: 'admitted' });
  },

  discharge(id) {
    return Admission.findByIdAndUpdate(
      id,
      { status: 'discharged', dischargedAt: new Date() },
      { new: true }
    );
  },

  async listByPatient({ patientId, status, page = 1, limit = 20 }) {
    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Admission.find(filter).sort({ admittedAt: -1 }).skip(skip).limit(limit),
      Admission.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },
};

module.exports = admissionRepository;
