import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Input, Select, Badge, Button, Skeleton } from "../../components";
import { fetchAdminLogs } from "../../services/endpoints";
import { formatDate } from "../../utils/helpers";
import { IoSearchOutline, IoDownloadOutline } from "react-icons/io5";

export default function Logs() {
  const [filters, setFilters] = useState({
    user_type: "",
    action_type: "",
    search: "",
    page: 1
  });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", filters],
    queryFn: () => fetchAdminLogs(filters),
  });

  const logs = data?.data || [];
  const meta = data || {};

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFilters(prev => ({
      ...prev,
      user_type: formData.get("user_type"),
      action_type: formData.get("action_type"),
      search: formData.get("search"),
      page: 1
    }));
  };

  const exportLogs = () => {
    // Basic export logic: convert to CSV with semicolon for better Excel compatibility in FR/MA locales
    const headers = ["ID", "Utilisateur", "Type", "Action", "Target", "Description", "Date"];
    const rows = logs.map(l => [
      l.id,
      l.user?.nom || "System",
      l.user_type,
      l.action_type,
      `${l.target_type || ""} (${l.target_id || ""})`,
      l.description || "",
      l.created_at
    ]);
    
    // Add \uFEFF BOM for Excel UTF-8 support and use semicolon separator
    let csvContent = "\ufeff" + headers.join(";") + "\n" + rows.map(r => r.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `logs_activite_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AppShell 
      title="Logs d'activité" 
      subtitle="Historique complet des actions utilisateurs"
      actions={
        <Button variant="ghost" leftIcon={<IoDownloadOutline />} onClick={exportLogs}>
          Exporter CSV
        </Button>
      }
    >
      <Card>
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <Input name="search" label="Chercher utilisateur" placeholder="Nom..." defaultValue={filters.search} />
          <Select name="user_type" label="Type d'utilisateur" defaultValue={filters.user_type}>
            <option value="">Tous</option>
            <option value="admin">Admin</option>
            <option value="entreprise">Entreprise</option>
            <option value="etudiant">Etudiant</option>
            <option value="lauriat">Lauréat</option>
          </Select>
          <Select name="action_type" label="Type d'action" defaultValue={filters.action_type}>
            <option value="">Toutes</option>
            <option value="login">Connexion</option>
            <option value="logout">Déconnexion</option>
            <option value="register">Inscription</option>
            <option value="update_profile">Profile</option>
            <option value="apply_offer">Apply Offer</option>
            <option value="create_offer">Create Offer</option>
            <option value="close_offer">Close Offer</option>
            <option value="accept_user">Accept User</option>
            <option value="reject_user">Reject User</option>
          </Select>
          <Button type="submit" leftIcon={<IoSearchOutline />}>Filtrer</Button>
        </form>
      </Card>

      <Card className="mt-6 p-0 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-700">Utilisateur</th>
              <th className="px-6 py-4 font-bold text-slate-700">Action</th>
              <th className="px-6 py-4 font-bold text-slate-700">Description</th>
              <th className="px-6 py-4 font-bold text-slate-700">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-64" /></td>
                  <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                </tr>
              ))
            ) : (
              logs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">{log.user?.nom || "Anonyme"}</div>
                    <div className="text-xs text-slate-500 uppercase">{log.user_type}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge value={log.action_type} />
                  </td>
                  <td className="px-6 py-4 text-slate-600 line-clamp-1 max-w-xs" title={log.description}>
                    {log.description}
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                    {formatDate(log.created_at)}
                  </td>
                </tr>
              ))
            )}
            {!isLoading && logs.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">Aucun log trouvé.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination placeholder */}
        {meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
            {[...Array(meta.last_page)].map((_, i) => (
              <Button 
                key={i} 
                variant={filters.page === i + 1 ? "primary" : "ghost"}
                size="sm"
                onClick={() => setFilters(p => ({ ...p, page: i + 1 }))}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </Card>
    </AppShell>
  );
}
