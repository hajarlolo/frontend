import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Input, Select, Badge, Button, Skeleton, Modal } from "../../components";
import { fetchAdminCompanies, adminDecisionVerification, fetchAccountDocument } from "../../services/endpoints";
import { api as axios } from "../../services/api";
import { IoSearchOutline, IoEyeOutline, IoMailOutline, IoCheckmarkOutline, IoCloseOutline, IoRefreshOutline, IoExpandOutline } from "react-icons/io5";

const BACKEND_URL = axios.defaults.baseURL;

export default function Companies() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ status: "", search: "", page: 1 });
  const [docModal, setDocModal] = useState({ open: false, url: "", mimeType: "", loading: false });

  const { data, isLoading } = useQuery({
    queryKey: ["admin-companies", filters],
    queryFn: () => fetchAdminCompanies(filters),
  });

  const moderateMutation = useMutation({
    mutationFn: ({ verificationId, decision, note }) => adminDecisionVerification(verificationId, { decision, note }),
    onSuccess: () => queryClient.invalidateQueries(["admin-companies"]),
  });

  const companies = data?.data || [];

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setFilters(prev => ({ ...prev, status: formData.get("status"), search: formData.get("search"), page: 1 }));
  };

  const openDoc = async (userId) => {
    setDocModal({ open: true, url: "", mimeType: "", loading: true });
    try {
      const res = await fetchAccountDocument(userId);
      const path = res.url || "";
      let fullUrl = path.startsWith('http') ? path : (path.startsWith('/storage') ? `${BACKEND_URL}${path}` : `${BACKEND_URL}/storage/${path}`);
      fullUrl = fullUrl.replace(/([^:])\/\//g, '$1/'); // Normalize double slashes
      setDocModal({ open: true, url: fullUrl, mimeType: res.mime_type, loading: false });
    } catch {
      setDocModal({ open: false, url: "", mimeType: "", loading: false });
    }
  };

  return (
    <AppShell title="Gestion des Entreprises" subtitle="Validation et suivi des partenaires">
      <Card>
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
          <Input name="search" label="Recherche" placeholder="Nom, ICE, Secteur..." className="flex-1" />
          <Select name="status" label="Statut" className="w-48">
            <option value="">Tous</option>
            <option value="pending_document">En attente (Documents)</option>
            <option value="approved">Approuvé</option>
            <option value="rejected">Rejeté</option>
            <option value="revision_required">Révision Requise</option>
          </Select>
          <Button type="submit" leftIcon={<IoSearchOutline />}>Filtrer</Button>
        </form>
      </Card>

      <Card className="mt-8 overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Nom Entreprise</th>
                <th className="px-6 py-4">Responsable / Email</th>
                <th className="px-6 py-4">Statut</th>
                <th className="px-6 py-4 text-center">Docs</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4">
                    <Skeleton className="h-10 w-full" />
                  </td>
                </tr>
              ) : companies.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">
                    Aucune entreprise trouvée.
                  </td>
                </tr>
              ) : (
                companies.map((company) => {
                  const status = company.user?.latest_verification?.status || "Inconnu";
                  const verificationId = company.user?.latest_verification?.id_verification;
                  
                  return (
                    <tr key={company.id_entreprise} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {company.user?.nom || "Non défini"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-500 text-xs">{company.user?.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge value={status} />
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button size="sm" variant="ghost" onClick={() => openDoc(company.user?.id_user)}>
                          <IoEyeOutline size={18} />
                        </Button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {(status === "pending_document" || status === "revision_required") && verificationId ? (
                          <div className="flex justify-end gap-2">
                            <Button 
                              title="Approuver" 
                              size="sm" 
                              className="bg-emerald-500 hover:bg-emerald-600 border-none text-white p-2" 
                              onClick={() => moderateMutation.mutate({ verificationId, decision: "approved" })}
                            >
                              <IoCheckmarkOutline size={16} />
                            </Button>
                            <Button 
                              title="Révision Requise (Email)" 
                              size="sm" 
                              variant="warning" 
                              className="p-2"
                              onClick={() => {
                                const note = prompt("Motif de la révision (Sera envoyé par email) :");
                                if (note) moderateMutation.mutate({ verificationId, decision: "revision_required", note });
                              }}
                            >
                              <IoRefreshOutline size={16} />
                            </Button>
                            <Button 
                              title="Rejeter" 
                              size="sm" 
                              variant="danger" 
                              className="p-2"
                              onClick={() => moderateMutation.mutate({ verificationId, decision: "rejected" })}
                            >
                              <IoCloseOutline size={16} />
                            </Button>
                          </div>
                        ) : status === "approved" ? (
                           <Button size="sm" variant="ghost">Détails</Button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal 
        open={docModal.open} 
        onClose={() => setDocModal({ open: false, url: "", mimeType: "", loading: false })} 
        title="Registre de Commerce (RC)"
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6">
          {docModal.loading ? (
            <Skeleton className="h-64 w-full rounded-3xl" />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex justify-end">
                <a 
                  href={docModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-violet hover:text-white dark:hover:bg-brandViolet dark:hover:text-white transition-all shadow-sm"
                  title="Ouvrir en plein écran"
                >
                  <IoExpandOutline size={18} />
                  Ouvrir en plein écran
                </a>
              </div>

              {/* Quick Preview Area */}
              <div className="bg-slate-50 dark:bg-slate-950/50 rounded-[32px] border-2 border-slate-100 dark:border-slate-800/50 overflow-hidden shadow-inner p-2">
                {docModal.mimeType?.includes("image") ? (
                  <div className="flex justify-center bg-white dark:bg-slate-900 rounded-[28px] overflow-hidden shadow-sm">
                    <img 
                      src={docModal.url} 
                      alt="RC Entreprise" 
                      className="max-w-full h-auto"
                      style={{ maxHeight: "60vh" }}
                    />
                  </div>
                ) : (
                  <div className="rounded-[28px] overflow-hidden shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <iframe 
                      src={docModal.url} 
                      className="w-full h-[60vh] border-none" 
                      title="Aperçu du document"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </AppShell>
  );
}
