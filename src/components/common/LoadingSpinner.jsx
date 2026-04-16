export default function LoadingSpinner({ label = "Chargement..." }) {
  return (
    <div className="inline-flex items-center gap-2 text-sm text-slate-600">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-violet border-t-transparent" />
      <span>{label}</span>
    </div>
  );
}

