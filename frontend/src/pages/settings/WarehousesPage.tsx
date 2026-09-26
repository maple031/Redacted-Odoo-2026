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
import { Warehouse } from '@/features/warehouses/types';
import { initialWarehouses } from '@/features/warehouses/mockData';
import { WarehouseDialog } from '@/features/warehouses/components/WarehouseDialog';
import { cn } from '@/lib/utils';

type DialogMode = { kind: 'new' } | { kind: 'edit'; warehouse: Warehouse } | null;

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(initialWarehouses);
  const [dialog, setDialog] = useState<DialogMode>(null);

  function openNew() {
    setDialog({ kind: 'new' });
  }

  function openEdit(w: Warehouse) {
    setDialog({ kind: 'edit', warehouse: w });
  }

  function handleSave(data: { name: string; shortCode: string; address: string }) {
    if (dialog?.kind === 'new') {
      const newWh: Warehouse = {
        id: `wh-${Date.now()}`,
        active: true,
        ...data,
      };
      setWarehouses(prev => [...prev, newWh]);
    } else if (dialog?.kind === 'edit') {
      const id = dialog.warehouse.id;
      setWarehouses(prev =>
        prev.map(w => (w.id === id ? { ...w, ...data } : w))
      );
    }
  }

  function toggleActive(id: string) {
    setWarehouses(prev =>
      prev.map(w => (w.id === id ? { ...w, active: !w.active } : w))
    );
  }

  const editingWarehouse =
    dialog?.kind === 'edit' ? dialog.warehouse : null;

  return (
    <AppShell>
      <PageHeader
        title="Warehouses"
        description="Manage physical warehouse locations."
        actions={
          <Button id="btn-new-warehouse" onClick={openNew}>
            + New Warehouse
          </Button>
        }
      />

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Address</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {warehouses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-sm">
                  No warehouses found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              warehouses.map(w => (
                <TableRow key={w.id}>
                  <TableCell className="font-medium">{w.name}</TableCell>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {w.shortCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.address}</TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border text-xs',
                        w.active
                          ? 'bg-success-bg text-success border-success-border'
                          : 'bg-draft-bg text-draft border-draft-border'
                      )}
                    >
                      {w.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <Button
                        id={`btn-edit-wh-${w.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(w)}
                      >
                        Edit
                      </Button>
                      <Button
                        id={`btn-toggle-wh-${w.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(w.id)}
                        className={cn(
                          w.active
                            ? 'border-warning-border text-warning hover:bg-warning-bg'
                            : 'border-success-border text-success hover:bg-success-bg'
                        )}
                      >
                        {w.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <WarehouseDialog
        open={dialog !== null}
        onOpenChange={open => { if (!open) setDialog(null); }}
        initialValues={editingWarehouse}
        onSave={handleSave}
      />
    </AppShell>
  );
}
