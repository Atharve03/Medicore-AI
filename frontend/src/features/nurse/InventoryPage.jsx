import { useCallback, useState } from 'react';
import { Boxes, Plus, AlertTriangle } from 'lucide-react';

import { inventoryApi } from '../../api/inventory.api.js';
import { useFetch } from '../../hooks/useFetch.js';
import Card from '../../components/common/Card.jsx';
import Button from '../../components/common/Button.jsx';
import EmptyState from '../../components/common/EmptyState.jsx';
import InventoryItemModal from '../admin/InventoryItemModal.jsx';

export default function NurseInventoryPage() {
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchItems = useCallback(
    () => inventoryApi.listItems({ lowStockOnly: lowStockOnly || undefined, limit: 100 }),
    [lowStockOnly]
  );
  const { data, loading, error, refetch } = useFetch(fetchItems, [lowStockOnly]);
  const items = data?.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-semibold text-ink-light dark:text-ink-dark">
            Inventory
          </h2>
          <p className="mt-1 text-sm text-ink-light/60 dark:text-ink-dark/60">
            Log supply receipts. Corrections are made by an admin.
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" /> Add item
        </Button>
      </div>

      <label className="flex w-fit items-center gap-2 text-sm text-ink-light dark:text-ink-dark">
        <input
          type="checkbox"
          checked={lowStockOnly}
          onChange={(e) => setLowStockOnly(e.target.checked)}
          className="rounded border-clinical-300"
        />
        Show low stock only
      </label>

      {loading && <p className="text-sm text-ink-light/50">Loading…</p>}
      {error && <p className="text-sm text-critical-500">{error}</p>}

      {!loading && items.length === 0 && (
        <EmptyState icon={Boxes} title="No inventory items" />
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id}>
            <p className="font-medium text-ink-light dark:text-ink-dark">{item.name}</p>
            {item.category && (
              <p className="text-xs text-ink-light/50 dark:text-ink-dark/50">{item.category}</p>
            )}
            <p className="mt-3 font-data text-lg font-semibold text-ink-light dark:text-ink-dark">
              {item.quantityInStock} <span className="text-sm font-normal text-ink-light/50">{item.unit}</span>
            </p>
            {item.lowStock && (
              <p className="mt-1 flex items-center gap-1 text-xs font-medium text-alert-500">
                <AlertTriangle className="h-3.5 w-3.5" /> Below reorder level ({item.reorderLevel})
              </p>
            )}
          </Card>
        ))}
      </div>

      <InventoryItemModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        item={null}
        onSaved={() => {
          setCreateOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
