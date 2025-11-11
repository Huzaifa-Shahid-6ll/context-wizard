import React, { useState } from 'react';
import { TooltipWrapper } from './TooltipWrapper';

interface Field {
  name: string;
  label: string;
  type: 'select' | 'multiselect' | 'checkbox' | 'textarea';
  options?: string[];
  placeholder?: string;
  tooltip: string;
}

interface TechnicalDetailsBuilderProps {
  value: {
    category: string;
    details: Record<string, unknown>;
  };
  onChange: (value: TechnicalDetailsBuilderProps['value']) => void;
  className?: string;
}

export function TechnicalDetailsBuilder({ value, onChange, className = '' }: TechnicalDetailsBuilderProps) {
  const [activeCategory, setActiveCategory] = useState(value.category || 'camera');

  const categories: Record<string, { label: string; icon: string; fields: Field[] }> = {
    camera: {
      label: 'Camera Settings',
      icon: '📷',
      fields: [
        {
          name: 'aperture',
          label: 'Aperture (f-stop)',
          type: 'select',
          options: ['f/1.4', 'f/2', 'f/2.8', 'f/4', 'f/5.6', 'f/8', 'f/11', 'f/16', 'f/22'],
          tooltip: 'Controls depth of field - lower numbers create more background blur'
        },
        {
          name: 'shutterSpeed',
          label: 'Shutter Speed',
          type: 'select',
          options: ['1/4000s', '1/2000s', '1/1000s', '1/500s', '1/250s', '1/125s', '1/60s', '1/30s', '1/15s', '1/8s', '1/4s', '1/2s', '1s'],
          tooltip: 'Controls motion blur - faster speeds freeze motion'
        },
        {
          name: 'iso',
          label: 'ISO',
          type: 'select',
          options: ['100', '200', '400', '800', '1600', '3200', '6400', '12800'],
          tooltip: 'Controls light sensitivity - higher numbers increase noise but allow shooting in low light'
        },
        {
          name: 'focalLength',
          label: 'Focal Length',
          type: 'select',
          options: ['14mm', '24mm', '35mm', '50mm', '85mm', '135mm', '200mm', '300mm'],
          tooltip: 'Determines field of view - wider angles show more, telephoto compresses perspective'
        }
      ]
    },
    lighting: {
      label: 'Lighting Setup',
      icon: '💡',
      fields: [
        {
          name: 'keyLight',
          label: 'Key Light Position',
          type: 'select',
          options: ['Front', '45° Left', '45° Right', 'Side', 'Back', 'Top', 'Bottom'],
          tooltip: 'Main light source that defines the subject'
        },
        {
          name: 'fillLight',
          label: 'Fill Light',
          type: 'select',
          options: ['None', 'Soft', 'Medium', 'Strong'],
          tooltip: 'Secondary light that reduces shadows'
        },
        {
          name: 'rimLight',
          label: 'Rim Light',
          type: 'checkbox',
          tooltip: 'Backlight that creates edge separation'
        },
        {
          name: 'lightQuality',
          label: 'Light Quality',
          type: 'select',
          options: ['Hard', 'Soft', 'Diffused', 'Natural'],
          tooltip: 'Hard light creates sharp shadows, soft light is more flattering'
        }
      ]
    },
    audio: {
      label: 'Audio Design',
      icon: '🎵',
      fields: [
        {
          name: 'dialogue',
          label: 'Dialogue',
          type: 'textarea',
          placeholder: 'Enter dialogue with quotation marks...',
          tooltip: 'Write exactly what should be spoken'
        },
        {
          name: 'soundEffects',
          label: 'Sound Effects',
          type: 'multiselect',
          options: ['Footsteps', 'Door closing', 'Phone ringing', 'Wind', 'Rain', 'Wind', 'Traffic', 'Birds'],
          tooltip: 'Environmental and action sounds'
        },
        {
          name: 'ambientSound',
          label: 'Ambient Sound',
          type: 'select',
          options: ['Office ambience', 'City traffic', 'Nature sounds', 'Ocean waves', 'Forest sounds', 'Cafe chatter', 'None'],
          tooltip: 'Background environmental audio'
        },
        {
          name: 'musicStyle',
          label: 'Music Style',
          type: 'select',
          options: ['Corporate', 'Upbeat', 'Dramatic', 'Ambient', 'Cinematic', 'None'],
          tooltip: 'Musical accompaniment style'
        }
      ]
    },
    code: {
      label: 'Code Architecture',
      icon: '💻',
      fields: [
        {
          name: 'architecture',
          label: 'Architecture Pattern',
          type: 'select',
          options: ['MVC', 'MVP', 'MVVM', 'Microservices', 'Monolithic', 'Serverless', 'Event-driven'],
          tooltip: 'Overall system design approach'
        },
        {
          name: 'codeStyle',
          label: 'Code Style',
          type: 'select',
          options: ['Functional', 'Object-oriented', 'Declarative', 'Procedural', 'Mixed'],
          tooltip: 'Programming paradigm and approach'
        },
        {
          name: 'testing',
          label: 'Testing Approach',
          type: 'multiselect',
          options: ['Unit tests', 'Integration tests', 'E2E tests', 'Visual regression', 'Performance tests'],
          tooltip: 'Types of testing to include'
        },
        {
          name: 'documentation',
          label: 'Documentation Level',
          type: 'select',
          options: ['Minimal', 'Pragmatic', 'Comprehensive'],
          tooltip: 'Amount of code documentation to generate'
        }
      ]
    }
  };

  const handleFieldChange = (fieldName: string, fieldValue: unknown) => {
    const newDetails = {
      ...value.details,
      [fieldName]: fieldValue
    };
    
    onChange({
      ...value,
      details: newDetails
    });
  };

  const renderField = (field: Field) => {
    const fieldValue = value.details[field.name] || '';

    switch (field.type) {
      case 'select':
        return (
          <select
            value={fieldValue as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            style={{ colorScheme: 'light dark' }}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'multiselect':
        const selectedValues = Array.isArray(fieldValue) ? fieldValue as string[] : [];
        return (
          <div className="space-y-2">
            {field.options?.map((option: string) => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option)}
                  onChange={(e) => {
                    const newValues = e.target.checked
                      ? [...selectedValues, option]
                      : selectedValues.filter((v: string) => v !== option);
                    handleFieldChange(field.name, newValues);
                  }}
                  className="text-primary focus:ring-primary"
                />
                <span className="text-sm text-foreground">{option}</span>
              </label>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={fieldValue as boolean}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-foreground">Enable {field.label}</span>
          </label>
        );
      
      case 'textarea':
        return (
          <textarea
            value={fieldValue as string}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          <TooltipWrapper content="Select the technical category you want to specify">
            Technical Category
          </TooltipWrapper>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(categories).map(([key, category]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`p-4 border rounded-lg transition-all ${
                activeCategory === key
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{category.icon}</span>
                <span className="text-sm font-medium text-foreground">{category.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-foreground mb-4">
          {categories[activeCategory as keyof typeof categories].label}
        </h3>
        <div className="space-y-4">
          {categories[activeCategory as keyof typeof categories].fields.map((field) => (
            <div key={field.name}>
              <label className="block text-sm font-medium text-foreground mb-2">
                <TooltipWrapper content={field.tooltip}>
                  {field.label}
                </TooltipWrapper>
              </label>
              {renderField(field)}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-secondary/10 rounded-lg">
        <h4 className="font-medium text-foreground mb-2">Current Settings</h4>
        <div className="text-sm text-foreground/70 space-y-1">
          {Object.entries(value.details).map(([key, val]) => (
            <p key={key}>
              <strong>{key}:</strong> {Array.isArray(val) ? val.join(', ') : String(val)}
            </p>
          ))}
          {Object.keys(value.details).length === 0 && (
            <p className="text-foreground/60 italic">No technical details specified</p>
          )}
        </div>
      </div>
    </div>
  );
}
