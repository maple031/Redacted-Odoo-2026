import { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/layout/PageHeader';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { mockStockRows } from '@/features/products/mockData';
import { StockStatus } from '@/features/products/types';
import { initialWarehouses } from '@/features/warehouses/mockData';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
};

const STATUS_STYLES: Record<StockStatus, string> = {
  IN_STOCK: 'bg-[#F0FDF4] text-[#15803D] border border-[#BBF7D0]',
  LOW_STOCK: 'bg-[#FFFBEB] text-[#B45309] border border-[#FDE68A]',
  OUT_OF_STOCK: 'bg-[#FEF2F2] text-[#B91C1C] border border-[#FECACA]',
};

export default function StockProductsPage() {
  const [search, setSearch] = useState('');
  const [warehouseFilter, setWarehouseFilter] = useState('__all__');
  const [statusFilter, setStatusFilter] = useState<string>('__all__');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return mockStockRows.filter(row => {
      if (
        warehouseFilter !== '__all__' &&
        row.warehouseId !== warehouseFilter
      ) {
        return false;
      }
      if (statusFilter !== '__all__' && row.stockStatus !== statusFilter) {
        return false;
      }
      if (q) {
        return (
          row.sku.toLowerCase().includes(q) ||
          row.productName.toLowerCase().includes(q) ||
          row.categoryName.toLowerCase().includes(q) ||
          row.warehouseName.toLowerCase().includes(q) ||
          row.locationName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, warehouseFilter, statusFilter]);

  return (
    <AppShell>
      <PageHeader
        title="Stock / Products"
        description="Read-only inventory view. Stock quantities are updated through inventory operations."
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          id="stock-search"
          placeholder="Search SKU, product, category, warehouse, location…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-[320px]"
        />

        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="w-[200px]" id="filter-stock-wh">
            <SelectValue placeholder="All Warehouses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Warehouses</SelectItem>
            {initialWarehouses.map(w => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" id="filter-stock-status">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All Statuses</SelectItem>
            {(Object.keys(STATUS_LABELS) as StockStatus[]).map(s => (
              <SelectItem key={s} value={s}>
                {STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {filtered.length} row{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[160px]">SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="w-[120px]">Category</TableHead>
              <TableHead className="w-[60px]">UOM</TableHead>
              <TableHead className="w-[160px]">Warehouse</TableHead>
              <TableHead className="w-[120px]">Location</TableHead>
              <TableHead className="w-[90px] text-right tabular-nums">On Hand</TableHead>
              <TableHead className="w-[90px] text-right tabular-nums">Reserved</TableHead>
              <TableHead className="w-[90px] text-right tabular-nums">Available</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  No stock records match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map(row => (
                <TableRow key={`${row.productId}-${row.locationId}`}>
                  <TableCell>
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">
                      {row.sku}
                    </code>
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {row.productName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.categoryName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.uomSymbol}
                  </TableCell>
                  <TableCell className="text-sm">{row.warehouseName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {row.locationName}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right text-sm tabular-nums',
                      row.onHandQty === 0 && 'text-muted-foreground'
                    )}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {row.onHandQty.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className="text-right text-sm tabular-nums text-muted-foreground"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {row.reservedQty.toLocaleString()}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'text-right text-sm tabular-nums font-medium',
                      row.availableQty === 0
                        ? 'text-[#B91C1C]'
                        : row.availableQty <= 5
                        ? 'text-[#B45309]'
                        : 'text-[#15803D]'
                    )}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {row.availableQty.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={cn(
                        'text-xs font-medium',
                        STATUS_STYLES[row.stockStatus]
                      )}
                    >
                      {STATUS_LABELS[row.stockStatus]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </AppShell>
  );
}
