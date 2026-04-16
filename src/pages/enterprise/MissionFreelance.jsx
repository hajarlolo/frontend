import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Input, Modal } from "../../components";
import { api as axios } from "../../services/api";
import { FaPlus, FaEdit, FaTrash, FaMoneyBillWave, FaCalendarAlt, FaStar, FaMapMarkerAlt } from "react-icons/fa";

export default function MissionFreelance() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    budget: "",
    date_debut: "",
    date_fin: "",
    duree_days: "",
    city: "",
    country: "",
    statut: "publie",
  });

  const { data: missions, isLoading } = useQuery({
    queryKey: ["mission-freelances"],
    queryFn: async () => {
      const { data } = await axios.get("/company/missions");
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => await axios.post("/company/missions", newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["mission-freelances"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Mission freelance créée !");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (newData) => await axios.put(`/company/missions/${editingMission.id_mission}`, newData),
    onSuccess: () => {
      queryClient.invalidateQueries(["mission-freelances"]);
      setIsModalOpen(false);
      resetForm();
      toast.success("Mission mise à jour !");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => await axios.delete(`/company/missions/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["mission-freelances"]);
      toast.success("Mission supprimée !");
    },
  });

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      budget: "",
      date_debut: "",
      date_fin: "",
      duree_days: "",
      city: "",
      country: "",
      statut: "publie",
    });
    setEditingMission(null);
  };

  const handleEdit = (mission) => {
    setEditingMission(mission);
    setFormData({
      titre: mission.titre || "",
      description: mission.description || "",
      budget: mission.budget || "",
      date_debut: mission.date_debut || "",
      date_fin: mission.date_fin || "",
      duree_days: mission.duree_days || "",
      city: mission.city || "",
      country: mission.country || "",
      statut: mission.statut || "publie",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingMission) {
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
      title="Missions Freelance"
      subtitle="Trouvez des experts pour vos projets ponctuels."
      actions={
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-brand-violet text-white">
          <FaPlus /> Nouvelle mission
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          <p>Chargement...</p>
        ) : missions?.length === 0 ? (
          <Card className="col-span-full py-12 text-center text-slate-500">
            Aucune mission freelance pour le moment.
          </Card>
        ) : (
          missions?.map((mission) => (
            <Card key={mission.id_mission} className="group relative flex flex-col justify-between overflow-hidden border-none p-0 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-brand-violet/30">
              {/* Top accent bar */}
              <div className={`h-1.5 w-full ${mission.statut === 'publie' ? 'bg-amber-500' : 'bg-red-500'}`} />

              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${mission.statut === 'publie' ? 'bg-amber-50/80 text-amber-600 ring-1 ring-amber-500/20' : 'bg-red-50/80 text-red-600 ring-1 ring-red-500/20'}`}>
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${mission.statut === 'publie' ? 'bg-amber-500' : 'bg-red-500'} animate-pulse`} />
                    {mission.statut === 'publie' ? 'Publiée' : 'Fermée'}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(mission)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-brand-violet/10 hover:text-brand-violet">
                      <FaEdit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(mission.id_mission)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-red-50 hover:text-red-500">
                      <FaTrash className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-violet transition-colors">{mission.titre}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {mission.description}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-violet shadow-sm">
                      <FaMoneyBillWave />
                    </div>
                    <span className="truncate">{mission.budget ? `${mission.budget} DH` : 'Budget flexible'}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2 ring-1 ring-slate-100">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-violet shadow-sm">
                      <FaCalendarAlt />
                    </div>
                    <span className="truncate">{mission.duree_days ? `${mission.duree_days} jours` : '—'}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-100">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-brand-violet shadow-sm">
                    <FaMapMarkerAlt />
                  </div>
                  <span className="truncate">{mission.city || '—'}, {mission.country || '—'}</span>
                </div>

                {/* Bottom Section: Type */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {mission.date_debut && (
                      <span className="text-[10px] text-slate-400 italic">Du {mission.date_debut} {mission.date_fin ? `au ${mission.date_fin}` : ''}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
                    <FaStar className="text-brand-violet/50" />
                    <span>FREELANCE</span>
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
          title={editingMission ? "Modifier la mission" : "Créer une mission freelance"}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Titre du projet" name="titre" value={formData.titre} onChange={handleChange} required />
            <div className="grid gap-4 md:grid-cols-3">
              <Input label="Budget (DH)" type="number" name="budget" value={formData.budget} onChange={handleChange} />
              <Input label="Date de début" type="date" name="date_debut" value={formData.date_debut} onChange={handleChange} />
              <Input label="Date de fin" type="date" name="date_fin" value={formData.date_fin} onChange={handleChange} />
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Input label="Durée (en jours)" type="number" name="duree_days" value={formData.duree_days} onChange={handleChange} placeholder="Ex: 15" />
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Statut</label>
                <select name="statut" value={formData.statut} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm">
                  <option value="publie">Publiée</option>
                  <option value="ferme">Fermée</option>
                </select>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 mt-4">
              <Input label="Ville" name="city" value={formData.city} onChange={handleChange} />
              <Input label="Pays" name="country" value={formData.country} onChange={handleChange} />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700 mt-4">Description détaillée</label>
              <textarea name="description" value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm" rows="4" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Annuler</Button>
              <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                {editingMission ? "Mettre à jour" : "Publier la mission"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  );
}
