const validate = require('../utils/validate');
const {
  createItemSchema,
  updateItemSchema,
  listItemsQuerySchema,
} = require('../modules/inventory/inventory.validators');
const { InventoryItem } = require('../models/inventoryItem.model');

function buildRes() {
  return {};
}

describe('inventory validators', () => {
  it('accepts a valid item creation payload', () => {
    const req = {
      body: { name: 'Surgical Gloves', unit: 'box', quantityInStock: 50 },
    };
    const next = jest.fn();

    validate(createItemSchema)(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
  });

  it('rejects an item missing unit', () => {
    const req = { body: { name: 'Surgical Gloves' } };
    const next = jest.fn();

    validate(createItemSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('rejects an empty update body', () => {
    const req = { body: {} };
    const next = jest.fn();

    validate(updateItemSchema)(req, buildRes(), next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });

  it('coerces lowStockOnly query string to a boolean', () => {
    const req = { query: { lowStockOnly: 'true' } };
    const next = jest.fn();

    validate(listItemsQuerySchema, 'query')(req, buildRes(), next);

    expect(next).toHaveBeenCalledWith();
    expect(req.query.lowStockOnly).toBe(true);
  });
});

describe('InventoryItem.toClientJSON lowStock flag', () => {
  it('flags lowStock true when at or below reorderLevel', () => {
    const item = new InventoryItem({
      name: 'IV Drip Sets',
      unit: 'piece',
      quantityInStock: 3,
      reorderLevel: 10,
    });
    expect(item.toClientJSON().lowStock).toBe(true);
  });

  it('flags lowStock false when comfortably above reorderLevel', () => {
    const item = new InventoryItem({
      name: 'IV Drip Sets',
      unit: 'piece',
      quantityInStock: 100,
      reorderLevel: 10,
    });
    expect(item.toClientJSON().lowStock).toBe(false);
  });
});
