import { IoBusinessOutline, IoSchoolOutline } from "react-icons/io5";
import { FiZap, FiArrowRight } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "../../components/layout/AuthShell";
import { Card, StepIndicator } from "../../components";

const accountTypes = [
  {
    id: "student",
    title: "Étudiant",
    desc: "Trouvez des stages et propulsez votre carrière.",
    icon: <IoSchoolOutline size={28} />,
    colorClass: "text-brandViolet",
    bgClass: "bg-brandViolet/10",
    path: "/register/student?role=student"
  },
  {
    id: "laureat",
    title: "Lauréat",
    desc: "Accédez à des opportunités de haut niveau.",
    icon: <FiZap size={28} />,
    colorClass: "text-brandMagenta",
    bgClass: "bg-brandMagenta/10",
    path: "/register/student?role=laureat"
  },
  {
    id: "company",
    title: "Entreprise",
    desc: "Recrutez les meilleurs talents et développez votre équipe avec agilité.",
    icon: <IoBusinessOutline size={28} />,
    colorClass: "text-brandNavy dark:text-slate-300",
    bgClass: "bg-slate-200 dark:bg-slate-700",
    path: "/register/company"
  }
];

export default function RegisterType() {
  const navigate = useNavigate();

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Sélectionnez votre profil pour démarrer votre parcours."
      maxWidth="max-w-lg"
      stepIndicator={<StepIndicator current={1} total={3} label="Type de compte" />}
      footer={
        <p className="text-slate-400 font-medium">
          Vous avez déjà un compte ?{" "}
          <Link to="/login" className="text-brandViolet font-black hover:opacity-80 transition-opacity">
            Se connecter
          </Link>
        </p>
      }
    >
      <div className="flex flex-col gap-3">
        {/* Etudiant & Laureat Grid */}
        <div className="grid grid-cols-2 gap-3">
          {accountTypes.slice(0, 2).map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => navigate(type.path)}
              className="group relative flex flex-col justify-center items-center text-center gap-2 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 transition-all duration-500 hover:border-brandViolet/50 dark:hover:border-brandViolet/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${type.bgClass} ${type.colorClass} group-hover:bg-brand-gradient group-hover:text-white transition-all duration-500 shadow-inner`}>
                <div className="scale-90">{type.icon}</div>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight transition-colors">
                  {type.title}
                </h3>
                <p className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug transition-colors line-clamp-2">
                  {type.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Entreprise Full Width */}
        <button
          type="button"
          onClick={() => navigate(accountTypes[2].path)}
          className="group relative flex w-full items-center gap-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-4 text-left transition-all duration-500 hover:border-brandViolet/50 dark:hover:border-brandViolet/50 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]"
        >
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] ${accountTypes[2].bgClass} ${accountTypes[2].colorClass} group-hover:bg-brand-gradient group-hover:text-white transition-all duration-500 shadow-inner`}>
            <div className="scale-90">{accountTypes[2].icon}</div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-black text-slate-800 dark:text-white leading-tight transition-colors">
              {accountTypes[2].title}
            </h3>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed transition-colors line-clamp-2">
              {accountTypes[2].desc}
            </p>
          </div>
          <div className="opacity-0 text-brandViolet dark:text-white group-hover:opacity-100 group-hover:translate-x-1 transition-all pr-1">
             <FiArrowRight className="w-5 h-5" />
          </div>
        </button>
      </div>
    </AuthShell>
  );
}
