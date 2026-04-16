import { IoClose } from "react-icons/io5";

export default function TagList({ tags = [], onRemove }) {
  if (!tags.length) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-brand-violet/10 px-3 py-1 text-xs font-semibold text-brand-violet"
        >
          {tag}
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(tag)}
              className="rounded-full p-0.5 hover:bg-brand-violet/20"
              aria-label={`Supprimer ${tag}`}
            >
              <IoClose />
            </button>
          ) : null}
        </span>
      ))}
    </div>
  );
}

