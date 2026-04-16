import { useEffect } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";
import { cn } from "../../utils/helpers";

export default function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-2xl",
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onEsc = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-8 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className={cn("w-full rounded-2xl bg-white dark:bg-slate-900 dark:border dark:border-slate-800 shadow-2xl transition-colors duration-300", maxWidth)}>
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-5 py-4">
          <h3 className="text-lg font-bold text-brand-text dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-500 dark:text-slate-400 transition hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-brand-text dark:hover:text-white"
            aria-label="Fermer la fenetre"
          >
            <IoClose size={20} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5 text-slate-700 dark:text-slate-300">{children}</div>
      </div>
    </div>,
    document.body
  );
}
