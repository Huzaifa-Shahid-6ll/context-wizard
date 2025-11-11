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
      <ToneAndModifiers
        value={value}
        onChange={onChange}
      />

      <WritingStyleSelector
        value={value}
        onChange={onChange}
      />

      {selectedTone && (
        <div className="p-4 rounded-md ring-1 ring-border bg-secondary/10">
          <h4 className="font-medium text-foreground mb-2">Preview</h4>
          <p className="text-sm text-foreground/70 italic whitespace-pre-wrap break-words">
            {selectedTone.example}
          </p>
          <p className="text-xs text-foreground/60 mt-2">
            Style: {value.style} | Modifiers: {value.modifiers.join(', ') || 'None'}
          </p>
        </div>
      )}
    </div>
  );
}

export function ToneAndModifiers({ value, onChange, className = '' }: ToneStyleSelectorProps) {
  const tones = [
    { value: 'professional', label: 'Professional', description: 'Formal, business-appropriate language', example: 'Based on the analysis, we recommend implementing...' },
    { value: 'casual', label: 'Casual', description: 'Relaxed, conversational tone', example: 'Hey! So here\'s what I think we should do...' },
    { value: 'creative', label: 'Creative', description: 'Imaginative, artistic expression', example: 'Let\'s paint a picture with words and explore...' },
    { value: 'technical', label: 'Technical', description: 'Precise, industry-specific terminology', example: 'The implementation requires a distributed architecture...' },
    { value: 'friendly', label: 'Friendly', description: 'Warm, approachable, encouraging', example: 'Great question! Let me walk you through this step by step...' },
    { value: 'persuasive', label: 'Persuasive', description: 'Convincing, compelling arguments', example: 'This approach will deliver significant ROI because...' }
  ];

  const handleToneChange = (tone: string) => onChange({ ...value, tone });
  const handleModifierToggle = (modifier: string) => {
    const next = value.modifiers.includes(modifier)
      ? value.modifiers.filter(m => m !== modifier)
      : [...value.modifiers, modifier];
    onChange({ ...value, modifiers: next });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <TooltipWrapper content="Tone affects word choice and sentence structure in the output">
            Tone
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tones.map(tone => (
            <div
              key={tone.value}
              className={`p-4 rounded-md ring-1 cursor-pointer transition-all bg-background min-h-[140px] ${
                value.tone === tone.value ? 'ring-primary/60 shadow-sm' : 'ring-border hover:ring-foreground/20'
              }`}
              onClick={() => handleToneChange(tone.value)}
            >
              <div className="flex items-start gap-3 min-w-0">
                <input id={`tone-${tone.value}`} type="radio" name="tone" value={tone.value} checked={value.tone === tone.value} onChange={() => handleToneChange(tone.value)} className="mt-1 text-primary focus:ring-primary" aria-label={tone.label} title={tone.label} />
                <label htmlFor={`tone-${tone.value}`} className="sr-only">Tone {tone.label}</label>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground line-clamp-1">{tone.label}</h4>
                  <p className="text-sm text-foreground/70 mt-1 line-clamp-2">{tone.description}</p>
                </div>
              </div>
            </div>
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
              className={`px-3 py-2 rounded-full ring-1 cursor-pointer transition-all text-sm bg-background ${
                value.modifiers.includes(modifier) ? 'ring-primary/60 text-primary-foreground bg-primary/10' : 'ring-border hover:ring-foreground/20'
              }`}
            >
              <input type="checkbox" checked={value.modifiers.includes(modifier)} onChange={() => handleModifierToggle(modifier)} className="sr-only" title={modifier} aria-label={modifier} />
              {modifier.charAt(0).toUpperCase() + modifier.slice(1)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WritingStyleSelector({ value, onChange, className = '' }: ToneStyleSelectorProps) {
  const styles = [
    { value: 'concise', label: 'Concise', description: 'Brief and to the point' },
    { value: 'detailed', label: 'Detailed', description: 'Comprehensive and thorough' },
    { value: 'conversational', label: 'Conversational', description: 'Natural, dialogue-like flow' },
    { value: 'formal', label: 'Formal', description: 'Structured, academic style' },
  ];

  const handleStyleChange = (style: string) => onChange({ ...value, style });

  return (
    <div className={`space-y-6 ${className}`}>
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
              className={`p-3 rounded-md ring-1 cursor-pointer transition-all bg-background ${
                value.style === style.value ? 'ring-primary/60 shadow-sm' : 'ring-border hover:ring-foreground/20'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <input type="radio" name="style" value={style.value} checked={value.style === style.value} onChange={() => handleStyleChange(style.value)} className="text-primary focus:ring-primary" aria-label={style.label} title={style.label} />
                <div className="min-w-0">
                  <span className="font-medium text-sm text-foreground">{style.label}</span>
                  <p className="text-xs text-foreground/60 truncate">{style.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
