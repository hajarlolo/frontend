import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Badge, Modal, Button, EvaluationModal } from "../../components";
import { FaPaperPlane, FaFilter, FaCalendarAlt, FaStar, FaFileDownload, FaBuilding, FaInfoCircle, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function StudentApplications() {
  const { user } = useAuth();
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evalModal, setEvalModal] = useState({ open: false, data: null });

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications", filterType, filterStatus],
    queryFn: async () => {
      const res = await api.get(`/applications?type=${filterType}&status=${filterStatus}`);
      return res.data;
    },
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "en_attente":
        return (
          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-100 flex items-center gap-1.5 px-3 py-1 text-xs font-bold ring-1 ring-yellow-200">
            <FaClock size={10} /> En attente
          </Badge>
        );
      case "acceptée":
        return (
          <Badge className="bg-green-50 text-green-700 border-green-100 flex items-center gap-1.5 px-3 py-1 text-xs font-bold ring-1 ring-green-200">
            <FaCheckCircle size={10} /> Acceptée
          </Badge>
        );
      case "refusée":
        return (
          <Badge className="bg-rose-50 text-rose-700 border-rose-100 flex items-center gap-1.5 px-3 py-1 text-xs font-bold ring-1 ring-rose-200">
            <FaTimesCircle size={10} /> Refusée
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOfferTypeLabel = (type) => {
    switch (type) {
      case "internship": return "Stage";
      case "employment": return "Emploi";
      case "freelance": return "Freelance";
      default: return type;
    }
  };

  return (
    <AppShell title="Mes candidatures" subtitle="Suivez l'état de vos demandes">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0">
          <label className="text-sm font-bold text-slate-500 whitespace-nowrap">Type :</label>
          <select 
            value={filterType} 
            onChange={(e) => setFilterType(e.target.value)}
            className="rounded-xl border-none bg-white py-2 pl-4 pr-10 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-violet"
          >
            <option value="">Tous les types</option>
            <option value="employment">Emploi</option>
            <option value="internship">Stage</option>
            <option value="freelance">Freelance</option>
          </select>

          <label className="text-sm font-bold text-slate-500 whitespace-nowrap ml-4">Statut :</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-xl border-none bg-white py-2 pl-4 pr-10 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-brand-violet"
          >
            <option value="">Tous les statuts</option>
            <option value="en_attente">En attente</option>
            <option value="acceptée">Acceptée</option>
            <option value="refusée">Refusée</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"></div>
          ))}
        </div>
      ) : applications?.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-16 text-center shadow-sm">
          <div className="mb-6 rounded-full bg-slate-50 p-8 text-slate-300 transform transition-transform hover:scale-110">
            <FaPaperPlane size={48} />
          </div>
          <h3 className="text-2xl font-bold text-slate-800">Aucune candidature</h3>
          <p className="mt-2 text-slate-500">Vous n'avez pas encore postulé à des offres.</p>
          <Button 
            className="mt-8 rounded-xl bg-brand-violet text-white px-8 py-3"
            onClick={() => window.location.href = '/student/offres'}
          >
            Explorer les offres
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {applications?.map((app, index) => (
            <Card 
              key={index} 
              className="group relative flex flex-col gap-4 overflow-hidden border-none p-6 transition-all hover:bg-slate-50/50 md:flex-row md:items-center md:justify-between"
            >
               <div className="flex flex-1 items-start gap-4">
                  <div className={`mt-1 h-12 w-12 shrink-0 rounded-2xl bg-gradient-to-br ${app.type === "internship" ? "from-blue-400 to-blue-600" : app.type === "employment" ? "from-green-400 to-green-600" : "from-purple-400 to-purple-600"} p-3 shadow-lg flex items-center justify-center text-white`}>
                     <FaBuilding size={20} className="opacity-80" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                       <h3 className="text-lg font-bold text-slate-800 transition-colors group-hover:text-brand-violet">
                         {app.offer_title}
                       </h3>
                       <Badge className="bg-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-0.5 border-none">
                         {getOfferTypeLabel(app.type)}
                       </Badge>
                    </div>
                    <p className="flex items-center gap-1 text-sm font-semibold text-brand-magenta mt-0.5">
                       {app.offreStage?.entreprise?.nom || app.offreEmploi?.entreprise?.nom || app.missionFreelance?.entreprise?.nom || "Entreprise"}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                       <span className="flex items-center gap-1.5"><FaCalendarAlt /> Postulé le {new Date(app.date_postulation).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1.5 ring-1 ring-slate-100 px-2 py-0.5 rounded-md bg-white text-slate-500"><FaInfoCircle /> {app.documents?.length || 0} document(s)</span>
                    </div>
                  </div>
               </div>

               <div className="flex items-center justify-between gap-4 md:flex-col md:items-end md:justify-center">
                  {getStatusBadge(app.statut)}
                  <Button 
                    onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}
                    className="rounded-lg bg-white p-2 text-slate-400 ring-1 ring-slate-200 transition-all hover:text-brand-violet hover:ring-brand-violet/30"
                  >
                    Voir Détails
                  </Button>
               </div>
            </Card>
          ))}
        </div>
      )}

      {selectedApp && (
        <Modal 
          open={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title="Détails de la candidature"
        >
            <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 flex items-center justify-between shadow-inner">
               <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${selectedApp.type === "internship" ? "from-blue-400 to-blue-600" : selectedApp.type === "employment" ? "from-green-400 to-green-600" : "from-purple-400 to-purple-600"} p-3 shadow-lg flex items-center justify-center text-white`}>
                     <FaBuilding size={20} className="opacity-80" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-800">{selectedApp.offer_title}</h5>
                    <p className="text-xs font-bold text-brand-violet uppercase tracking-wider">{getOfferTypeLabel(selectedApp.type)}</p>
                  </div>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Statut</p>
                  {getStatusBadge(selectedApp.statut)}
               </div>
            </div>

            {selectedApp.statut === 'acceptée' && user?.role === "laureat" && (
              <div className="flex justify-center mt-2">
                <Button 
                  variant="soft" 
                  size="sm" 
                  className="text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl px-4 py-2 font-bold flex items-center gap-2 border border-emerald-100"
                  onClick={() => setEvalModal({
                    open: true,
                    data: {
                       id_entreprise: selectedApp.id_entreprise,
                       id_candidat: selectedApp.id_candidat,
                       name: selectedApp.offreStage?.entreprise?.nom || selectedApp.offreEmploi?.entreprise?.nom || selectedApp.missionFreelance?.entreprise?.nom || "Entreprise"
                    }
                  })}
                >
                  <FaStar className="text-amber-400" /> Évaluer l'entreprise
                </Button>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Postulé le</p>
                  <p className="text-xs font-bold text-slate-700">{new Date(selectedApp.date_postulation).toLocaleDateString()}</p>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rémunération</p>
                  <p className="text-xs font-bold text-brand-magenta">
                    {(selectedApp.offreStage?.remuneration || selectedApp.offreEmploi?.salaire || selectedApp.missionFreelance?.budget) ? 
                     `${selectedApp.offreStage?.remuneration || selectedApp.offreEmploi?.salaire || selectedApp.missionFreelance?.budget} DH` : "N/A"}
                  </p>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Lieu</p>
                  <p className="text-xs font-bold text-slate-700">{selectedApp.offreStage?.adresse || selectedApp.offreEmploi?.adresse || "Remote"}</p>
               </div>
            </div>

            <section className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
               <h4 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 not-italic">Description du poste</h4>
               <p className="line-clamp-6">
                 {selectedApp.offreStage?.description || selectedApp.offreEmploi?.description || selectedApp.missionFreelance?.description}
               </p>
            </section>

            <section>
              <h4 className="mb-4 flex items-center gap-2 font-bold text-slate-800">
                <FaFileDownload className="text-brand-magenta" /> Fichiers transmis
              </h4>
              <div className="grid gap-2">
                {selectedApp.documents && selectedApp.documents.length > 0 ? (
                  selectedApp.documents.map((doc, i) => (
                    <a 
                      key={i} 
                      href={doc.path} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-50 p-2 text-slate-400 group-hover:bg-brand-violet/10 group-hover:text-brand-violet">
                          <FaFileDownload size={14} />
                        </div>
                        <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">{doc.name}</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-violet opacity-0 group-hover:opacity-100 transition-opacity">Télécharger</span>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">Aucun document spécifique transmis.</p>
                )}
              </div>
            </section>

            <div className="rounded-2xl border border-brand-violet/10 bg-brand-violet/10 p-5 flex items-start gap-4">
              <div className="rounded-full bg-brand-violet/20 p-2 text-brand-violet">
                 <FaInfoCircle />
              </div>
              <div>
                <h5 className="text-sm font-bold text-brand-violet">Note de l'établissement</h5>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                   {selectedApp.statut === 'en_attente' ? 
                    "Votre candidature est en cours d'examen. Vous recevrez une notification dès qu'un changement de statut interviendra." :
                    selectedApp.statut === 'acceptée' ? 
                    "Félicitations ! L'entreprise a accepté votre candidature. Attendez-vous à être contacté prochainement." :
                    "L'entreprise a décidé de ne pas donner suite à votre candidature pour le moment."}
                </p>
              </div>
            </div>
        </Modal>
      )}

      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={evalModal.open}
        onClose={() => setEvalModal({ open: false, data: null })}
        targetId={{ id_entreprise: evalModal.data?.id_entreprise, id_candidat: evalModal.data?.id_candidat }}
        targetType="company"
        targetName={evalModal.data?.name}
      />
    </AppShell>
  );
}
