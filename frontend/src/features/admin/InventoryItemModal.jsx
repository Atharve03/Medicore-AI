import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { inventoryApi } from '../../api/inventory.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function InventoryItemModal({ open, onClose, item, onSaved }) {
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm();

  useEffect(() => {
    if (open) {
      reset(
        item
          ? {
              name: item.name,
              category: item.category || '',
              unit: item.unit,
              quantityInStock: item.quantityInStock,
              reorderLevel: item.reorderLevel,
              location: item.location || '',
            }
          : { name: '', category: '', unit: '', quantityInStock: 0, reorderLevel: 10, location: '' }
      );
      setServerError(null);
    }
  }, [open, item, reset]);

  async function onSubmit(values) {
    setServerError(null);
    const payload = {
      ...values,
      quantityInStock: Number(values.quantityInStock),
      reorderLevel: Number(values.reorderLevel),
    };
    try {
      if (item) {
        await inventoryApi.updateItem(item.id, payload);
      } else {
        await inventoryApi.createItem(payload);
      }
      onSaved();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not save this item.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={item ? 'Edit item' : 'Add inventory item'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="name"
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField id="category" label="Category" {...register('category')} />
          <TextField
            id="unit"
            label="Unit"
            placeholder="box, piece, liter"
            error={errors.unit?.message}
            {...register('unit', { required: 'Unit is required' })}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <TextField
            id="quantityInStock"
            label="Quantity in stock"
            type="number"
            {...register('quantityInStock', { required: true, min: 0 })}
          />
          <TextField
            id="reorderLevel"
            label="Reorder level"
            type="number"
            {...register('reorderLevel', { min: 0 })}
          />
        </div>
        <TextField id="location" label="Location" {...register('location')} />

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {item ? 'Save changes' : 'Add item'}
        </Button>
      </form>
    </Modal>
  );
}
