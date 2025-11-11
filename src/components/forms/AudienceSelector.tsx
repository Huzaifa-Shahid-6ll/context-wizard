import React from 'react';
import { TooltipWrapper } from './TooltipWrapper';

interface AudienceSelectorProps {
  value: {
    ageRange: string;
    profession: string;
    expertiseLevel: string;
    industry: string;
    useCase: string;
  };
  onChange: (value: AudienceSelectorProps['value']) => void;
  className?: string;
}

export function AudienceSelector({ value, onChange, className = '' }: AudienceSelectorProps) {
  const ageRanges = [
    { value: '18-25', label: '18-25 (Gen Z)' },
    { value: '26-35', label: '26-35 (Millennials)' },
    { value: '36-50', label: '36-50 (Gen X)' },
    { value: '50+', label: '50+ (Boomers+)' },
    { value: 'all', label: 'All ages' }
  ];

  const professions = [
    'Developer', 'Designer', 'Manager', 'Student', 'Entrepreneur', 
    'Consultant', 'Educator', 'Researcher', 'Other'
  ];

  const expertiseLevels = [
    { value: 'beginner', label: 'Beginner', description: 'New to the topic' },
    { value: 'intermediate', label: 'Intermediate', description: 'Some experience' },
    { value: 'advanced', label: 'Advanced', description: 'Very experienced' },
    { value: 'expert', label: 'Expert', description: 'Industry expert' }
  ];

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
    'Manufacturing', 'Retail', 'Media', 'Government', 'Non-profit', 'Other'
  ];

  const useCases = [
    'Learning', 'Professional work', 'Research', 'Personal project',
    'Team collaboration', 'Client work', 'Other'
  ];

  const handleChange = (field: string, newValue: string) => {
    onChange({
      ...value,
      [field]: newValue
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <TooltipWrapper content="Age range helps tailor language complexity and examples">
            Age Range
          </TooltipWrapper>
        </label>
        <select
          value={value.ageRange}
          onChange={(e) => handleChange('ageRange', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ colorScheme: 'light dark' }}
        >
          <option value="" className="bg-background text-foreground">Select age range</option>
          {ageRanges.map(range => (
            <option key={range.value} value={range.value} className="bg-background text-foreground">
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <TooltipWrapper content="Profession helps understand the user's work context">
            Profession
          </TooltipWrapper>
        </label>
        <select
          value={value.profession}
          onChange={(e) => handleChange('profession', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ colorScheme: 'light dark' }}
        >
          <option value="" className="bg-background text-foreground">Select profession</option>
          {professions.map(prof => (
            <option key={prof} value={prof} className="bg-background text-foreground">
              {prof}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <TooltipWrapper content="Technical expertise level affects the complexity of explanations">
            Expertise Level
          </TooltipWrapper>
        </label>
        <div className="space-y-2">
          {expertiseLevels.map(level => (
            <label key={level.value} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="expertiseLevel"
                value={level.value}
                checked={value.expertiseLevel === level.value}
                onChange={(e) => handleChange('expertiseLevel', e.target.value)}
                className="text-primary focus:ring-primary"
              />
              <div>
                <span className="text-sm font-medium text-foreground">{level.label}</span>
                <p className="text-xs text-foreground/60">{level.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <TooltipWrapper content="Industry context helps tailor examples and use cases">
            Industry/Domain
          </TooltipWrapper>
        </label>
        <select
          value={value.industry}
          onChange={(e) => handleChange('industry', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ colorScheme: 'light dark' }}
        >
          <option value="" className="bg-background text-foreground">Select industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry} className="bg-background text-foreground">
              {industry}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          <TooltipWrapper content="Use case helps understand the purpose and urgency">
            Use Case Context
          </TooltipWrapper>
        </label>
        <select
          value={value.useCase}
          onChange={(e) => handleChange('useCase', e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          style={{ colorScheme: 'light dark' }}
        >
          <option value="" className="bg-background text-foreground">Select use case</option>
          {useCases.map(useCase => (
            <option key={useCase} value={useCase} className="bg-background text-foreground">
              {useCase}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
