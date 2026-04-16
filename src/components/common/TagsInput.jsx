import { useState } from "react";
import Input from "./Input";
import TagList from "./TagList";
import { useQuery } from "@tanstack/react-query";
import { searchGlobalCompetences } from "../../services/endpoints";

export default function TagsInput({ label, tags = [], onChange, placeholder = "Ajouter...", filterType = "" }) {
  const [draft, setDraft] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const { data: suggestions } = useQuery({
    queryKey: ["competences", draft, filterType],
    queryFn: () => searchGlobalCompetences(draft, filterType),
    enabled: draft.trim().length >= 1,
  });

  function commitTag(value) {
    const val = (value || draft).trim();
    if (!val) return;
    if (!tags.includes(val)) {
      onChange([...tags, val]);
    }
    setDraft("");
    setShowSuggestions(false);
  }

  return (
    <div className="relative">
      <Input
        label={label}
        value={draft}
        placeholder={placeholder}
        onChange={(event) => {
          setDraft(event.target.value);
          setShowSuggestions(true);
        }}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            commitTag();
          }
        }}
        hint="Appuyez sur Enter pour ajouter une competence"
      />
      
      {showSuggestions && draft.trim().length >= 1 && suggestions?.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto">
          {suggestions
            .filter(s => !tags.includes(s.name))
            .map((s) => (
            <button
              key={s.id}
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-brand-violet/5 dark:hover:bg-slate-800 hover:text-brand-violet dark:hover:text-white border-b border-slate-50 dark:border-slate-800/50 last:border-0 flex justify-between items-center transition-colors"
              onMouseDown={(e) => {
                e.preventDefault(); // Prevent blur stealing focus
                commitTag(s.name);
              }}
            >
              <span>{s.name}</span>
              {s.type && <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{s.type}</span>}
            </button>
          ))}
        </div>
      )}
      
      <div className="mt-3">
        <TagList
          tags={tags}
          onRemove={(tag) => onChange(tags.filter((item) => item !== tag))}
        />
      </div>
    </div>
  );
}
