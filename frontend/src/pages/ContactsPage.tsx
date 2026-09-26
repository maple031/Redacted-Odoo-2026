import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { BusinessPartner } from '@/features/partners/types';
import { initialPartners } from '@/features/partners/mockData';
import { PartnerDialog } from '@/features/partners/components/PartnerDialog';
import { cn } from '@/lib/utils';

interface PartnerFormData {
  name: string;
  isSupplier: boolean;
  isCustomer: boolean;
  contactEmail: string;
  contactPhone: string;
}

type DialogMode = { kind: 'new' } | { kind: 'edit'; partner: BusinessPartner } | null;

function roleLabel(p: BusinessPartner): string {
  if (p.isSupplier && p.isCustomer) return 'Both';
  if (p.isSupplier) return 'Supplier';
  return 'Customer';
}

export default function ContactsPage() {
  const [partners, setPartners] = useState<BusinessPartner[]>(initialPartners);
  const [dialog, setDialog] = useState<DialogMode>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('__all__');
  const [filterStatus, setFilterStatus] = useState<string>('__all__');

  function openNew() { setDialog({ kind: 'new' }); }
  function openEdit(p: BusinessPartner) { setDialog({ kind: 'edit', partner: p }); }

  function handleSave(data: PartnerFormData) {
    if (dialog?.kind === 'new') {
      const newPartner: BusinessPartner = {
        id: `bp-${Date.now()}`,
        active: true,
        name: data.name,
        isSupplier: data.isSupplier,
        isCustomer: data.isCustomer,
        contactEmail: data.contactEmail || undefined,
        contactPhone: data.contactPhone || undefined,
      };
      setPartners(prev => [...prev, newPartner]);
    } else if (dialog?.kind === 'edit') {
      const id = dialog.partner.id;
      setPartners(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                name: data.name,
                isSupplier: data.isSupplier,
                isCustomer: data.isCustomer,
                contactEmail: data.contactEmail || undefined,
                contactPhone: data.contactPhone || undefined,
              }
            : p
        )
      );
    }
  }

  function toggleActive(id: string) {
    setPartners(prev =>
      prev.map(p => (p.id === id ? { ...p, active: !p.active } : p))
    );
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return partners.filter(p => {
      if (q) {
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.contactEmail ?? '').toLowerCase().includes(q) ||
          (p.contactPhone ?? '').toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (filterRole === 'supplier' && !p.isSupplier) return false;
      if (filterRole === 'customer' && !p.isCustomer) return false;
      if (filterRole === 'both' && !(p.isSupplier && p.isCustomer)) return false;
      if (filterStatus === 'active' && !p.active) return false;
      if (filterStatus === 'inactive' && p.active) return false;
      return true;
    });
  }, [partners, search, filterRole, filterStatus]);

  const editingPartner = dialog?.kind === 'edit' ? dialog.partner : null;

  return (
    <AppShell>
      <PageHeader
        title="Contacts"
        description="Manage suppliers, customers, and business partners."
        actions={
          <Button id="btn-new-partner" onClick={openNew}>
            + New Contact
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Input
          id="search-partners"
          placeholder="Search by name, email, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[280px]"
        />

        <Select value={filterRole} onValueChange={setFilterRole}>
          <SelectTrigger className="w-[160px]" id="filter-role">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Roles</SelectItem>
            <SelectItem value="supplier">Supplier</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="both">Both</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]" id="filter-status">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="w-[100px]">Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="w-[90px]">Status</TableHead>
              <TableHead className="w-[160px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-sm">
                  No contacts match the search or filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>
                    <RoleBadges partner={p} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.contactEmail ?? '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.contactPhone ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'border text-xs',
                        p.active
                          ? 'bg-success-bg text-success border-success-border'
                          : 'bg-draft-bg text-draft border-draft-border'
                      )}
                    >
                      {p.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-2 justify-end">
                      <Button
                        id={`btn-edit-bp-${p.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </Button>
                      <Button
                        id={`btn-toggle-bp-${p.id}`}
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(p.id)}
                        className={cn(
                          p.active
                            ? 'border-warning-border text-warning hover:bg-warning-bg'
                            : 'border-success-border text-success hover:bg-success-bg'
                        )}
                      >
                        {p.active ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <PartnerDialog
        open={dialog !== null}
        onOpenChange={open => { if (!open) setDialog(null); }}
        initialValues={editingPartner}
        onSave={handleSave}
      />
    </AppShell>
  );
}

function RoleBadges({ partner }: { partner: BusinessPartner }) {
  const role = roleLabel(partner);
  if (role === 'Both') {
    return (
      <div className="flex flex-wrap gap-1">
        <Badge className="border text-xs bg-warning-bg text-warning border-warning-border">
          Supplier
        </Badge>
        <Badge className="border text-xs bg-success-bg text-success border-success-border">
          Customer
        </Badge>
      </div>
    );
  }
  if (role === 'Supplier') {
    return (
      <Badge className="border text-xs bg-warning-bg text-warning border-warning-border">
        Supplier
      </Badge>
    );
  }
  return (
    <Badge className="border text-xs bg-success-bg text-success border-success-border">
      Customer
    </Badge>
  );
}
