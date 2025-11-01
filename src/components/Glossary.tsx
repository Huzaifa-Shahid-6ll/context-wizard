"use client";

import React, { useState } from 'react';
import { glossary, getGlossaryTerm, searchGlossary, getGlossaryByCategory, getRelatedTerms } from '@/lib/glossary';
import { TooltipWrapper } from './forms/TooltipWrapper';

interface GlossaryProps {
  term?: string;
  showSearch?: boolean;
  showCategories?: boolean;
  className?: string;
}

export function Glossary({ term, showSearch = true, showCategories = true, className = '' }: GlossaryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTerm, setSelectedTerm] = useState(term || '');

  const categories = Array.from(new Set(Object.values(glossary).map(term => term.category)));

  const filteredTerms = searchQuery 
    ? searchGlossary(searchQuery)
    : selectedCategory 
      ? getGlossaryByCategory(selectedCategory)
      : Object.values(glossary);

  const currentTerm = selectedTerm ? getGlossaryTerm(selectedTerm) : null;
  const relatedTerms = currentTerm ? getRelatedTerms(currentTerm.term) : [];

  return (
    <div className={`space-y-6 ${className}`}>
      {showSearch && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Glossary
          </label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for terms..."
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          />
        </div>
      )}

      {showCategories && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {searchQuery ? `Search Results for "${searchQuery}"` : 
             selectedCategory ? `${selectedCategory} Terms` : 
             'All Terms'}
          </h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredTerms.map(term => (
              <button
                key={term.term}
                onClick={() => setSelectedTerm(term.term)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedTerm === term.term
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">{term.term}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {term.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {term.definition}
                </p>
              </button>
            ))}
          </div>
        </div>

        {currentTerm && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {currentTerm.term}
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {currentTerm.category}
                </span>
                <p className="text-gray-700 mt-2">{currentTerm.definition}</p>
              </div>

              {currentTerm.examples && currentTerm.examples.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Examples</h4>
                  <ul className="space-y-1">
                    {currentTerm.examples.map((example, index) => (
                      <li key={index} className="text-sm text-gray-600">
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {relatedTerms.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Related Terms</h4>
                  <div className="flex flex-wrap gap-2">
                    {relatedTerms.map(term => (
                      <button
                        key={term.term}
                        onClick={() => setSelectedTerm(term.term)}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                      >
                        {term.term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Standalone tooltip component for inline use
export function GlossaryTooltip({ term, children }: { term: string; children: React.ReactNode }) {
  const glossaryTerm = getGlossaryTerm(term);
  
  if (!glossaryTerm) {
    return <>{children}</>;
  }

  return (
    <TooltipWrapper 
      content={glossaryTerm.definition}
      learnMoreLink={`/glossary#${term.toLowerCase()}`}
    >
      {children}
    </TooltipWrapper>
  );
}
