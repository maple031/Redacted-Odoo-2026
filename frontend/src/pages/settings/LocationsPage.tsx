import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Location, LocationType } from '@/features/locations/types';
import { initialLocations } from '@/features/locations/mockData';
import { initialWarehouses } from '@/features/warehouses/mockData';
import { LocationDialog } from '@/features/locations/components/LocationDialog';
import { cn } from '@/lib/utils';

const LOCATION_TYPE_LABELS: Record<LocationType, string> = {
  INTERNAL: 'Internal',
  VENDOR: 'Vendor',
  CUSTOMER: 'Customer',
  LOSS: 'Loss',
  TRANSIT: 'Transit',
};

const TYPE_BADGE_STYLES: Record<LocationType, string> = {
  INTERNAL: 'bg-draft-bg text-draft border-draft-border',
  VENDOR: 'bg-warning-bg text-warning border-warning-border',
  CUSTOMER: 'bg-success-bg text-success border-success-border',
  LOSS: 'bg-danger-bg text-danger border-danger-border',
  TRANSIT: 'bg-ready-bg text-ready border-ready-border',
};

type DialogMode = { kind: 'new' } | { kind: 'edit'; location: Location } | null;

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>(initialLocations);
  const [warehouses] = useState(initialWarehouses);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [filterWarehouse, setFilterWarehouse] = useState<string>('__all__');
  const [filterType, setFilterType] = useState<string>('__all__');

  function openNew() { setDialog({ kind: 'new' }); }
  function openEdit(l: Location) { setDialog({ kind: 'edit', location: l }); }

  interface LocationFormData {
    name: string;
    code: string;
    locationType: LocationType;
    warehouseId: string;
    parentLocationId: string;
  }

  function handleSave(data: LocationFormData) {
    if (dialog?.kind === 'new') {
      const newLoc: Location = {
        id: `loc-${Date.now()}`,
        active: true,
        name: data.name,
        code: data.code,
        locationType: data.locationType,
        warehouseId: data.warehouseId || null,
        parentLocationId: data.parentLocationId || null,
      };
      setLocations(prev => [...prev, newLoc]);
    } else if (dialog?.kind === 'edit') {
      const id = dialog.location.id;
      setLocations(prev =>
        prev.map(l =>
          l.id === id
            ? {
                ...l,
                name: data.name,
                code: data.code,
                locationType: data.locationType,
                warehouseId: data.warehouseId || null,
                parentLocationId: data.parentLocationId || null,
              }
            : l
        )
      );
    }
  }

  function toggleActive(id: string) {
    setLocations(prev =>
      prev.map(l => (l.id === id ? { ...l, active: !l.active } : l))
    );
  }

  const warehouseMap = Object.fromEntries(warehouses.map(w => [w.id, w]));
  const locationMap = Object.fromEntries(locations.map(l => [l.id, l]));

  const filtered = locations.filter(l => {
    if (filterWarehouse !== '__all__') {
      if (filterWarehouse === '__virtual__') {
        if (l.warehouseId !== null) return false;
      } else {
        if (l.warehouseId !== filterWarehouse) return false;
      }
    }
    if (filterType !== '__all__' && l.locationType !== filterType) return false;
    return true;
  });

  const editingLocation = dialog?.kind === 'edit' ? dialog.location : null;

  return (
    <AppShell>
      <PageHeader
        title="Locations"
        description="Configure stock locations and hierarchy."
        actions={
          <Button id="btn-new-location" onClick={openNew}>
            + New Location
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Select value={filterWarehouse} onValueChange={setFilterWarehouse}>
          <SelectTrigger className="w-[200px]" id="filter-wh">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Warehouses</SelectItem>
            <SelectItem value="__virtual__">Virtual / Global</SelectItem>
            {warehouses.map(w => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]" id="filter-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Types</SelectItem>
            {(Object.keys(LOCATION_TYPE_LABELS) as LocationType[]).map(t => (
              <SelectItem key={t} value={t}>
                {LOCATION_TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="w-[110px]">Type</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                  No locations match the selected filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(l => {
                const parentName = l.parentLocationId
                  ? locationMap[l.parentLocationId]?.name ?? '—'
                  : '—';
                const warehouseName = l.warehouseId
                  ? warehouseMap[l.warehouseId]?.name ?? '—'
                  : 'Virtual';
                const isChild = !!l.parentLocationId;

                return (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">
                      {isChild && (
                        <span className="mr-1 text-muted-foreground select-none">↳</span>
                      )}
                      {l.name}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                        {l.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn('border text-xs', TYPE_BADGE_STYLES[l.locationType])}>
                        {LOCATION_TYPE_LABELS[l.locationType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{warehouseName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{parentName}</TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          'border text-xs',
                          l.active
                            ? 'bg-success-bg text-success border-success-border'
                            : 'bg-draft-bg text-draft border-draft-border'
                        )}
                      >
                        {l.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <Button
                          id={`btn-edit-loc-${l.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(l)}
                        >
                          Edit
                        </Button>
                        <Button
                          id={`btn-toggle-loc-${l.id}`}
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(l.id)}
                          className={cn(
                            l.active
                              ? 'border-warning-border text-warning hover:bg-warning-bg'
                              : 'border-success-border text-success hover:bg-success-bg'
                          )}
                        >
                          {l.active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <LocationDialog
        open={dialog !== null}
        onOpenChange={open => { if (!open) setDialog(null); }}
        initialValues={editingLocation}
        warehouses={warehouses}
        locations={locations}
        onSave={handleSave}
      />
    </AppShell>
  );
}
