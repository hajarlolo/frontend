import { cn } from "../../utils/helpers";

export default function Card({ className, children }) {
  return (
    <div
      className={cn(
        "rounded-[32px] border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 p-6 shadow-sm dark:shadow-2xl transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
}

