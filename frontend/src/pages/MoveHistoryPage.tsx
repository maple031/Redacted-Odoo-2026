import { AppShell } from "../components/layout/AppShell";
import { PageHeader } from "../components/layout/PageHeader";

export default function MoveHistoryPage() {
  return (
    <AppShell>
      <PageHeader 
        title="Move History" 
        description="Logs and displays complete history of In/Out stock movements" 
      />
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="p-8 text-center text-slate-500">
          <p>List View of stock movements will be displayed here.</p>
        </div>
      </div>
    </AppShell>
  );
}
