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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Location, LocationType } from '../types';
import { Warehouse } from '@/features/warehouses/types';

const LOCATION_TYPES: { value: LocationType; label: string }[] = [
  { value: 'INTERNAL', label: 'Internal' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'CUSTOMER', label: 'Customer' },
  { value: 'LOSS', label: 'Loss / Scrap' },
  { value: 'TRANSIT', label: 'Transit' },
];

interface LocationFormData {
  name: string;
  code: string;
  locationType: LocationType;
  warehouseId: string;
  parentLocationId: string;
}

interface LocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialValues?: Location | null;
  warehouses: Warehouse[];
  locations: Location[];
  onSave: (data: LocationFormData) => void;
}

export function LocationDialog({
  open,
  onOpenChange,
  initialValues,
  warehouses,
  locations,
  onSave,
}: LocationDialogProps) {
  const isEditing = !!initialValues;

  const emptyForm: LocationFormData = {
    name: '',
    code: '',
    locationType: 'INTERNAL',
    warehouseId: '',
    parentLocationId: '',
  };

  const toForm = (v: Location): LocationFormData => ({
    name: v.name,
    code: v.code,
    locationType: v.locationType,
    warehouseId: v.warehouseId ?? '',
    parentLocationId: v.parentLocationId ?? '',
  });

  const [form, setForm] = useState<LocationFormData>(
    initialValues ? toForm(initialValues) : emptyForm
  );
  const [errors, setErrors] = useState<Partial<Record<keyof LocationFormData, string>>>({});

  React.useEffect(() => {
    if (open) {
      setForm(initialValues ? toForm(initialValues) : emptyForm);
      setErrors({});
    }
  }, [open, initialValues?.id]);

  // Candidate parent locations: same warehouse, not self
  const parentCandidates = locations.filter(
    l =>
      l.id !== initialValues?.id &&
      l.warehouseId === (form.warehouseId || null) &&
      l.locationType === 'INTERNAL'
  );

  function validate(): boolean {
    const e: Partial<Record<keyof LocationFormData, string>> = {};
    if (!form.name.trim()) e.name = 'Name is required.';
    if (!form.code.trim()) e.code = 'Code is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave({
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      locationType: form.locationType,
      warehouseId: form.warehouseId,
      parentLocationId: form.parentLocationId,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Location' : 'New Location'}</DialogTitle>
          <DialogDescription>
            Configure location details. Stock movements are managed separately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} id="location-form" noValidate>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="loc-name">Name *</Label>
              <Input
                id="loc-name"
                placeholder="e.g. Rack A"
                value={form.name}
                onChange={e => {
                  setForm(p => ({ ...p, name: e.target.value }));
                  setErrors(p => ({ ...p, name: undefined }));
                }}
              />
              {errors.name && <p className="text-xs text-danger">{errors.name}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="loc-code">Code *</Label>
              <Input
                id="loc-code"
                placeholder="e.g. WH/STOCK/RACK-A"
                value={form.code}
                onChange={e => {
                  setForm(p => ({ ...p, code: e.target.value }));
                  setErrors(p => ({ ...p, code: undefined }));
                }}
              />
              {errors.code && <p className="text-xs text-danger">{errors.code}</p>}
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="loc-type">Type *</Label>
              <Select
                value={form.locationType}
                onValueChange={v =>
                  setForm(p => ({ ...p, locationType: v as LocationType, parentLocationId: '' }))
                }
              >
                <SelectTrigger id="loc-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="loc-warehouse">Warehouse</Label>
              <Select
                value={form.warehouseId || '__none__'}
                onValueChange={v =>
                  setForm(p => ({
                    ...p,
                    warehouseId: v === '__none__' ? '' : v,
                    parentLocationId: '',
                  }))
                }
              >
                <SelectTrigger id="loc-warehouse">
                  <SelectValue placeholder="None (virtual)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">None (virtual)</SelectItem>
                  {warehouses
                    .filter(w => w.active)
                    .map(w => (
                      <SelectItem key={w.id} value={w.id}>
                        {w.name} ({w.shortCode})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {form.locationType === 'INTERNAL' && form.warehouseId && (
              <div className="grid gap-1.5">
                <Label htmlFor="loc-parent">Parent Location</Label>
                <Select
                  value={form.parentLocationId || '__none__'}
                  onValueChange={v =>
                    setForm(p => ({
                      ...p,
                      parentLocationId: v === '__none__' ? '' : v,
                    }))
                  }
                >
                  <SelectTrigger id="loc-parent">
                    <SelectValue placeholder="None (top level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None (top level)</SelectItem>
                    {parentCandidates.map(l => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name} ({l.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </form>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="location-form">
            {isEditing ? 'Save Changes' : 'Create Location'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
