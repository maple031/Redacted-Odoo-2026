import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import { MOCK_RECEIPTS } from "@/features/operations/mockData";
import type { OperationFiltersState } from "@/components/operations/OperationFilters";

import OperationPageHeader from "@/components/operations/OperationPageHeader";
import ViewSwitcher, { type ViewMode } from "@/components/operations/ViewSwitcher";
import OperationFilters from "@/components/operations/OperationFilters";
import OperationListTable from "@/components/operations/OperationListTable";
import OperationKanban from "@/components/operations/OperationKanban";

const DETAIL_BASE = "/operations/receipts";

export default function ReceiptsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<ViewMode>("list");
  const [filters, setFilters] = useState<OperationFiltersState>({
    reference: "",
    contact: "",
  });

  const [operations, setOperations] = useState(MOCK_RECEIPTS);

  const filtered = useMemo(() => {
    return operations.filter((op) => {
      const refMatch = op.referenceCode
        .toLowerCase()
        .includes(filters.reference.toLowerCase());
      const contactMatch =
        !filters.contact ||
        op.partner?.name.toLowerCase().includes(filters.contact.toLowerCase());
      return refMatch && contactMatch;
    });
  }, [filters, operations]);

  const handleStatusChange = (operationId: string, newStatus: any) => {
    setOperations((prev) =>
      prev.map((op) => (op.id === operationId ? { ...op, status: newStatus } : op))
    );
  };

  return (
    <div>
      <OperationPageHeader
        title="Receipts"
        subtitle="Incoming stock from suppliers"
        actions={
          <>
            <ViewSwitcher mode={view} onChange={setView} />
            <button
              id="receipts-new"
              onClick={() => navigate(`${DETAIL_BASE}/new`)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white text-sm rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </>
        }
      />

      <div className="mb-4">
        <OperationFilters
          filters={filters}
          onChange={setFilters}
          showContactFilter={true}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        {view === "list" ? (
          <OperationListTable
            operations={filtered}
            detailBasePath={DETAIL_BASE}
            showPartner={true}
          />
        ) : (
          <div className="p-4">
            <OperationKanban
              operations={filtered}
              operationType="RECEIPT"
              detailBasePath={DETAIL_BASE}
              onStatusChange={handleStatusChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
