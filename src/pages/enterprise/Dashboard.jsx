import { useQuery } from "@tanstack/react-query";
import AppShell from "../../components/layout/AppShell";
import { Card, Skeleton, Button } from "../../components";
import { api as axios } from "../../services/api";
import { FaBriefcase, FaGraduationCap, FaUserTie, FaUsers, FaEye, FaPlus, FaCheckCircle, FaExclamationCircle, FaStar, FaQuoteLeft } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function EnterpriseDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const { data } = await axios.get("/company/dashboard/stats");
      return data;
    },
  });

  const { data: evaluations, isLoading: isEvalLoading } = useQuery({
    queryKey: ["enterprise-evaluations-dashboard"],
    queryFn: async () => {
      const res = await axios.get(`/evaluations/entreprise/me`);
      return res.data;
    },
  });

  const avgRating = evaluations?.length > 0 
    ? (evaluations.reduce((acc, curr) => acc + parseFloat(curr.note), 0) / evaluations.length).toFixed(1) 
    : "0.0";

  return (
    <AppShell
      title="Tableau de bord entreprise"
      subtitle="Suivi en temps réel de vos activités de recrutement."
      actions={
        <Button as={Link} to="/company/emplois" className="flex items-center gap-2">
          <FaPlus /> Publier une offre
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard 
          title="Offres Emploi" 
          value={stats?.total_offres_emploi} 
          icon={<FaBriefcase />} 
          loading={isLoading}
          color="bg-blue-500"
        />
        <StatCard 
          title="Offres Stage" 
          value={stats?.total_offres_stage} 
          icon={<FaGraduationCap />} 
          loading={isLoading}
          color="bg-indigo-500"
        />
        <StatCard 
          title="Missions" 
          value={stats?.total_missions_freelance} 
          icon={<FaUserTie />} 
          loading={isLoading}
          color="bg-brand-violet"
        />
        <StatCard 
          title="Postulations" 
          value={stats?.total_postulations} 
          icon={<FaUsers />} 
          loading={isLoading}
          color="bg-brand-magenta"
        />
        <StatCard 
          title="Offres Ouvertes" 
          value={stats?.offres_ouvertes} 
          icon={<FaEye />} 
          loading={isLoading}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Note Moyenne" 
          value={avgRating} 
          icon={<FaStar />} 
          loading={isEvalLoading}
          color="bg-amber-500"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-slate-100 p-6">
              <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Activités Récentes</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {stats?.recent_activities?.length > 0 ? (
                stats.recent_activities.map((activity, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-4 transition hover:bg-slate-50">
                    <div className={`mt-1 p-2 rounded-lg text-white ${activity.type === 'application' ? 'bg-brand-violet' : 'bg-brand-magenta'}`}>
                      {activity.type === 'application' ? <FaUsers size={12} /> : <FaCheckCircle size={12} />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                      <p className="text-xs text-slate-500 mt-1">{activity.description}</p>
                      <span className="text-[10px] text-slate-400 mt-2 block font-medium uppercase tracking-tight">{activity.time}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                   <FaExclamationCircle className="mx-auto text-slate-200 text-4xl mb-4" />
                   <p className="text-slate-400 text-sm font-medium">Aucune activité récente à afficher.</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-none shadow-md bg-white">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">Derniers Avis Candidats</h3>
                 <Link to="/company/profile" className="text-[10px] font-bold text-brand-violet hover:underline">Voir tout</Link>
              </div>
              
              {isEvalLoading ? (
                 <div className="space-y-3">
                    {[1, 2].map(i => <Skeleton key={i} className="h-20 w-full rounded-2xl" />)}
                 </div>
              ) : evaluations?.length > 0 ? (
                 <div className="space-y-4">
                    {evaluations.slice(0, 2).map((ev, idx) => (
                       <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 relative group hover:bg-white transition-all">
                          <FaQuoteLeft className="absolute -top-1 -left-1 text-slate-200 opacity-50" size={14} />
                          <div className="flex items-center gap-1 mb-2">
                             {[...Array(5)].map((_, i) => (
                                <FaStar key={i} size={8} className={i < Math.round(ev.note) ? "text-amber-400" : "text-slate-200"} />
                             ))}
                          </div>
                          <p className="text-[11px] text-slate-600 italic line-clamp-2 leading-relaxed mb-3">
                             "{ev.commentaire || "Pas de commentaire."}"
                          </p>
                          <div className="flex items-center gap-2">
                             <div className="w-6 h-6 rounded-full bg-brand-violet/10 flex items-center justify-center text-[10px] font-black text-brand-violet uppercase">
                                {ev.candidat?.user?.prenom?.charAt(0)}
                             </div>
                             <span className="text-[10px] font-bold text-slate-400">
                                {ev.candidat?.user?.prenom} {ev.candidat?.user?.nom?.charAt(0)}.
                             </span>
                          </div>
                       </div>
                    ))}
                 </div>
              ) : (
                 <div className="py-8 text-center text-slate-400 text-xs italic bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    Aucun avis pour le moment
                 </div>
              )}
           </Card>
        </div>
      </div>
    </AppShell>
  );
}

function StatCard({ title, value, icon, loading, color }) {
  return (
    <Card className="overflow-hidden p-0 border-none shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-2xl text-white ${color} shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
            {icon}
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-10 w-16 mb-1" />
        ) : (
          <h3 className="text-3xl font-black text-slate-900 mb-1">{value || 0}</h3>
        )}
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</p>
      </div>
    </Card>
  );
}
