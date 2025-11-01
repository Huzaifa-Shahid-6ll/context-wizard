import React from 'react';
import { TooltipWrapper } from './TooltipWrapper';

interface ToneStyleSelectorProps {
  value: {
    tone: string;
    style: string;
    modifiers: string[];
  };
  onChange: (value: ToneStyleSelectorProps['value']) => void;
  className?: string;
}

export function ToneStyleSelector({ value, onChange, className = '' }: ToneStyleSelectorProps) {
  const tones = [
    { 
      value: 'professional', 
      label: 'Professional', 
      description: 'Formal, business-appropriate language',
      example: 'Based on the analysis, we recommend implementing...'
    },
    { 
      value: 'casual', 
      label: 'Casual', 
      description: 'Relaxed, conversational tone',
      example: 'Hey! So here\'s what I think we should do...'
    },
    { 
      value: 'creative', 
      label: 'Creative', 
      description: 'Imaginative, artistic expression',
      example: 'Let\'s paint a picture with words and explore...'
    },
    { 
      value: 'technical', 
      label: 'Technical', 
      description: 'Precise, industry-specific terminology',
      example: 'The implementation requires a distributed architecture...'
    },
    { 
      value: 'friendly', 
      label: 'Friendly', 
      description: 'Warm, approachable, encouraging',
      example: 'Great question! Let me walk you through this step by step...'
    },
    { 
      value: 'persuasive', 
      label: 'Persuasive', 
      description: 'Convincing, compelling arguments',
      example: 'This approach will deliver significant ROI because...'
    }
  ];

  const styles = [
    { 
      value: 'concise', 
      label: 'Concise', 
      description: 'Brief and to the point'
    },
    { 
      value: 'detailed', 
      label: 'Detailed', 
      description: 'Comprehensive and thorough'
    },
    { 
      value: 'conversational', 
      label: 'Conversational', 
      description: 'Natural, dialogue-like flow'
    },
    { 
      value: 'formal', 
      label: 'Formal', 
      description: 'Structured, academic style'
    }
  ];

  const handleToneChange = (tone: string) => {
    onChange({
      ...value,
      tone
    });
  };

  const handleStyleChange = (style: string) => {
    onChange({
      ...value,
      style
    });
  };

  const handleModifierToggle = (modifier: string) => {
    const newModifiers = value.modifiers.includes(modifier)
      ? value.modifiers.filter(m => m !== modifier)
      : [...value.modifiers, modifier];
    
    onChange({
      ...value,
      modifiers: newModifiers
    });
  };

  const selectedTone = tones.find(t => t.value === value.tone);

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Tone affects word choice and sentence structure in the output">
            Tone
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {tones.map(tone => (
            <div
              key={tone.value}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                value.tone === tone.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleToneChange(tone.value)}
            >
              <div className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="tone"
                  value={tone.value}
                  checked={value.tone === tone.value}
                  onChange={() => handleToneChange(tone.value)}
                  className="mt-1 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{tone.label}</h4>
                  <p className="text-sm text-gray-600 mt-1">{tone.description}</p>
                  <p className="text-xs text-gray-500 mt-2 italic">{tone.example}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Style affects the overall structure and flow of the content">
            Writing Style
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {styles.map(style => (
            <label
              key={style.value}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                value.style === style.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="style"
                  value={style.value}
                  checked={value.style === style.value}
                  onChange={() => handleStyleChange(style.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium text-sm">{style.label}</span>
                  <p className="text-xs text-gray-500">{style.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Modifiers add specific characteristics to your writing">
            Style Modifiers (Optional)
          </TooltipWrapper>
        </label>
        <div className="flex flex-wrap gap-2">
          {['empathetic', 'analytical', 'inspiring', 'practical', 'humorous', 'serious'].map(modifier => (
            <label
              key={modifier}
              className={`px-3 py-2 border rounded-full cursor-pointer transition-all text-sm ${
                value.modifiers.includes(modifier)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={value.modifiers.includes(modifier)}
                onChange={() => handleModifierToggle(modifier)}
                className="sr-only"
              />
              {modifier.charAt(0).toUpperCase() + modifier.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {selectedTone && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Preview</h4>
          <p className="text-sm text-gray-600 italic">{selectedTone.example}</p>
          <p className="text-xs text-gray-500 mt-2">
            Style: {value.style} | Modifiers: {value.modifiers.join(', ') || 'None'}
          </p>
        </div>
      )}
    </div>
  );
}
