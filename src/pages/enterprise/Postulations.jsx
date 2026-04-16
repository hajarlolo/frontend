import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Modal, Avatar, Badge, EvaluationModal } from "../../components";
import { api as axios } from "../../services/api";
import { UNIVERSITIES } from "../../constants/universities";
import { 
  FaFileDownload, FaTools, FaGraduationCap, FaBriefcase,
  FaUniversity, FaMapMarkerAlt, FaEnvelope, FaPhone, FaCertificate, FaCode,
  FaStar
} from "react-icons/fa";

const BACKEND_URL = axios.defaults.baseURL;

export default function Postulations() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [viewingDocs, setViewingDocs] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  // Evaluation state
  const [evalModal, setEvalModal] = useState({ open: false, data: null });

  const { data: postulations, isLoading, refetch } = useQuery({
    queryKey: ["company-postulations", activeTab],
    queryFn: async () => {
      const { data } = await axios.get("/company/postulations", {
        params: { type: activeTab }
      });
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id_offer, id_candidat, type, statut }) => {
      return await axios.patch("/postulations/status", { id_offer, id_candidat, type, statut });
    },
    onSuccess: () => {
      refetch();
    }
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["company-student-profile", selectedStudentId],
    queryFn: async () => {
      const { data } = await axios.get(`/company/students/${selectedStudentId}`);
      return data;
    },
    enabled: !!selectedStudentId,
  });

  const getStatusBadge = (statut) => {
    const s = statut?.toLowerCase() || 'en attente';
    const config = {
      'en attente': 'bg-amber-100 text-amber-700',
      'entretien': 'bg-blue-100 text-blue-700',
      'acceptée': 'bg-emerald-100 text-emerald-700',
      'refusée': 'bg-rose-100 text-rose-700',
    };
    return config[s] || config['en attente'];
  };

  const getUnivName = (id) => UNIVERSITIES.find(u => u.id === id)?.name || "Non spécifiée";
  const getStorageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const normalizedPath = path.startsWith('/storage') ? path : `/storage/${path}`;
    return `${BACKEND_URL}${normalizedPath}`.replace(/([^:])\/\//g, '$1/');
  };

  return (
    <AppShell 
      title="Candidatures" 
      subtitle="Gérez toutes les postulations reçues pour vos offres."
    >
      <div className="space-y-6">
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-3">
          {['all', 'emploi', 'stage', 'freelance'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'brand' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab)}
              className="px-6 rounded-full capitalize"
            >
              {tab === 'all' ? 'Toutes' : tab}
            </Button>
          ))}
        </div>

        {/* Tableau */}
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/40 p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidat</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Offre / Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dossier (CV)</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-4 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">Chargement...</td></tr>
                ) : postulations?.length === 0 ? (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400">Aucune candidature trouvée.</td></tr>
                ) : postulations?.map((post, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{post.etudiant?.user?.prenom} {post.etudiant?.user?.nom}</div>
                      <div className="text-xs text-slate-500">{post.etudiant?.user?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{post.offre_titre}</div>
                      <Badge variant="secondary" className="mt-1 text-[10px] uppercase">{post.type}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Button 
                        variant="soft" 
                        size="sm" 
                        className="rounded-xl px-4 py-1.5 font-bold group border border-slate-100"
                        onClick={() => setViewingDocs(post)}
                      >
                        <FaFileDownload className="mr-2 text-brand-violet group-hover:scale-110 transition-transform" />
                        Voir Dossier 
                        {post.documents?.length > 0 && (
                          <span className="ml-2 bg-brand-violet text-white text-[9px] px-1.5 py-0.5 rounded-full">
                            {post.documents.length + (post.cv_url ? 1 : 0)}
                          </span>
                        )}
                      </Button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusBadge(post.statut)}`}>
                        {post.statut || 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="font-bold text-brand-violet hover:bg-brand-violet/10 rounded-xl px-4"
                          onClick={() => setSelectedStudentId(post.etudiant?.id_candidat)}
                        >
                          Voir Profil
                        </Button>
                        
                        <div className="h-6 w-[1px] bg-slate-200 mx-1"></div>

                        {post.statut === 'acceptée' ? (
                          <div className="flex flex-col gap-2">
                            <Badge className="bg-emerald-500 text-white border-none px-4 py-1.5 rounded-xl font-black text-[10px] shadow-lg shadow-emerald-500/20">
                               CANDIDAT ACCEPTÉ
                            </Badge>
                            <Button 
                              variant="soft" 
                              size="sm" 
                              className="text-[10px] font-bold py-1 px-3 rounded-lg flex items-center justify-center gap-1 border-emerald-100 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              onClick={() => setEvalModal({ 
                                open: true, 
                                data: {
                                  id_entreprise: post.id_entreprise,
                                  id_candidat: post.etudiant.id_candidat,
                                  name: `${post.etudiant?.user?.prenom} ${post.etudiant?.user?.nom}`
                                }
                              })}
                            >
                               <FaStar size={10} /> Évaluer
                            </Button>
                          </div>
                        ) : post.statut === 'refusée' ? (
                          <Badge className="bg-rose-500 text-white border-none px-4 py-1.5 rounded-xl font-black text-[10px] shadow-lg shadow-rose-500/20">
                             REFUSÉ
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm"
                              className="bg-emerald-500 text-white hover:bg-emerald-600 border-none shadow-lg shadow-emerald-500/20 rounded-xl font-bold text-[10px] px-3 transition-all"
                              onClick={() => updateStatusMutation.mutate({
                                id_offer: post.id_offer,
                                id_candidat: post.etudiant.id_candidat,
                                type: post.type,
                                statut: 'acceptée'
                              })}
                            >
                              Accepter
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-rose-500 text-white hover:bg-rose-600 border-none shadow-lg shadow-rose-500/20 rounded-xl font-bold text-[10px] px-3 transition-all"
                              onClick={() => updateStatusMutation.mutate({
                                id_offer: post.id_offer,
                                id_candidat: post.etudiant.id_candidat,
                                type: post.type,
                                statut: 'refusée'
                              })}
                            >
                              Refuser
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Documents Modal */}
      <Modal
        open={!!viewingDocs}
        onClose={() => {
          setViewingDocs(null);
          setPreviewUrl(null);
        }}
        title="Dossier de candidature"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-2">
            {viewingDocs?.cv_url && (
              <button 
                onClick={() => {
                  const path = viewingDocs.cv_url;
                  let fullUrl = path.startsWith('http') ? path : (path.startsWith('/storage') ? `${BACKEND_URL}${path}` : `${BACKEND_URL}/storage/${path}`);
                  fullUrl = fullUrl.replace(/([^:])\/\//g, '$1/');
                  setPreviewUrl({ url: fullUrl, type: 'pdf' });
                }}
                className={`group p-5 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-3 ${previewUrl?.url?.includes(viewingDocs.cv_url) ? 'border-brand-violet bg-brand-violet/10 shadow-lg shadow-brand-violet/10' : 'border-brand-violet/10 bg-brand-violet/5 hover:bg-brand-violet/10 hover:border-brand-violet/20'}`}
              >
                <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-violet group-hover:scale-110 transition-transform">
                  <FaFileDownload size={24} />
                </div>
                <div className="font-bold text-slate-800 text-xs">CV Principal</div>
                <div className="mt-1 px-3 py-1 rounded-lg bg-brand-violet text-white text-[9px] font-bold">
                   Aperçu rapide
                </div>
              </button>
            )}
            
            {viewingDocs?.documents?.map((doc, idx) => {
              const isPdf = doc.name?.toLowerCase().endsWith('.pdf') || doc.path?.toLowerCase().endsWith('.pdf');
              const path = doc.path;
              let docUrl = path.startsWith('http') ? path : (path.startsWith('/storage') ? `${BACKEND_URL}${path}` : `${BACKEND_URL}/storage/${path}`);
              docUrl = docUrl.replace(/([^:])\/\//g, '$1/'); // Normalize double slashes
              
              return (
                <button 
                  key={idx}
                  onClick={() => setPreviewUrl({ url: docUrl, type: isPdf ? 'pdf' : 'image' })}
                  className={`group p-5 rounded-3xl border-2 transition-all text-center flex flex-col items-center gap-3 ${previewUrl?.url === docUrl ? 'border-brand-violet bg-brand-violet/10 shadow-lg shadow-brand-violet/10' : 'border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-violet/20'}`}
                >
                  <div className="h-14 w-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-brand-violet transition-colors group-hover:scale-110 transition-transform">
                    <FaFileDownload size={24} />
                  </div>
                  <div className="font-bold text-slate-800 text-xs line-clamp-1 w-full px-2">{doc.name || `Document ${idx+1}`}</div>
                  <div className="mt-1 px-3 py-1 rounded-lg bg-slate-200 text-slate-700 text-[9px] font-bold group-hover:bg-brand-violet group-hover:text-white transition-all">
                    Aperçu rapide
                  </div>
                </button>
              );
            })}
          </div>

          {previewUrl && (
             <div className="bg-slate-50 rounded-[32px] border-2 border-slate-100 overflow-hidden shadow-inner p-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between mb-3 px-2">
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aperçu du document</div>
                   <a 
                     href={previewUrl.url} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="text-[10px] font-bold text-brand-violet hover:underline flex items-center gap-1"
                   >
                     Plein écran <FaFileDownload size={10} />
                   </a>
                </div>
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 min-h-[50vh] flex items-center justify-center">
                   {previewUrl.url.toLowerCase().endsWith('.png') || previewUrl.url.toLowerCase().endsWith('.jpg') || previewUrl.url.toLowerCase().endsWith('.jpeg') ? (
                      <img src={previewUrl.url} alt="Aperçu" className="max-w-full h-auto" style={{ maxHeight: "60vh" }} />
                   ) : (
                      <iframe src={previewUrl.url} className="w-full h-[60vh] border-none" title="Aperçu" />
                   )}
                </div>
             </div>
          )}

          {!viewingDocs?.cv_url && (!viewingDocs?.documents || viewingDocs?.documents.length === 0) && (
            <div className="col-span-full py-10 text-center text-slate-400 italic">
              Aucun document n'a été fourni pour cette candidature.
            </div>
          )}
        </div>
      </Modal>

      {/* Profile Modal */}
      <Modal
        open={!!selectedStudentId}
        onClose={() => setSelectedStudentId(null)}
        title="Détails du Candidat"
        size="lg"
      >
        {isProfileLoading ? (
          <div className="py-20 text-center">Chargement du profil...</div>
        ) : profile ? (
          <div className="space-y-8 max-h-[80vh] overflow-y-auto px-1">
            {/* Header / Personal Info */}
            <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl bg-slate-50">
              <Avatar src={getStorageUrl(profile.personal_info.photo_profil)} alt="Portrait" size={100} className="border-4 border-white shadow-lg" />
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl font-bold text-slate-800">{profile.personal_info.prenom} {profile.personal_info.nom}</h2>
                <p className="text-brand-violet font-medium flex items-center justify-center md:justify-start gap-2 mt-1">
                  <FaUniversity /> {getUnivName(profile.personal_info.universite_id)}
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><FaEnvelope /> {profile.personal_info.email}</span>
                  <span className="flex items-center gap-1.5"><FaPhone /> {profile.personal_info.telephone || "N/A"}</span>
                  <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {profile.personal_info.adresse || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Compétences */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <FaTools className="text-brand-violet" /> Compétences
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.competences?.length > 0 ? profile.competences.map((s, i) => (
                  <Badge key={i} variant="brand" className="px-4 py-1.5">{s}</Badge>
                )) : <span className="text-slate-400 italic text-sm">Non spécifiées</span>}
              </div>
            </div>

            {/* Expériences & Formations Grid */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaBriefcase className="text-blue-500" /> Expériences
                </h3>
                <div className="space-y-4">
                  {profile.experiences?.length > 0 ? profile.experiences.map((e, i) => (
                    <div key={i} className="pl-4 border-l-2 border-blue-100 pb-2">
                      <div className="font-bold text-slate-800 text-sm">{e.titre}</div>
                      <div className="text-brand-violet text-xs font-semibold">{e.entreprise_nom}</div>
                      <div className="text-slate-400 text-[10px] uppercase font-bold mt-1">{e.type} | {e.date_debut} - {e.date_fin || "Auj."}</div>
                    </div>
                  )) : <div className="text-slate-400 italic text-sm">Aucune expérience</div>}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <FaGraduationCap className="text-brand-violet" /> Formations
                </h3>
                <div className="space-y-4">
                  {profile.formations?.length > 0 ? profile.formations.map((f, i) => (
                    <div key={i} className="pl-4 border-l-2 border-brand-violet/20 pb-2">
                      <div className="font-bold text-slate-800 text-sm">{f.diplome}</div>
                      <div className="text-slate-500 text-xs">{f.universite_ecole}</div>
                      <div className="text-slate-400 text-[10px] mt-1">{f.date_debut} - {f.date_fin || "Auj."}</div>
                    </div>
                  )) : <div className="text-slate-400 italic text-sm">Aucune formation</div>}
                </div>
              </div>
            </div>

            {/* Projets & Certificats */}
            <div className="grid md:grid-cols-2 gap-8">
               <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FaCode className="text-emerald-500" /> Portfolio (Projets)
                  </h3>
                  <div className="space-y-3">
                    {profile.projets?.length > 0 ? profile.projets.map((p, i) => (
                      <div key={i} className="p-3 rounded-xl border border-slate-100">
                        <div className="font-bold text-slate-800 text-xs">{p.titre}</div>
                        <p className="text-slate-500 text-[10px] line-clamp-1 mt-1">{p.description}</p>
                      </div>
                    )) : <div className="text-slate-400 italic text-sm">Aucun projet</div>}
                  </div>
               </div>
               <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FaCertificate className="text-amber-500" /> Certifications
                  </h3>
                  <div className="space-y-3">
                    {profile.certificats?.length > 0 ? profile.certificats.map((c, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                        <FaCertificate className="text-amber-400" />
                        <div>
                          <div className="font-bold text-slate-800 text-[11px] leading-tight">{c.titre}</div>
                          <div className="text-slate-500 text-[10px]">{c.organisme}</div>
                        </div>
                      </div>
                    )) : <div className="text-slate-400 italic text-sm">Aucune certification</div>}
                  </div>
               </div>
            </div>
            
          </div>
        ) : <div className="py-20 text-center text-rose-500 underline decoration-brand-violet decoration-2">Erreur de chargement.</div>}
      </Modal>

      {/* Evaluation Modal */}
      <EvaluationModal
        isOpen={evalModal.open}
        onClose={() => setEvalModal({ open: false, data: null })}
        targetId={{ id_entreprise: evalModal.data?.id_entreprise, id_candidat: evalModal.data?.id_candidat }}
        targetType="student"
        targetName={evalModal.data?.name}
      />
    </AppShell>
  );
}
