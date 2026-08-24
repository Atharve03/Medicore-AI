const validate = require('../utils/validate');
const {
  createMedicineSchema,
  updateMedicineSchema,
  dispenseSchema,
} = require('../modules/pharmacy/pharmacy.validators');

function buildRes() {
  return {};
}

describe('pharmacy validators', () => {
  describe('createMedicineSchema', () => {
    it('accepts a valid medicine', () => {
      const req = {
        body: { name: 'Paracetamol', unitPrice: 2.5, stockQuantity: 100 },
      };
      const next = jest.fn();

      validate(createMedicineSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a negative unitPrice', () => {
      const req = { body: { name: 'Paracetamol', unitPrice: -1 } };
      const next = jest.fn();

      validate(createMedicineSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rejects a past expiryDate', () => {
      const req = {
        body: { name: 'Paracetamol', unitPrice: 2.5, expiryDate: '2000-01-01' },
      };
      const next = jest.fn();

      validate(createMedicineSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });

  describe('updateMedicineSchema', () => {
    it('rejects an empty update', () => {
      const req = { body: {} };
      const next = jest.fn();

      validate(updateMedicineSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('accepts a restock-only update', () => {
      const req = { body: { stockQuantity: 250 } };
      const next = jest.fn();

      validate(updateMedicineSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('dispenseSchema', () => {
    it('accepts a valid dispense request', () => {
      const req = {
        body: {
          prescriptionId: '64f1a2b3c4d5e6f7a8b9c0d1',
          items: [{ medicineId: '64f1a2b3c4d5e6f7a8b9c0d2', quantity: 10 }],
        },
      };
      const next = jest.fn();

      validate(dispenseSchema)(req, buildRes(), next);

      expect(next).toHaveBeenCalledWith();
    });

    it('rejects a dispense request with zero items', () => {
      const req = {
        body: { prescriptionId: '64f1a2b3c4d5e6f7a8b9c0d1', items: [] },
      };
      const next = jest.fn();

      validate(dispenseSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });

    it('rejects a quantity of zero', () => {
      const req = {
        body: {
          prescriptionId: '64f1a2b3c4d5e6f7a8b9c0d1',
          items: [{ medicineId: '64f1a2b3c4d5e6f7a8b9c0d2', quantity: 0 }],
        },
      };
      const next = jest.fn();

      validate(dispenseSchema)(req, buildRes(), next);

      expect(next.mock.calls[0][0].statusCode).toBe(400);
    });
  });
});

describe('Medicine.toClientJSON lowStock flag', () => {
  const { Medicine } = require('../models/medicine.model');

  it('flags lowStock true when stock is at or below reorderLevel', () => {
    const medicine = new Medicine({
      name: 'Amoxicillin',
      unitPrice: 5,
      stockQuantity: 5,
      reorderLevel: 10,
    });
    expect(medicine.toClientJSON().lowStock).toBe(true);
  });

  it('flags lowStock false when stock is comfortably above reorderLevel', () => {
    const medicine = new Medicine({
      name: 'Amoxicillin',
      unitPrice: 5,
      stockQuantity: 200,
      reorderLevel: 10,
    });
    expect(medicine.toClientJSON().lowStock).toBe(false);
  });
});
