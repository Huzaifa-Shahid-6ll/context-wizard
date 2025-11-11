import React from 'react';
import { TooltipWrapper } from './TooltipWrapper';

interface OutputFormatSelectorProps {
  value: {
    format: string;
    length: string;
    structure: string[];
    constraints: {
      wordCount?: number;
      characterLimit?: number;
      includeIntro?: boolean;
      includeSummary?: boolean;
    };
  };
  onChange: (value: OutputFormatSelectorProps['value']) => void;
  // Optional flags to render specific sections. Defaults keep existing behavior.
  showFormats?: boolean;
  showLength?: boolean;
  showStructure?: boolean;
  showConstraints?: boolean;
  className?: string;
}

export function OutputFormatSelector({ value, onChange, className = '', showFormats = true, showLength = true, showStructure = true, showConstraints = true }: OutputFormatSelectorProps) {
  const formats = [
    { 
      value: 'text', 
      label: 'Plain Text', 
      description: 'Simple paragraph format',
      icon: '📝',
      example: 'This is a plain text response that flows naturally...'
    },
    { 
      value: 'list', 
      label: 'Bullet Points', 
      description: 'Organized list format',
      icon: '📋',
      example: '• First point\n• Second point\n• Third point'
    },
    { 
      value: 'table', 
      label: 'Table', 
      description: 'Structured tabular data',
      icon: '📊',
      example: '| Column 1 | Column 2 |\n|----------|----------|\n| Data 1   | Data 2   |'
    },
    { 
      value: 'code', 
      label: 'Code Block', 
      description: 'Formatted code with syntax highlighting',
      icon: '💻',
      example: '```javascript\nfunction example() {\n  return "Hello World";\n}\n```'
    },
    { 
      value: 'json', 
      label: 'JSON', 
      description: 'Structured JSON data',
      icon: '🔧',
      example: '{\n  "key": "value",\n  "nested": {\n    "data": true\n  }\n}'
    },
    { 
      value: 'markdown', 
      label: 'Markdown', 
      description: 'Rich text with formatting',
      icon: '📄',
      example: '# Heading\n\n**Bold text** and *italic text*'
    },
    { 
      value: 'steps', 
      label: 'Step-by-Step', 
      description: 'Numbered instructions',
      icon: '🔢',
      example: '1. First step\n2. Second step\n3. Third step'
    }
  ];

  const lengths = [
    { value: 'brief', label: 'Brief', description: '1-2 paragraphs', wordCount: 50 },
    { value: 'standard', label: 'Standard', description: '3-5 paragraphs', wordCount: 200 },
    { value: 'detailed', label: 'Detailed', description: '6-10 paragraphs', wordCount: 500 },
    { value: 'comprehensive', label: 'Comprehensive', description: '10+ paragraphs', wordCount: 1000 }
  ];

  const structureOptions = [
    { value: 'includeIntro', label: 'Include Introduction', description: 'Start with context and overview' },
    { value: 'includeSummary', label: 'Include Summary', description: 'End with key takeaways' },
    { value: 'useHeadings', label: 'Use Headings', description: 'Organize with section headers' },
    { value: 'useBullets', label: 'Use Bullet Points', description: 'Break down complex information' },
    { value: 'includeExamples', label: 'Include Examples', description: 'Provide concrete illustrations' }
  ];

  const handleFormatChange = (format: string) => {
    onChange({
      ...value,
      format
    });
  };

  const handleLengthChange = (length: string) => {
    const selectedLength = lengths.find(l => l.value === length);
    onChange({
      ...value,
      length,
      constraints: {
        ...value.constraints,
        wordCount: selectedLength?.wordCount
      }
    });
  };

  const handleStructureToggle = (structure: string) => {
    const newStructure = value.structure.includes(structure)
      ? value.structure.filter(s => s !== structure)
      : [...value.structure, structure];
    
    onChange({
      ...value,
      structure: newStructure
    });
  };

  const handleConstraintChange = (constraint: string, newValue: number | boolean | undefined) => {
    onChange({
      ...value,
      constraints: {
        ...value.constraints,
        [constraint]: newValue
      }
    });
  };

  const selectedFormat = formats.find(f => f.value === value.format);
  const selectedLength = lengths.find(l => l.value === value.length);

  return (
    <div className={`space-y-6 ${className}`}>
      {showFormats && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Choose how you want the information structured">
            Output Format
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {formats.map(format => (
            <div
              key={format.value}
              className={`p-4 rounded-md ring-1 cursor-pointer transition-all bg-background min-h-[140px] ${
                value.format === format.value
                  ? 'ring-primary/60 shadow-sm'
                  : 'ring-border hover:ring-foreground/20'
              }`}
              onClick={() => handleFormatChange(format.value)}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input
                  type="radio"
                  id={`format-${format.value}`}
                  name="format"
                  value={format.value}
                  checked={value.format === format.value}
                  onChange={() => handleFormatChange(format.value)}
                  className="mt-1 text-primary focus:ring-primary"
                aria-label={format.label}
                title={format.label}
                />
                <label htmlFor={`format-${format.value}`} className="sr-only">Format {format.label}</label>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{format.icon}</span>
                    <h4 className="font-medium text-foreground line-clamp-1">{format.label}</h4>
                  </div>
                  <p className="text-sm text-foreground/70 mb-2 line-clamp-2">{format.description}</p>
                  <p className="text-xs text-foreground/60 italic whitespace-pre-line line-clamp-3">{format.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {showLength && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Length affects the depth and detail of the response">
            Length
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lengths.map(length => (
            <label
              key={length.value}
              className={`p-3 rounded-md ring-1 cursor-pointer transition-all bg-background ${
                value.length === length.value
                  ? 'ring-primary/60 shadow-sm'
                  : 'ring-border hover:ring-foreground/20'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <input
                  type="radio"
                  id={`length-${length.value}`}
                  name="length"
                  value={length.value}
                  checked={value.length === length.value}
                  onChange={() => handleLengthChange(length.value)}
                  className="text-primary focus:ring-primary"
                  aria-label={length.label}
                  title={length.label}
                />
                <label htmlFor={`length-${length.value}`} className="sr-only">Length {length.label}</label>
                <div className="min-w-0">
                  <span className="font-medium text-sm text-foreground">{length.label}</span>
                  <p className="text-xs text-foreground/60 truncate">{length.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
      )}

      {showStructure && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Structure options help organize the content effectively">
            Content Structure
          </TooltipWrapper>
        </label>
        <div className="space-y-2">
          {structureOptions.map(option => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/10"
            >
                <input
                type="checkbox"
                checked={value.structure.includes(option.value)}
                onChange={() => handleStructureToggle(option.value)}
                className="text-primary focus:ring-primary"
                title={option.label}
                aria-label={option.label}
              />
              <div className="min-w-0">
                <span className="font-medium text-sm text-foreground">{option.label}</span>
                <p className="text-xs text-foreground/60 truncate">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
      )}

      {showConstraints && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Set specific constraints for the output">
            Constraints
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Word Count</label>
            <input
              type="number"
              value={value.constraints.wordCount || ''}
              onChange={(e) => handleConstraintChange('wordCount', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 200"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Character Limit</label>
            <input
              type="number"
              value={value.constraints.characterLimit || ''}
              onChange={(e) => handleConstraintChange('characterLimit', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 1000"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      </div>
      )}

      {(selectedFormat || selectedLength) && (
        <div className="p-4 rounded-md ring-1 ring-border bg-secondary/10">
          <h4 className="font-medium text-foreground mb-2">Preview</h4>
          <div className="text-sm text-foreground/70 space-y-1">
            <p><strong>Format:</strong> {selectedFormat?.label}</p>
            <p><strong>Length:</strong> {selectedLength?.label} ({selectedLength?.wordCount} words)</p>
            <p><strong>Structure:</strong> {value.structure.length > 0 ? value.structure.join(', ') : 'None selected'}</p>
            {value.constraints.wordCount && (
              <p><strong>Word Limit:</strong> {value.constraints.wordCount} words</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
