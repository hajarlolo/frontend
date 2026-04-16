import { NavLink } from "react-router-dom";
import { 
  FaChartPie, 
  FaBriefcase, 
  FaGraduationCap, 
  FaUserTie, 
  FaUserCircle,
  FaFileAlt,
  FaSearch,
  FaPaperPlane,
  FaRobot,
  FaQrcode
} from "react-icons/fa";

import { useAuth } from "../../hooks";
import CareerAdvice from "./CareerAdvice";

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role;

  const links = [];

  if (role === "admin") {
    links.push({ name: "Dashboard", path: "/admin/dashboard", icon: FaChartPie });
    links.push({ name: "Entreprises", path: "/admin/companies", icon: FaBriefcase });
    links.push({ name: "Candidats", path: "/admin/candidates", icon: FaUserTie });
    links.push({ name: "Offres", path: "/admin/offers", icon: FaFileAlt });
    links.push({ name: "Logs d'activité", path: "/admin/logs", icon: FaSearch });
  } else if (role === "student" || role === "laureat") {
    links.push({ name: "Tableau de bord", path: "/student/dashboard", icon: FaChartPie });
    links.push({ name: "Explorer Offres", path: "/student/offres", icon: FaSearch });
    links.push({ name: "Mes Candidatures", path: "/student/applications", icon: FaPaperPlane });
    links.push({ name: "CV Scanner", path: "/student/profile-setup", icon: FaFileAlt });
    links.push({ name: "Chatbot IA", path: "/student/chatbot", icon: FaRobot });
  } else if (role === "company") {
    links.push({ name: "Tableau de bord", path: "/company/dashboard", icon: FaChartPie });
    links.push({ name: "Offres d'Emploi", path: "/company/emplois", icon: FaBriefcase });
    links.push({ name: "Offres de Stage", path: "/company/stages", icon: FaGraduationCap });
    links.push({ name: "Missions Freelance", path: "/company/missions", icon: FaUserTie });
    links.push({ name: "Postulations", path: "/company/postulations", icon: FaFileAlt });
  }

  return (
    <aside className="sticky top-6 hidden h-fit w-64 shrink-0 lg:block">
      <nav className="space-y-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors duration-300">
        <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Menu principal
        </p>
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                isActive
                  ? "bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-white shadow-inner-light"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`
            }
          >
            <link.icon className="text-lg opacity-70" />
            {link.name}
          </NavLink>
        ))}
      </nav>

      <CareerAdvice />
    </aside>
  );
}
