export default function StepIndicator({ current = 1, total = 1, label }) {
  const safeCurrent = Math.min(Math.max(current, 1), total);

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-magenta">
        Étape {safeCurrent} sur {total}
        {label ? ` - ${label}` : ""}
      </p>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-brand-gradient transition-all duration-300"
          style={{ width: `${(safeCurrent / total) * 100}%` }}
        />
      </div>
    </div>
  );
}

