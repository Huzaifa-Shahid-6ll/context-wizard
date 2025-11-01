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
  className?: string;
}

export function OutputFormatSelector({ value, onChange, className = '' }: OutputFormatSelectorProps) {
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Choose how you want the information structured">
            Output Format
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {formats.map(format => (
            <div
              key={format.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                value.format === format.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFormatChange(format.value)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="format"
                  value={format.value}
                  checked={value.format === format.value}
                  onChange={() => handleFormatChange(format.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">{format.icon}</span>
                    <h4 className="font-medium text-gray-900">{format.label}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{format.description}</p>
                  <p className="text-xs text-gray-500 italic">{format.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

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
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                value.length === length.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="length"
                  value={length.value}
                  checked={value.length === length.value}
                  onChange={() => handleLengthChange(length.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-sm">{length.label}</span>
                  <p className="text-xs text-gray-500">{length.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

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
              className="flex items-center space-x-3 p-2 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={value.structure.includes(option.value)}
                onChange={() => handleStructureToggle(option.value)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <div>
                <span className="font-medium text-sm">{option.label}</span>
                <p className="text-xs text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Character Limit</label>
            <input
              type="number"
              value={value.constraints.characterLimit || ''}
              onChange={(e) => handleConstraintChange('characterLimit', parseInt(e.target.value) || undefined)}
              placeholder="e.g., 1000"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {(selectedFormat || selectedLength) && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
          <div className="text-sm text-gray-600 space-y-1">
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
