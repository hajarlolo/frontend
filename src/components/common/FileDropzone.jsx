import { useEffect, useMemo, useRef, useState } from "react";
import { IoCloudUploadOutline, IoDocumentOutline, IoImageOutline } from "react-icons/io5";
import { cn } from "../../utils/helpers";
import { getStorageUrl } from "../../utils/storageUrl";

function getAcceptSummary(accept) {
  if (!accept) return "Tous les fichiers";
  return accept
    .split(",")
    .map((v) => v.trim().replace(".", "").toUpperCase())
    .join(", ");
}

export default function FileDropzone({
  label,
  hint,
  error,
  file,
  onChange,
  accept = ".pdf,.png,.jpg,.jpeg",
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const preview = useMemo(() => {
    if (!file) return null;
    
    // Si preview d'un lien existant
    if (typeof file === "string") {
      const isPdf = file.endsWith(".pdf");
      const isImage = !isPdf; // Hypothèse basique
      const fullUrl = getStorageUrl(file);
      return {
        url: fullUrl,
        isImage,
        isPdf,
        name: file.split('/').pop() || "Fichier existant",
      };
    }

    const fileUrl = URL.createObjectURL(file);
    return {
      url: fileUrl,
      isImage: file.type.startsWith("image/"),
      isPdf: file.type === "application/pdf",
      name: file.name
    };
  }, [file]);

  useEffect(() => {
    return () => {
      // Clean up object URLs only, not regular string URLs
      if (preview?.url && typeof file !== "string") {
        URL.revokeObjectURL(preview.url);
      }
    };
  }, [preview, file]);

  return (
    <div className="space-y-2">
      {label ? <p className="text-sm font-semibold text-brand-text">{label}</p> : null}
      <label
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition",
          dragging ? "border-brand-magenta bg-brand-magenta/5" : "border-brand-violet/25 bg-white",
          error ? "border-rose-400" : ""
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const nextFile = event.dataTransfer.files?.[0];
          if (nextFile) onChange(nextFile);
        }}
      >
        <input
          type="file"
          accept={accept}
          className="sr-only"
          ref={inputRef}
          onChange={(event) => {
            const nextFile = event.target.files?.[0];
            if (nextFile) onChange(nextFile);
          }}
        />
        <div className="mb-3 rounded-full bg-brand-violet/10 p-3 text-brand-violet">
          <IoCloudUploadOutline size={24} />
        </div>
        <p className="text-sm font-semibold text-brand-text">
          Glissez-déposez un fichier ou cliquez pour parcourir
        </p>
        <p className="mt-1 text-xs text-slate-500">{getAcceptSummary(accept)}</p>
      </label>

      {file ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-600 truncate max-w-[80%]">{preview?.name}</p>
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white hover:bg-rose-600 transition shrink-0"
              aria-label="Supprimer le fichier"
              title="Supprimer le fichier"
              onClick={() => {
                onChange(null);
                if (inputRef.current) {
                  inputRef.current.value = "";
                }
              }}
            >
              ×
            </button>
          </div>
          {preview?.isImage ? (
            <div className="flex justify-center">
              <img src={preview.url} alt="Aperçu du document" className="max-h-48 rounded-lg object-contain bg-slate-100" />
            </div>
          ) : preview?.isPdf ? (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <IoDocumentOutline />
              <span>Fichier PDF prêt à être envoyé.</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-slate-700">
              <IoImageOutline />
              <span>Fichier prêt à être envoyé.</span>
            </div>
          )}
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

