import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import AppShell from "../../components/layout/AppShell";
import { Button, Card, Badge, StatCard, Avatar } from "../../components";
import ChatbotIcon from "../../components/common/ChatbotIcon";
import { useAuth } from "../../hooks";
import { api } from "../../services/api";
import { FaPaperPlane, FaCompass, FaChevronRight, FaClock, FaCheckCircle, FaTimesCircle, FaStar, FaQuoteLeft, FaRobot } from "react-icons/fa";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: applications, isLoading } = useQuery({
    queryKey: ["applications-dashboard"],
    queryFn: async () => {
      const res = await api.get("/applications");
      return res.data;
    },
  });

  const { data: evaluations, isLoading: isEvalLoading } = useQuery({
    queryKey: ["student-evaluations-dashboard"],
    queryFn: async () => {
      const res = await api.get(`/evaluations/candidat/me`); // I'll use /me if possible or fetch id
      return res.data;
    },
  });

  const avgRating = useMemo(() => {
    if (!evaluations || evaluations.length === 0) return 0;
    return (evaluations.reduce((acc, curr) => acc + parseFloat(curr.note), 0) / evaluations.length).toFixed(1);
  }, [evaluations]);

  const recentApps = applications?.slice(0, 3) || [];
  const pendingCount = applications?.filter(a => a.statut === 'en_attente').length || 0;
  const acceptedCount = applications?.filter(a => a.statut === 'acceptée').length || 0;

  const getStatusBadge = (status) => {
    switch (status) {
      case "en_attente":
        return <Badge className="bg-yellow-50 text-yellow-600 border-yellow-100"><FaClock className="mr-1" /> En attente</Badge>;
      case "acceptée":
        return <Badge className="bg-green-50 text-green-600 border-green-100"><FaCheckCircle className="mr-1" /> Acceptée</Badge>;
      case "refusée":
        return <Badge className="bg-rose-50 text-rose-600 border-rose-100"><FaTimesCircle className="mr-1" /> Refusée</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  return (
    <>
      <AppShell title={`Bonjour, ${user?.nom || "Étudiant"}`} subtitle="Prêt pour votre prochaine opportunité ?">
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <StatCard
            title="Candidatures"
            value={applications?.length || 0}
            icon={<FaPaperPlane className="text-brand-violet" />}
            description="Total envoyées"
          />
          <StatCard
            title="En attente"
            value={pendingCount}
            icon={<FaClock className="text-yellow-500" />}
            description="Réponses espérées"
          />
          <StatCard
            title="Acceptées"
            value={acceptedCount}
            icon={<FaCheckCircle className="text-green-500" />}
            description="Jobs confirmés"
          />
          <StatCard
            title="Note Moyenne"
            value={avgRating || "0.0"}
            icon={<FaStar className="text-amber-500" />}
            description="Feedback entreprises"
          />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-800">Candidatures récentes</h3>
                <Button
                  variant="ghost"
                  className="text-xs font-bold text-brand-violet"
                  onClick={() => navigate("/student/applications")}
                >
                  Tout voir <FaChevronRight className="ml-1" />
                </Button>
              </div>

              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2].map(i => <div key={i} className="h-20 animate-pulse bg-slate-100 rounded-2xl"></div>)}
                </div>
              ) : recentApps.length > 0 ? (
                <div className="space-y-3">
                  {recentApps.map((app, index) => (
                    <Card key={index} className="flex items-center justify-between p-4 hover:shadow-md transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-brand-violet/10 flex items-center justify-center text-brand-violet">
                          <FaPaperPlane size={14} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm line-clamp-1">{app.offer_title}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Postulé le {new Date(app.date_postulation).toLocaleDateString()}</p>
                        </div>
                      </div>
                      {getStatusBadge(app.statut)}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-sm text-slate-400">Aucune candidature pour le moment.</p>
                </div>
              )}
            </section>
          </div>

          <div className="space-y-6">
            <Card className="bg-brand-violet text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Trouver votre voie</h4>
                <p className="text-white/80 text-xs mb-6 leading-relaxed">
                  Des centaines d'offres de stages et d'emplois vous attendent. Boostez votre carrière maintenant.
                </p>
                <Button
                  onClick={() => navigate("/student/offres")}
                  className="bg-white text-brand-violet hover:bg-slate-100 w-full justify-center rounded-xl py-3 font-bold"
                >
                  <FaCompass size={14} className="mr-2" /> Explorer les offres
                </Button>
              </div>
              <FaCompass size={120} className="absolute -bottom-4 -right-10 text-white/5 rotate-12" />
            </Card>

            <Card className="bg-gradient-to-br from-brand-magenta to-brand-violet text-white overflow-hidden relative">
              <div className="relative z-10">
                <h4 className="text-lg font-bold mb-2">Analyse de CV</h4>
                <p className="text-white/80 text-xs mb-6 leading-relaxed">
                  Utilisez notre IA pour analyser votre CV et remplir automatiquement votre profil.
                </p>
                <Button
                  onClick={() => navigate("/student/profile-setup")}
                  className="bg-white text-brand-violet hover:bg-slate-100 w-full justify-center rounded-xl py-3 font-bold"
                >
                  <FaRobot size={14} className="mr-2" /> Analyser mon CV
                </Button>
              </div>
              <FaRobot size={120} className="absolute -bottom-4 -right-10 text-white/5 rotate-12" />
            </Card>

            <Card className="border-none shadow-md p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-slate-800 text-sm">Dernier avis</h4>
                <div onClick={() => navigate("/student/profile")} className="text-[10px] text-brand-violet font-bold cursor-pointer hover:underline">Voir tout</div>
              </div>

              {isEvalLoading ? (
                <div className="animate-pulse flex space-x-4">
                  <div className="h-10 w-10 bg-slate-100 rounded-full"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-2 bg-slate-100 rounded"></div>
                    <div className="h-2 bg-slate-100 rounded w-5/6"></div>
                  </div>
                </div>
              ) : (evaluations && evaluations.length > 0) ? (
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 relative">
                  <FaQuoteLeft className="absolute -top-1 -left-1 text-slate-200" size={16} />
                  <p className="text-xs text-slate-600 italic line-clamp-2">
                    {evaluations[0].commentaire || "Pas de commentaire."}
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Avatar size={24} src={null} alt="Company" />
                    <div>
                      <p className="text-[10px] font-bold text-slate-800">{evaluations[0].entreprise?.user?.nom}</p>
                      <p className="text-[8px] text-slate-400 uppercase tracking-widest">{new Date(evaluations[0].created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Aucun avis pour le moment
                </div>
              )}
            </Card>
          </div>
        </div>
      </AppShell>
      <ChatbotIcon />
    </>
  );
}
