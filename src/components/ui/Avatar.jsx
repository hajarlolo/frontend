import { cn } from "../../utils/helpers";

export default function Avatar({ src, alt, initials = "SM", size = 40, className, ...props }) {
  const commonClasses = cn("rounded-full border border-white/60 object-cover shadow shrink-0", className);
  
  if (src) {
    return (
      <img
        src={src}
        alt={alt || "Avatar"}
        style={{ width: size, height: size }}
        className={commonClasses}
        {...props}
      />
    );
  }

  return (
    <div
      style={{ width: size, height: size }}
      className={cn("inline-flex items-center justify-center bg-brand-violet text-sm font-semibold text-white", commonClasses)}
      aria-label={alt || "Avatar"}
      {...props}
    >
      {initials}
    </div>
  );
}

