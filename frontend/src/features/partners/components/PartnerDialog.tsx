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
import { BusinessPartner } from '../types';

interface PartnerFormData {
  name: string;
  isSupplier: boolean;
  isCustomer: boolean;
  contactEmail: string;
  contactPhone: string;
}

interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: BusinessPartner | null;
  onSave: (data: PartnerFormData) => void;
}

export function PartnerDialog({
  open,
  onOpenChange,
  initialValues,
  onSave,
}: PartnerDialogProps) {
  const isEditing = !!initialValues;

  const emptyForm: PartnerFormData = {
    name: '',
    isSupplier: false,
    isCustomer: false,
    contactEmail: '',
    contactPhone: '',
  };

  const toForm = (v: BusinessPartner): PartnerFormData => ({
    name: v.name,
    isSupplier: v.isSupplier,
    isCustomer: v.isCustomer,
    contactEmail: v.contactEmail ?? '',
    contactPhone: v.contactPhone ?? '',
  });

  const [form, setForm] = useState<PartnerFormData>(
    initialValues ? toForm(initialValues) : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({});

  React.useEffect(() => {
    if (open) {
      setForm(initialValues ? toForm(initialValues) : emptyForm);
      setErrors({});
    }
  }, [open, initialValues?.id]);

  function validate(): boolean {
    const e: Partial<Record<keyof PartnerFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.isSupplier && !form.isCustomer)
      e.isSupplier = 'Must be at least a Supplier or a Customer.';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail))
      e.contactEmail = 'Enter a valid email address.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      isSupplier: form.isSupplier,
      isCustomer: form.isCustomer,
      contactEmail: form.contactEmail.trim(),
      contactPhone: form.contactPhone.trim(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Contact' : 'New Contact'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the business partner details.'
              : 'Add a new supplier, customer, or both.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="partner-form" noValidate>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bp-name">Name *</Label>
              <Input
                id="bp-name"
                placeholder="Company or individual name"
                value={form.name}
                onChange={e => {
                  setForm(p => ({ ...p, name: e.target.value }));
                  setErrors(p => ({ ...p, name: undefined }));
                }}
              />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            <div className="grid gap-2">
              <Label>Role *</Label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="bp-supplier"
                    checked={form.isSupplier}
                    onChange={e => {
                      setForm(p => ({ ...p, isSupplier: e.target.checked }));
                      setErrors(p => ({ ...p, isSupplier: undefined }));
                    }}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-medium">Supplier</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="bp-customer"
                    checked={form.isCustomer}
                    onChange={e => {
                      setForm(p => ({ ...p, isCustomer: e.target.checked }));
                      setErrors(p => ({ ...p, isSupplier: undefined }));
                    }}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <span className="text-sm font-medium">Customer</span>
                </label>
              </div>
              {errors.isSupplier && (
                <p className="text-xs text-danger">{errors.isSupplier}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="bp-email">Email</Label>
              <Input
                id="bp-email"
                type="email"
                placeholder="contact@company.com"
                value={form.contactEmail}
                onChange={e => {
                  setForm(p => ({ ...p, contactEmail: e.target.value }));
                  setErrors(p => ({ ...p, contactEmail: undefined }));
                }}
              />
              {errors.contactEmail && (
                <p className="text-xs text-danger">{errors.contactEmail}</p>
              )}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="bp-phone">Phone</Label>
              <Input
                id="bp-phone"
                type="tel"
                placeholder="+91-00-0000-0000"
                value={form.contactPhone}
                onChange={e => setForm(p => ({ ...p, contactPhone: e.target.value }))}
              />
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="partner-form">
            {isEditing ? 'Save Changes' : 'Create Contact'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
