const { MedicalRecord } = require('../models/medicalRecord.model');

const medicalRecordRepository = {
  create(data) {
    return MedicalRecord.create(data);
  },

  findById(id) {
    return MedicalRecord.findById(id);
  },

  async listByPatient({ patientId, page = 1, limit = 20 }) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      MedicalRecord.find({ patientId })
        .sort({ visitDate: -1 })
        .skip(skip)
        .limit(limit),
      MedicalRecord.countDocuments({ patientId }),
    ]);
    return { items, total, page, limit };
  },
};

module.exports = medicalRecordRepository;
