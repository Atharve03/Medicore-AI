const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPaginatedResult } = require('../../utils/pagination');
const inventoryRepository = require('../../repositories/inventory.repository');

async function createItem(payload) {
  const data = { ...payload };
  if (data.quantityInStock > 0) {
    data.lastRestockedAt = new Date();
  }

  const item = await inventoryRepository.create(data);
  return item.toClientJSON();
}

/**
 * If this update raises quantityInStock above its previous value, that's a
 * restock — lastRestockedAt is stamped automatically rather than requiring
 * the caller to remember to set it themselves.
 */
async function updateItem(id, updates) {
  const existing = await inventoryRepository.findById(id);
  if (!existing) {
    throw ApiError.notFound('Inventory item not found');
  }

  const finalUpdates = { ...updates };
  if (
    typeof updates.quantityInStock === 'number' &&
    updates.quantityInStock > existing.quantityInStock
  ) {
    finalUpdates.lastRestockedAt = new Date();
  }

  const item = await inventoryRepository.updateById(id, finalUpdates);
  return item.toClientJSON();
}

async function listItems(query) {
  const { page, limit } = parsePagination(query);
  const { items, total } = await inventoryRepository.list({
    search: query.search,
    category: query.category,
    lowStockOnly: query.lowStockOnly,
    page,
    limit,
  });

  return buildPaginatedResult({
    items: items.map((i) => i.toClientJSON()),
    total,
    page,
    limit,
  });
}

module.exports = { createItem, updateItem, listItems };
