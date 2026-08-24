const validate = require('../utils/validate');
const {
  createInvoiceSchema,
  payInvoiceSchema,
} = require('../modules/billing/billing.validators');
const { Invoice } = require('../models/invoice.model');

function buildRes() {
  return {};
}

describe('billing validators', () => {
  it('accepts a valid invoice creation payload', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        relatedTo: { type: 'appointment', refId: '64f1a2b3c4d5e6f7a8b9c0d2' },
        lineItems: [{ description: 'Consultation fee', amount: 500 }],
      },
    };
    const next = jest.fn();

    validate(createInvoiceSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an invoice with zero line items', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        relatedTo: { type: 'appointment', refId: '64f1a2b3c4d5e6f7a8b9c0d2' },
        lineItems: [],
      },
    };
    const next = jest.fn();

    validate(createInvoiceSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an invalid relatedTo.type', () => {
    const req = {
      body: {
        patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
        relatedTo: { type: 'inventory', refId: '64f1a2b3c4d5e6f7a8b9c0d2' },
        lineItems: [{ description: 'Item', amount: 10 }],
      },
    };
    const next = jest.fn();

    validate(createInvoiceSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects a zero or negative payment amount', () => {
    const reqZero = { body: { amount: 0 } };
    const nextZero = jest.fn();
    validate(payInvoiceSchema)(reqZero, buildRes(), nextZero);
    expect(nextZero.mock.calls[0][0].statusCode).toBe(400);

    const reqNeg = { body: { amount: -50 } };
    const nextNeg = jest.fn();
    validate(payInvoiceSchema)(reqNeg, buildRes(), nextNeg);
    expect(nextNeg.mock.calls[0][0].statusCode).toBe(400);
  });
});

describe('Invoice.toClientJSON balanceDue', () => {
  it('computes the remaining balance', () => {
    const invoice = new Invoice({
      patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
      relatedTo: { type: 'appointment', refId: '64f1a2b3c4d5e6f7a8b9c0d2' },
      lineItems: [{ description: 'Consultation', amount: 500 }],
      totalAmount: 500,
      paidAmount: 200,
    });

    expect(invoice.toClientJSON().balanceDue).toBe(300);
  });

  it('never goes negative even if paidAmount somehow exceeds totalAmount', () => {
    const invoice = new Invoice({
      patientId: '64f1a2b3c4d5e6f7a8b9c0d1',
      relatedTo: { type: 'appointment', refId: '64f1a2b3c4d5e6f7a8b9c0d2' },
      lineItems: [{ description: 'Consultation', amount: 500 }],
      totalAmount: 500,
      paidAmount: 500,
    });

    expect(invoice.toClientJSON().balanceDue).toBe(0);
  });
});
