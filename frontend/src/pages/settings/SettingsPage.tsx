import { AppShell } from "../../components/layout/AppShell";
import { PageHeader } from "../../components/layout/PageHeader";
import { Link } from "react-router-dom";

export default function SettingsPage() {
  return (
    <AppShell>
      <PageHeader 
        title="Settings" 
        description="Manage system configurations" 
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link to="/settings/warehouses" className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg text-slate-800">Warehouse Management</h3>
          <p className="text-sm text-slate-500 mt-2">Manage warehouse configurations, short codes, and addresses.</p>
        </Link>
        <Link to="/settings/locations" className="rounded-lg border bg-white p-6 hover:shadow-md transition-shadow">
          <h3 className="font-semibold text-lg text-slate-800">Locations</h3>
          <p className="text-sm text-slate-500 mt-2">Configure warehouse bins and location structures.</p>
        </Link>
      </div>
    </AppShell>
  );
}
