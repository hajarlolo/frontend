import { cn } from "../../utils/helpers";

const variants = {
  primary: "bg-brand-gradient text-white shadow-premium hover:shadow-brandViolet/40 hover:-translate-y-0.5 active:scale-[0.98]",
  accent: "bg-white dark:bg-slate-800 text-brandNavy dark:text-white border border-slate-200 dark:border-white/10 shadow-xl hover:bg-slate-50 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:scale-[0.98]",
  ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:text-brandViolet dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 active:scale-[0.98]",
  danger: "bg-red-500 text-white hover:bg-red-600 shadow-md active:scale-[0.98]",
};

const sizes = {
  sm: "px-4 py-2 text-xs",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

export default function Button({
  as: Component = "button",
  type = "button",
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Component
      type={Component === "button" ? type : undefined}
      disabled={isDisabled}
      className={cn(
        "relative inline-flex items-center justify-center gap-2 rounded-2xl font-black tracking-tight transition-all duration-300 ease-out overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? (
        <div className="flex items-center gap-2">
           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
           </svg>
           <span>Loading...</span>
        </div>
      ) : (
        <>
          {leftIcon}
          <span className="relative z-10">{children}</span>
          {rightIcon && <span className="group-hover:translate-x-1 transition-transform">{rightIcon}</span>}
        </>
      )}
    </Component>
  );
}
