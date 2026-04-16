import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Button, Avatar, Badge } from "../../components";
import { api as axios } from "../../services/api";
import { UNIVERSITIES } from "../../constants/universities";
import { 
  FaUser, FaTools, FaGraduationCap, FaBriefcase, FaCode, FaCertificate,
  FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaUniversity, FaCalendarAlt,
  FaArrowLeft
} from "react-icons/fa";

export default function StudentProfileView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["company-student-profile", id],
    queryFn: async () => {
      const { data } = await axios.get(`/company/students/${id}`);
      return data;
    },
  });

  if (isLoading) return <AppShell title="Chargement...">Chargement du profil...</AppShell>;
  if (error) return <AppShell title="Erreur">Impossible de charger le profil de l'étudiant.</AppShell>;

  const univName = UNIVERSITIES.find(u => u.id === profile.personal_info.universite_id)?.name;

  return (
    <AppShell 
      title={`Profil de ${profile.personal_info.prenom}`}
      subtitle="Vue détaillée du candidat"
      actions={
        <Button variant="outline" onClick={() => navigate(-1)}>
          <FaArrowLeft className="mr-2" /> Retour
        </Button>
      }
    >
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header Card */}
        <Card className="overflow-hidden border-none shadow-xl shadow-slate-200/50 p-0">
          <div className="h-32 bg-gradient-to-r from-brand-violet to-violet-400" />
          <div className="px-8 pb-8 -mt-12">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              <Avatar 
                src={profile.personal_info.photo_profil} 
                alt={profile.personal_info.prenom} 
                size={120} 
                className="border-4 border-white shadow-xl"
              />
              <div className="pb-2 flex-1">
                <h1 className="text-3xl font-bold text-slate-800">
                  {profile.personal_info.prenom} {profile.personal_info.nom}
                </h1>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-slate-500 text-sm">
                  <span className="flex items-center gap-1.5"><FaUniversity /> {univName || "Non spécifiée"}</span>
                  <span className="flex items-center gap-1.5"><FaMapMarkerAlt /> {profile.personal_info.adresse || "Lieu non spécifié"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Email</p>
                  <p className="text-slate-700 font-medium">{profile.personal_info.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaPhone />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Téléphone</p>
                  <p className="text-slate-700 font-medium">{profile.personal_info.telephone || "Non spécifié"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                  <FaGlobe />
                </div>
                <div>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Portfolio</p>
                  {profile.personal_info.lien_portfolio ? (
                    <a href={profile.personal_info.lien_portfolio} target="_blank" rel="noreferrer" className="text-brand-violet hover:underline font-medium truncate max-w-[200px] block">
                      {profile.personal_info.lien_portfolio.replace(/^https?:\/\//, '')}
                    </a>
                  ) : <p className="text-slate-700 font-medium">Non spécifié</p>}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Competences */}
        <Card className="border-none shadow-lg shadow-slate-200/40">
           <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-violet/10 rounded-lg text-brand-violet">
              <FaTools size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Compétences</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile.competences?.length > 0 ? (
              profile.competences.map((skill, idx) => (
                <Badge key={idx} variant="brand" className="px-4 py-1.5 text-sm">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-slate-400 italic text-sm">Aucune compétence spécifiée.</p>
            )}
          </div>
        </Card>

        {/* Formations & Experiences Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Formations */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-brand-violet/10 rounded-lg text-brand-violet">
                <FaGraduationCap size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Formations</h3>
            </div>
            <div className="space-y-6">
              {profile.formations?.length > 0 ? (
                profile.formations.map((f, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-brand-violet/10 flex items-center justify-center text-brand-violet shrink-0 text-xs">
                        <FaGraduationCap />
                      </div>
                      {idx !== profile.formations.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{f.diplome}</h4>
                      <p className="text-brand-violet font-medium text-xs">{f.universite_ecole}</p>
                      <p className="text-slate-400 text-[10px] mt-1">{f.date_debut} — {f.date_fin || "Aujourd'hui"}</p>
                    </div>
                  </div>
                ))
              ) : <p className="text-slate-400 italic text-sm">Aucune formation listée.</p>}
            </div>
          </Card>

          {/* Expériences */}
          <Card className="border-none shadow-lg shadow-slate-200/40">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-500">
                <FaBriefcase size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Expériences</h3>
            </div>
            <div className="space-y-6">
              {profile.experiences?.length > 0 ? (
                profile.experiences.map((e, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 text-xs">
                        <FaBriefcase />
                      </div>
                      {idx !== profile.experiences.length - 1 && <div className="w-0.5 h-full bg-slate-100 my-1" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{e.titre}</h4>
                      <p className="text-brand-violet font-semibold text-xs mb-1">{e.entreprise_nom}</p>
                      <p className="text-slate-500 font-medium text-[10px] uppercase tracking-tighter">{e.type}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5">{e.date_debut} — {e.date_fin || "Aujourd'hui"}</p>
                      <p className="text-slate-600 text-xs mt-2 line-clamp-3">{e.description}</p>
                    </div>
                  </div>
                ))
              ) : <p className="text-slate-400 italic text-sm">Aucune expérience listée.</p>}
            </div>
          </Card>
        </div>

        {/* Projets */}
        <Card className="border-none shadow-lg shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-violet/10 rounded-lg text-brand-violet">
              <FaCode size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Portfolio & Projets</h3>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {profile.projets?.length > 0 ? (
              profile.projets.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-slate-100 bg-white overflow-hidden shadow-sm group hover:shadow-md transition-all">
                  {p.image_apercu_url && (
                    <img src={p.image_apercu_url} alt={p.titre} className="h-32 w-full object-cover" />
                  )}
                  <div className="p-4">
                    <h4 className="font-bold text-slate-800 text-sm mb-1">{p.titre}</h4>
                    <p className="text-slate-500 text-[11px] line-clamp-2 mb-3">{p.description}</p>
                    <div className="flex items-center gap-3 text-xs font-bold text-brand-violet">
                      {p.lien_demo && <a href={p.lien_demo} target="_blank" rel="noreferrer" className="hover:underline">DEMO</a>}
                      {p.lien_code && <a href={p.lien_code} target="_blank" rel="noreferrer" className="hover:underline">CODE</a>}
                    </div>
                  </div>
                </div>
              ))
            ) : <p className="text-slate-400 italic text-sm col-span-full">Aucun projet mis en avant.</p>}
          </div>
        </Card>

        {/* Certificats */}
        <Card className="border-none shadow-lg shadow-slate-200/40">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-500">
              <FaCertificate size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Certifications</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {profile.certificats?.length > 0 ? (
              profile.certificats.map((c, idx) => (
                <div key={idx} className="flex items-start gap-4 p-3 rounded-xl border border-slate-50 bg-slate-50/30">
                  <FaCertificate className="text-amber-400 mt-1" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm leading-snug">{c.titre}</h4>
                    <p className="text-slate-500 text-[11px]">{c.organisme}</p>
                  </div>
                </div>
              ))
            ) : <p className="text-slate-400 italic text-sm col-span-full">Aucun certificat ajouté.</p>}
          </div>
        </Card>

      </div>
    </AppShell>
  );
}

