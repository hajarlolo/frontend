import Card from "./Card";

export default function StatCard({ label, value, icon, accent = "from-brand-violet to-brand-magenta", footer }) {
  return (
    <Card className={`relative overflow-hidden border-none bg-gradient-to-br ${accent} p-7 text-white shadow-lg transition-transform hover:scale-[1.02]`}>
      <div className="relative flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
            {icon}
          </div>
          <p className="text-sm font-black uppercase tracking-widest opacity-80">{label}</p>
        </div>
        <div>
          <p className="text-4xl font-black tracking-tight">{value}</p>
          {footer && <div className="mt-4">{footer}</div>}
        </div>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
    </Card>
  );
}

