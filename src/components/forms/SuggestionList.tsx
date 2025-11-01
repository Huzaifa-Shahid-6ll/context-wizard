import React from 'react';

interface Suggestion {
  field: string;
  value: string;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  onApply: (suggestion: Suggestion) => void;
}

export function SuggestionList({ suggestions, onApply }: SuggestionListProps) {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="my-3 p-4 rounded border border-accent bg-accent/10">
      <h3 className="text-sm font-medium mb-2">Suggestions</h3>
      <ul className="space-y-2">
        {suggestions.map((suggestion, index) => (
          <li key={index} className="flex items-center justify-between">
            <div>
              <span className="font-semibold">{suggestion.field}</span>: {suggestion.value}
            </div>
            <button onClick={() => onApply(suggestion)}>Apply</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
