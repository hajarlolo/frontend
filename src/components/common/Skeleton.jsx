import { cn } from "../../utils/helpers";

export default function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />;
}

