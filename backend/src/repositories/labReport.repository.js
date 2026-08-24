const { LabReport } = require('../models/labReport.model');

const labReportRepository = {
  create(data) {
    return LabReport.create(data);
  },

  findById(id) {
    return LabReport.findById(id);
  },

  submitResults(id, { results, reportFileUrl }) {
    return LabReport.findByIdAndUpdate(
      id,
      {
        results,
        reportFileUrl: reportFileUrl || null,
        status: 'completed',
        resultAt: new Date(),
      },
      { new: true, runValidators: true }
    );
  },

  async listByPatient({ patientId, status, page = 1, limit = 20 }) {
    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      LabReport.find(filter).sort({ orderedAt: -1 }).skip(skip).limit(limit),
      LabReport.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  /**
   * The single most recent *completed* report for a patient. This is the
   * exact narrow, domain-scoped lookup the Laboratory MCP server (Phase 21)
   * calls for the "explain my latest blood report" AI flow — no other
   * collection or patient's data is ever touched to answer that question.
   */
  findLatestForPatient(patientId) {
    return LabReport.findOne({ patientId, status: 'completed' }).sort({
      resultAt: -1,
    });
  },
};

module.exports = labReportRepository;
