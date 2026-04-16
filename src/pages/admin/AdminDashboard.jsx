import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import {
  IoBusinessOutline,
  IoPersonOutline,
  IoTrendingUpOutline,
  IoBriefcaseOutline,
  IoStatsChartOutline
} from "react-icons/io5";
import AppShell from "../../components/layout/AppShell";
import {
  Button,
  Card,
  Skeleton,
  StatCard,
} from "../../components";
import { fetchAdminDashboard } from "../../services/endpoints";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-summary"],
    queryFn: () => fetchAdminDashboard(),
  });

  const cards = data?.cards || {};
  const graphs = data?.graphs || {};

  return (
    <AppShell
      title="Dashboard"
      subtitle="Vue d'ensemble de la plateforme TalentLink"
    >
      {/* Overview Cards */}
      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Étudiants"
          value={cards.students?.total ?? (isLoading ? "-" : 0)}
          icon={<IoPersonOutline size={20} />}
          accent="from-blue-500 to-indigo-600"
          footer={
            <Link to="/admin/candidates?status=pending_document&type=student" className="text-xs font-bold text-white/80 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-1 mt-2">
                {cards.students?.pending ?? 0} demandes en attente
            </Link>
          }
        />
        <StatCard
          label="Entreprises"
          value={cards.companies?.total ?? (isLoading ? "-" : 0)}
          icon={<IoBusinessOutline size={20} />}
          accent="from-emerald-500 to-teal-600"
          footer={
            <Link to="/admin/companies?status=pending_document" className="text-xs font-bold text-white/80 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-1 mt-2">
                {cards.companies?.pending ?? 0} demandes en attente
            </Link>
          }
        />
        <StatCard
          label="Lauréats"
          value={cards.laureats?.total ?? (isLoading ? "-" : 0)}
          icon={<IoStatsChartOutline size={20} />}
          accent="from-amber-500 to-orange-600"
          footer={
            <Link to="/admin/candidates?status=pending_document&type=laureat" className="text-xs font-bold text-white/80 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-1 mt-2">
                {cards.laureats?.pending ?? 0} demandes en attente
            </Link>
          }
        />
        <StatCard
          label="Offres (Total)"
          value={cards.offers?.total ?? (isLoading ? "-" : 0)}
          icon={<IoBriefcaseOutline size={20} />}
          accent="from-purple-500 to-brandViolet"
          footer={
            <Link to="/admin/offers?status=attente" className="text-xs font-bold text-white/80 hover:text-white underline decoration-white/30 underline-offset-4 flex items-center gap-1 mt-2">
                {cards.offers?.pending ?? 0} en attente de modération
            </Link>
          }
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-2 mt-8">
        {/* Growth Stats Area */}
        <Card title="Croissance des utilisateurs" subtitle="Inscriptions sur les 6 derniers mois">
            {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <div className="flex items-end gap-2 h-48 pt-4">
                    {graphs.user_growth && Object.entries(graphs.user_growth).map(([month, count]) => (
                        <div key={month} className="flex-1 group relative">
                            <div 
                                className="bg-brand-violet/20 group-hover:bg-brand-violet/40 transition-all rounded-t-lg" 
                                style={{ height: `${(count / Math.max(...Object.values(graphs.user_growth), 1)) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    {count}
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-2 text-center whitespace-nowrap overflow-hidden italic">{month}</div>
                        </div>
                    ))}
                </div>
            )}
        </Card>

        <Card title="Offres par catégorie" subtitle="Répartition actuelle du marché">
            {isLoading ? <Skeleton className="h-48 w-full" /> : (
                <div className="space-y-6 pt-4">
                    {[
                        { label: "Emploi", count: graphs.offers?.emploi || 0, color: "bg-blue-500" },
                        { label: "Stage", count: graphs.offers?.stage || 0, color: "bg-emerald-500" },
                        { label: "Freelance", count: graphs.offers?.freelance || 0, color: "bg-amber-500" },
                    ].map(item => (
                        <div key={item.label}>
                            <div className="flex justify-between text-sm mb-1 font-medium">
                                <span>{item.label}</span>
                                <span className="text-slate-500 font-bold">{item.count}</span>
                            </div>
                            <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div 
                                    className={`${item.color} h-full transition-all duration-1000`} 
                                    style={{ width: `${(item.count / (graphs.offers?.emploi + graphs.offers?.stage + graphs.offers?.freelance || 1)) * 100}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
      </div>

      <div className="mt-8 flex justify-center">
            <Button size="lg" variant="primary" leftIcon={<IoBriefcaseOutline />} onClick={() => navigate("/admin/offers")}>
                Gérer toutes les offres
            </Button>
      </div>
    </AppShell>
  );
}