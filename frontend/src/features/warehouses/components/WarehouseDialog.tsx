import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Warehouse } from '../types';

interface WarehouseFormData {
  name: string;
  shortCode: string;
  address: string;
}

interface WarehouseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Warehouse | null;
  onSave: (data: WarehouseFormData) => void;
}

export function WarehouseDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: WarehouseDialogProps) {
  const isEditing = !!initialValues;

  const emptyForm: WarehouseFormData = { name: '', shortCode: '', address: '' };

  const [form, setForm] = useState<WarehouseFormData>(
    initialValues
      ? { name: initialValues.name, shortCode: initialValues.shortCode, address: initialValues.address }
      : emptyForm
  );
  const [errors, setErrors] = useState<Partial<WarehouseFormData>>({});

  // Sync form when dialog opens with new initialValues
  React.useEffect(() => {
    if (open) {
      setForm(
        initialValues
          ? { name: initialValues.name, shortCode: initialValues.shortCode, address: initialValues.address }
          : emptyForm
      );
      setErrors({});
    }
  }, [open, initialValues?.id]);

  function validate(): boolean {
    const e: Partial<WarehouseFormData> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.shortCode.trim()) e.shortCode = 'Short code is required.';
    else if (!/^[A-Za-z0-9]{1,8}$/.test(form.shortCode.trim()))
      e.shortCode = 'Short code must be 1–8 alphanumeric characters.';
    if (!form.address.trim()) e.address = 'Address is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({ name: form.name.trim(), shortCode: form.shortCode.trim().toUpperCase(), address: form.address.trim() });
    onOpenChange(false);
  }

  function handleChange(field: keyof WarehouseFormData) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Warehouse' : 'New Warehouse'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the warehouse details below.'
              : 'Fill in the details to create a new warehouse.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="warehouse-form" noValidate>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="wh-name">Name *</Label>
              <Input
                id="wh-name"
                placeholder="e.g. Main Warehouse"
                value={form.name}
                onChange={handleChange('name')}
                aria-describedby={errors.name ? 'wh-name-error' : undefined}
              />
              {errors.name && (
                <p id="wh-name-error" className="text-xs text-danger">{errors.name}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="wh-code">Short Code *</Label>
              <Input
                id="wh-code"
                placeholder="e.g. WH or HYD"
                value={form.shortCode}
                onChange={handleChange('shortCode')}
                maxLength={8}
                aria-describedby={errors.shortCode ? 'wh-code-error' : undefined}
              />
              {errors.shortCode && (
                <p id="wh-code-error" className="text-xs text-danger">{errors.shortCode}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="wh-address">Address *</Label>
              <Input
                id="wh-address"
                placeholder="Street address, City, State PIN"
                value={form.address}
                onChange={handleChange('address')}
                aria-describedby={errors.address ? 'wh-address-error' : undefined}
              />
              {errors.address && (
                <p id="wh-address-error" className="text-xs text-danger">{errors.address}</p>
              )}
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="warehouse-form">
            {isEditing ? 'Save Changes' : 'Create Warehouse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
