import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Modal } from "../../components";
import { FaSearch, FaMapMarkerAlt, FaFileAlt, FaCheckCircle } from "react-icons/fa";
import { api } from "../../services/api";
import { toast } from "react-toastify";
import { getStorageUrl } from "../../utils/helpers";

export default function StudentOffers() {
  const [filterType, setFilterType] = useState("");
  const [search, setSearch] = useState("");
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState({});
  const queryClient = useQueryClient();

  const { data: offers, isLoading } = useQuery({
    queryKey: ["offers", filterType],
    queryFn: async () => {
      const res = await api.get(`/offres?type=${filterType}`);
      return res.data;
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (formData) => {
      return await api.post("/applications", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      toast.success("Candidature envoyée !");
      setIsModalOpen(false);
      setFiles({});
      queryClient.invalidateQueries(["applications"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    },
  });

  const filteredOffers = offers?.filter((o) =>
    o.titre?.toLowerCase().includes(search.toLowerCase()) ||
    o.poste?.toLowerCase().includes(search.toLowerCase()) ||
    o.entreprise?.nom?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenDetails = (offer) => {
    setSelectedOffer(offer);
    setIsModalOpen(true);
    setFiles({});
  };

  const getOfferTypeLabel = (type) => {
    switch (type) {
      case "internship": return "Stage";
      case "employment": return "Emploi";
      case "freelance": return "Freelance";
      default: return type;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "internship": return "bg-blue-100 text-blue-700";
      case "employment": return "bg-green-100 text-green-700";
      case "freelance": return "bg-purple-100 text-purple-700";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <AppShell title="Explorer les opportunités" subtitle="Trouvez l'offre qui vous correspond">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 max-w-md">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un poste, une entreprise..."
            className="w-full rounded-2xl border-none bg-white py-3 pl-12 pr-4 shadow-sm ring-1 ring-slate-200 transition-all focus:ring-2 focus:ring-brand-violet"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <button
            onClick={() => setFilterType("")}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${filterType === "" ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Tous
          </button>
          <button
            onClick={() => setFilterType("employment")}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${filterType === "employment" ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Emploi
          </button>
          <button
            onClick={() => setFilterType("internship")}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${filterType === "internship" ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Stage
          </button>
          <button
            onClick={() => setFilterType("freelance")}
            className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-bold transition-all ${filterType === "freelance" ? "bg-brand-violet text-white shadow-lg shadow-brand-violet/20" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            Freelance
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-100"></div>
          ))}
        </div>
      ) : filteredOffers?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center shadow-sm">
          <div className="mb-4 rounded-full bg-slate-50 p-6 text-slate-300">
            <FaSearch size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-800">Aucune offre trouvée</h3>
          <p className="mt-2 text-slate-500">Essayez de modifier vos filtres ou votre recherche.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredOffers?.map((offer) => (
            <Card key={offer.id_offre_stage || offer.id_offre_emploi || offer.id_mission} className="group flex h-full flex-col overflow-hidden border-none p-0 transition-all hover:-translate-y-1 hover:shadow-xl">
              <div className="flex flex-col p-6 flex-1">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider ${getBadgeColor(offer.type)}`}>
                    {getOfferTypeLabel(offer.type)}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {offer.matching_score != null && (
                      <div className={`rounded-xl border px-2.5 py-1 text-xs font-bold shadow-sm ${
                        offer.matching_score >= 80 ? "border-green-200 bg-green-50 text-green-700" :
                        offer.matching_score >= 60 ? "border-amber-200 bg-amber-50 text-amber-700" :
                        "border-slate-200 bg-slate-50 text-slate-600"
                      }`}>
                         Match IA: {Math.round(offer.matching_score)}%
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="line-clamp-2 text-lg font-bold text-slate-800 transition-colors group-hover:text-brand-violet">
                  {offer.titre || offer.poste}
                </h3>

                <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-brand-magenta">
                  {offer.entreprise?.nom}
                </p>

                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                  <FaMapMarkerAlt className="shrink-0" />
                  <span className="truncate">{offer.adresse || "À distance"}</span>
                </div>

                <p className="mt-4 line-clamp-3 text-sm text-slate-600 leading-relaxed">
                  {offer.description}
                </p>
              </div>

              <div className="border-t border-slate-50 bg-slate-50/50 p-4">
                <Button
                  onClick={() => handleOpenDetails(offer)}
                  className="w-full justify-center rounded-xl bg-white text-brand-violet ring-1 ring-brand-violet/20 hover:bg-brand-violet hover:text-white"
                >
                  Voir les détails
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedOffer && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={selectedOffer.titre || selectedOffer.poste}
        >
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Localisation</p>
                  <p className="text-sm font-bold text-slate-700 truncate flex items-center gap-1.5"><FaMapMarkerAlt className="text-brand-violet" /> {selectedOffer.adresse || "Remote"}</p>
               </div>
               <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {selectedOffer.type === 'employment' ? 'Salaire' : (selectedOffer.type === 'internship' ? 'Rémunération' : 'Budget')}
                  </p>
                  <p className="text-sm font-bold text-brand-magenta">
                    {selectedOffer.salaire || selectedOffer.remuneration || selectedOffer.budget || "À négocier"} 
                    {(selectedOffer.salaire || selectedOffer.remuneration || selectedOffer.budget) ? " DH" : ""}
                  </p>
               </div>
               {selectedOffer.experience_requise && (
                 <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expérience</p>
                    <p className="text-sm font-bold text-slate-700">{selectedOffer.experience_requise}</p>
                 </div>
               )}
               {(selectedOffer.duree_days || selectedOffer.duree) && (
                 <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Durée</p>
                    <p className="text-sm font-bold text-slate-700">{selectedOffer.duree_days || selectedOffer.duree} jours</p>
                 </div>
               )}
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2 space-y-8">
                <section>
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">Description du poste</h4>
                  <p className="whitespace-pre-line text-slate-600 leading-relaxed text-sm">
                    {selectedOffer.description}
                  </p>
                </section>

                <section>
                  <h4 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">Compétences recherchées</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOffer.competences?.length > 0 ? (
                      selectedOffer.competences.map((c, i) => (
                        <span key={i} className="rounded-lg bg-brand-violet/5 px-3 py-1.5 text-xs font-medium text-brand-violet border border-brand-violet/10">
                          {c.nom}
                        </span>
                      ))
                    ) : (
                      selectedOffer.competences_requises?.split(',').map((c, i) => (
                        <span key={i} className="rounded-lg bg-brand-violet/5 px-3 py-1.5 text-xs font-medium text-brand-violet border border-brand-violet/10">
                          {c.trim()}
                        </span>
                      ))
                    )}
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                  <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">À propos de l'entreprise</h4>
                  <div className="flex items-center gap-3 mb-4">
                     {selectedOffer.entreprise?.logo_url && (
                        <img src={getStorageUrl(selectedOffer.entreprise.logo_url)} alt="Logo" className="w-12 h-12 rounded-xl object-cover shadow-sm bg-white" />
                     )}
                     <div>
                        <p className="font-bold text-slate-800 text-sm">{selectedOffer.entreprise?.nom}</p>
                        <p className="text-[10px] text-brand-violet font-bold uppercase">{selectedOffer.entreprise?.secteur_activite || "Secteur non défini"}</p>
                     </div>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-4 leading-relaxed mb-4">
                    {selectedOffer.entreprise?.description || "Aucune description disponible pour cette entreprise."}
                  </p>
                  {selectedOffer.entreprise?.site_web && (
                    <a 
                      href={selectedOffer.entreprise.site_web} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-xs font-bold text-brand-magenta hover:underline"
                    >
                      Visiter le site web →
                    </a>
                  )}
                </section>
              </div>
            </div>

            <section className="mt-4 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-2xl">
              <h4 className="mb-6 flex items-center gap-3 text-lg font-bold">
                <FaFileAlt className="text-brand-magenta" /> 
                {selectedOffer.document_requise ? "Documents Requis pour Postuler" : "Postuler à cette offre"}
              </h4>

              {selectedOffer.document_requise ? (
                <div className="space-y-4">
                  {selectedOffer.document_requise.split(',').map((docName, i) => {
                    const name = docName.trim();
                    return (
                      <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/10 hover:border-brand-magenta/30 transition-all">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-brand-magenta/20 text-brand-magenta flex items-center justify-center text-[10px]">{i+1}</span>
                          {name}
                        </p>
                        <label className="relative flex items-center gap-3 cursor-pointer group">
                          <div className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm text-white/60 border border-white/5 group-hover:bg-white/20 transition-all truncate">
                            {files[name] ? (
                              <span className="text-brand-magenta font-bold flex items-center gap-2">
                                <FaCheckCircle className="shrink-0" /> {files[name].name}
                              </span>
                            ) : "Choisir le fichier..."}
                          </div>
                          <div className="shrink-0 bg-brand-violet px-4 py-3 rounded-xl font-bold text-xs hover:bg-brand-violet/80 transition-all">
                            PARCOURIR
                          </div>
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                setFiles(prev => ({ ...prev, [name]: file }));
                              }
                            }}
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="mb-6 text-sm text-slate-400">
                  Aucun document spécifique n'est requis pour cette offre. Cliquez sur le bouton ci-dessous pour envoyer votre profil.
                </p>
              )}

              {(() => {
                const required = selectedOffer.document_requise?.split(',').map(d => d.trim()) || [];
                const missingCount = required.filter(r => !files[r]).length;
                const isComplete = missingCount === 0;

                return (
                  <>
                    {!isComplete && (
                      <div className="mt-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                            ⚠️
                         </div>
                         <p>Il vous reste <strong>{missingCount} document(s)</strong> à joindre pour pouvoir postuler.</p>
                      </div>
                    )}

                    <Button
                      isLoading={applyMutation.isPending}
                      disabled={!isComplete || applyMutation.isPending}
                      onClick={() => {
                        const missing = required.filter(r => !files[r]);
                        if (missing.length > 0) {
                          toast.error(`Documents manquants : ${missing.join(', ')}`);
                          return;
                        }

                        const formData = new FormData();
                        formData.append("offer_id", selectedOffer.id_offre_stage || selectedOffer.id_offre_emploi || selectedOffer.id_mission);
                        formData.append("type", selectedOffer.type);
                        
                        Object.entries(files).forEach(([docName, file]) => {
                          formData.append("files[]", file);
                          formData.append("document_names[]", docName);
                        });

                        applyMutation.mutate(formData);
                      }}
                      className={`mt-8 w-full justify-center rounded-2xl py-4 text-lg font-bold text-white transition-all shadow-xl ${isComplete ? 'bg-gradient-to-r from-brand-violet to-brand-magenta shadow-brand-violet/40 hover:scale-[1.02] active:scale-[0.98]' : 'bg-slate-700 cursor-not-allowed opacity-50 shadow-none'}`}
                    >
                      {applyMutation.isPending ? "Envoi en cours..." : (isComplete ? "Envoyer ma Candidature" : "Dossier Incomplet")}
                    </Button>
                  </>
                );
              })()}

              <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                Votre profil complet sera partagé avec l'entreprise
              </p>
            </section>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
