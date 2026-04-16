import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Input, Modal } from "../../components";
import { api as axios } from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt, FaMoneyBillWave, FaClock } from "react-icons/fa";

export default function OffreStage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    duree_days: "",
    city: "",
    country: "",
    remuneration: "",
    statut: "publie",
    document_requise: "",
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offre-stages"],
    queryFn: async () => {
      const { data } = await axios.get("/company/stages");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => await axios.post("/company/stages", newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["offre-stages"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Offre de stage créée !");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newData) => await axios.put(`/company/stages/${editingOffer.id_offre_stage}`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["offre-stages"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Offre mise à jour !");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/company/stages/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["offre-stages"]);
      toast.success("Offre supprimée !");
    },
  });

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      duree_days: "",
      city: "",
      country: "",
      remuneration: "",
      statut: "publie",
      document_requise: "",
    });
    setEditingOffer(null);
  };

  const handleEdit = (offer) => {
    setEditingOffer(offer);
    setFormData({
      titre: offer.titre || "",
      description: offer.description || "",
      duree_days: offer.duree_days || "",
      city: offer.city || "",
      country: offer.country || "",
      remuneration: offer.remuneration || "",
      statut: offer.statut || "publie",
      document_requise: offer.document_requise || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingOffer) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <AppShell
      title="Offres de Stage"
      subtitle="Gérez les opportunités pour les étudiants."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <FaPlus /> Nouveau stage
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p>Chargement...</p>
        ) : offers?.length === 0 ? (
          <Card className="col-span-full py-12 text-center text-slate-500">
            Aucun stage pour le moment.
          </Card>
        ) : (
          offers?.map((offer) => (
            <Card key={offer.id_offre_stage} className="group relative flex flex-col justify-between overflow-hidden border-none p-0 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-violet/30">
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${offer.statut === 'publie' ? 'bg-indigo-500' : 'bg-red-500'}`} />

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${offer.statut === 'publie' ? 'bg-indigo-50/80 text-indigo-600 ring-1 ring-indigo-500/20' : 'bg-red-50/80 text-red-600 ring-1 ring-red-500/20'}`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${offer.statut === 'publie' ? 'bg-indigo-500' : 'bg-red-500'} animate-pulse`} />
                    {offer.statut === 'publie' ? 'Publiée' : 'Fermée'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(offer)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-brand-violet/10 hover:text-brand-violet">
                      <FaEdit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(offer.id_offre_stage)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-violet transition-colors">{offer.titre}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {offer.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-violet shadow-sm">
                      <FaMapMarkerAlt />
                    </div>
                    <span className="truncate">{offer.city || '—'}, {offer.country || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-violet shadow-sm">
                      <FaMoneyBillWave />
                    </div>
                    <span className="truncate">{offer.remuneration ? `${offer.remuneration} DH` : 'Non rémunéré'}</span>
                  </div>
                </div>

                {/* Bottom Section: Docs & Duration */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {offer.document_requise && offer.document_requise.split(',').map((doc, idx) => (
                      <span key={idx} className="rounded-md bg-brand-violet/5 px-2 py-1 text-[9px] font-black tracking-tight text-brand-violet ring-1 ring-brand-violet/10">
                        {doc.trim().toUpperCase()}
                      </span>
                    ))}
                    {!offer.document_requise && (
                      <span className="text-[10px] text-slate-400 italic">Aucun document requis</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <FaClock className="text-brand-violet/50" />
                    <span>{offer.duree_days ? `${offer.duree_days} jours` : '—'}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <Modal
          open={isModalOpen}
          onClose={() => { setIsModalOpen(false); resetForm(); }}
          title={editingOffer ? "Modifier le stage" : "Créer une offre de stage"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Titre du stage" name="titre" value={formData.titre} onChange={handleChange} required />
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Durée (en jours)" type="number" name="duree_days" value={formData.duree_days} onChange={handleChange} placeholder="Ex: 90" />
              <Input label="Rémunération (optionnel)" type="number" name="remuneration" value={formData.remuneration} onChange={handleChange} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Ville" name="city" value={formData.city} onChange={handleChange} />
              <Input label="Pays" name="country" value={formData.country} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm" rows="3" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Statut</label>
              <select name="statut" value={formData.statut} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm">
                <option value="publie">Publiée</option>
                <option value="ferme">Fermée</option>
              </select>
            </div>
            <Input
              label="Documents requis (ex: CV, Lettre, Attestation)"
              name="document_requise"
              value={formData.document_requise}
              onChange={handleChange}
              placeholder="Séparez par des virgules"
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingOffer ? "Mettre à jour" : "Publier le stage"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
