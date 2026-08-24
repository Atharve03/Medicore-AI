import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { pharmacyApi } from '../../api/pharmacy.api.js';
import Modal from '../../components/common/Modal.jsx';
import TextField from '../../components/common/TextField.jsx';
import Button from '../../components/common/Button.jsx';

export default function MedicineModal({ open, onClose, medicine, onSaved }) {
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
        medicine
          ? {
              name: medicine.name,
              genericName: medicine.genericName || '',
              manufacturer: medicine.manufacturer || '',
              category: medicine.category || '',
              unitPrice: medicine.unitPrice,
              stockQuantity: medicine.stockQuantity,
              reorderLevel: medicine.reorderLevel,
            }
          : {
              name: '',
              genericName: '',
              manufacturer: '',
              category: '',
              unitPrice: '',
              stockQuantity: 0,
              reorderLevel: 10,
            }
      );
      setServerError(null);
    }
  }, [open, medicine, reset]);

  async function onSubmit(values) {
    setServerError(null);
    const payload = {
      ...values,
      unitPrice: Number(values.unitPrice),
      stockQuantity: Number(values.stockQuantity),
      reorderLevel: Number(values.reorderLevel),
    };
    try {
      if (medicine) {
        await pharmacyApi.updateMedicine(medicine.id, payload);
      } else {
        await pharmacyApi.createMedicine(payload);
      }
      onSaved();
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Could not save this medicine.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={medicine ? 'Edit medicine' : 'Add medicine'}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          id="name"
          label="Name"
          error={errors.name?.message}
          {...register('name', { required: 'Name is required' })}
        />
        <div className="grid grid-cols-2 gap-3">
          <TextField id="genericName" label="Generic name" {...register('genericName')} />
          <TextField id="manufacturer" label="Manufacturer" {...register('manufacturer')} />
        </div>
        <TextField id="category" label="Category" {...register('category')} />
        <div className="grid grid-cols-3 gap-3">
          <TextField
            id="unitPrice"
            label="Unit price"
            type="number"
            step="0.01"
            error={errors.unitPrice?.message}
            {...register('unitPrice', { required: true, min: 0 })}
          />
          <TextField
            id="stockQuantity"
            label="Stock"
            type="number"
            {...register('stockQuantity', { min: 0 })}
          />
          <TextField
            id="reorderLevel"
            label="Reorder at"
            type="number"
            {...register('reorderLevel', { min: 0 })}
          />
        </div>

        {serverError && (
          <p className="rounded-lg bg-critical-500/10 px-3 py-2 text-sm text-critical-500">
            {serverError}
          </p>
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {medicine ? 'Save changes' : 'Add medicine'}
        </Button>
      </form>
    </Modal>
  );
}
