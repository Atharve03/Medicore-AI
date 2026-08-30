const { Invoice } = require('../models/invoice.model');

const invoiceRepository = {
  create(data) {
    return Invoice.create(data);
  },

  findById(id) {
    return Invoice.findById(id);
  },

  async listByPatient({ patientId, status, page = 1, limit = 20 }) {
    const filter = { patientId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Invoice.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Invoice.countDocuments(filter),
    ]);
    return { items, total, page, limit };
  },

  /**
   * Records a payment atomically in a single aggregation-pipeline update:
   * the `$expr` filter guards against overpayment (rejects if
   * paidAmount + amount would exceed totalAmount) and the pipeline itself
   * both increments paidAmount and recomputes status in one document
   * operation, so two concurrent partial payments can't both succeed past
   * the invoice total. Returns null if the guard fails (overpayment or a
   * void/already-fully-paid invoice) or the invoice doesn't exist.
   */
  recordPayment(id, amount) {
    return Invoice.findOneAndUpdate(
      {
        _id: id,
        status: { $in: ['pending', 'partiallyPaid'] },
        $expr: { $lte: [{ $add: ['$paidAmount', amount] }, '$totalAmount'] },
      },
      [
        { $set: { paidAmount: { $add: ['$paidAmount', amount] } } },
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  { case: { $gte: ['$paidAmount', '$totalAmount'] }, then: 'paid' },
                  { case: { $gt: ['$paidAmount', 0] }, then: 'partiallyPaid' },
                ],
                default: 'pending',
              },
            },
          },
        },
      ],
      { new: true }
    );
  },

  /**
   * Hospital-wide revenue snapshot. Backs the Billing MCP server's
   * revenue-stats tool.
   */
  async getRevenueStats() {
    const [totals] = await Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: '$totalAmount' },
          totalCollected: { $sum: '$paidAmount' },
          invoiceCount: { $sum: 1 },
        },
      },
    ]);

    return {
      totalBilled: totals?.totalBilled || 0,
      totalCollected: totals?.totalCollected || 0,
      outstanding: (totals?.totalBilled || 0) - (totals?.totalCollected || 0),
      invoiceCount: totals?.invoiceCount || 0,
    };
  },
};

module.exports = invoiceRepository;
