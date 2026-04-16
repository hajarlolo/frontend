import { forwardRef } from "react";
import { cn } from "../../utils/helpers";

const Input = forwardRef(function Input(
  { label, hint, error, className, rightElement, ...props },
  ref
) {
  return (
    <div className="w-full space-y-2">
      {label && (
        <label className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest pl-1">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          ref={ref}
          className={cn(
            "w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-300 outline-none focus:border-brandMagenta/50 dark:focus:border-brandMagenta/50 focus:bg-white dark:focus:bg-white/[0.08] focus:ring-4 focus:ring-brandMagenta/10 dark:focus:shadow-[0_0_20px_rgba(113,26,97,0.15)]",
            error ? "border-red-500/50 focus:border-red-500" : "",
            className
          )}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error ? (
        <p className="text-xs font-bold text-red-500 mt-1 pl-1">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs font-medium text-slate-500 mt-1 pl-1">
          {hint}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
