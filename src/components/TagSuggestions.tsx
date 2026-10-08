import React from 'react';
import { Sparkles, Plus } from 'lucide-react';

export interface TagSuggestionsProps {
  suggestions: string[];
  onSelectTag: (tag: string) => void;
}

export const TagSuggestions: React.FC<TagSuggestionsProps> = ({
  suggestions,
  onSelectTag,
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-2.5 p-3 rounded-lg bg-blue-50/70 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40">
      <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span>Önerilen Etiketler (eklemek için tıklayın):</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-white text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-gray-800 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white border border-blue-200 dark:border-blue-800 shadow-xs transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title={`${tag} etiketini ekle`}
            aria-label={`${tag} etiketini ekle`}
          >
            <Plus className="w-3 h-3 opacity-70" />
            <span>{tag}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagSuggestions;
