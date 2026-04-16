import { cn } from "../../utils/helpers";

const variants = {
  pending_email: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
  pending_document: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  pending_admin: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  approved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  rejected: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  en_attente: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
  approuve: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
  refuse: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
  student: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300",
  company: "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300",
  default: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300",
  brand: "bg-brand-violet/10 dark:bg-brand-violet/20 text-brand-violet dark:text-brandViolet",
  secondary: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
};

export default function Badge({ value, children, variant, className }) {
  const key = (variant || String(value || "")).toLowerCase();
  
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize whitespace-nowrap",
        variants[key] || variants.default,
        className
      )}
    >
      {children || value}
    </span>
  );
}

