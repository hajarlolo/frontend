import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Select = forwardRef(function Select({ label, error, className, children, ...props }, ref) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white transition-all duration-300 outline-none focus:border-brandMagenta/50 dark:focus:border-brandMagenta/50 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brandMagenta/10 dark:focus:shadow-[0_0_20px_rgba(113,26,97,0.15)] appearance-none [&>option]:bg-white [&>option]:dark:bg-slate-900",
          error ? "border-red-500/50 focus:border-red-500" : "",
          className
        )}
        {...props}
      >
        {children}
      </select>
      {error ? <p className="text-xs font-bold text-red-500 mt-1 pl-1">{error}</p> : null}
    </div>
  );
});

export default Select;

