'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../../../convex/_generated/api';
import { useMutation } from 'convex/react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { posthog } from 'posthog-js';
import { HoneypotField } from '@/components/forms/HoneypotField';
import { logSecurityEvent } from '@/lib/securityLogger';
import { sanitizeInput } from '@/lib/sanitize';

interface OnboardingModalProps {
  userId: string;
  onComplete: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ userId, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({
    role: '',
    tools: [] as string[],
    painPoint: '',
    projectTypes: [] as string[],
    techFamiliarity: '',
    goal: '',
    source: '',
    sourceDetails: ''
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const saveOnboarding = useMutation(api.onboarding.saveOnboarding);
  const router = useRouter();
  const honeypotRef = useRef<HTMLInputElement>(null);

  const totalSteps = 7;
  const progress = ((currentStep) / totalSteps) * 100;

  // Track onboarding start
  useEffect(() => {
    if (currentStep === 0) {
      posthog.capture('onboarding_started', { userId });
    }
  }, [currentStep, userId]);

  const handleAnswer = (question: string, value: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [question]: value
    }));

    // Auto-advance for radio buttons
    if (['role', 'painPoint', 'techFamiliarity', 'goal', 'source'].includes(question)) {
      setTimeout(() => {
        handleNext();
      }, 300);
    }

    // Track question answered
    posthog.capture('onboarding_question_answered', {
      questionNumber: currentStep + 1,
      answer: value,
      userId
    });
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCheckboxChange = (question: string, option: string) => {
    setAnswers(prev => {
      const currentValues = [...prev[question as keyof typeof prev]] as string[];
      const newValues = currentValues.includes(option)
        ? currentValues.filter(item => item !== option)
        : [...currentValues, option];

      return {
        ...prev,
        [question]: newValues
      };
    });
  };

  const handleSubmit = async () => {
    // Check honeypot
    if (honeypotRef.current?.value) {
      logSecurityEvent('honeypot_triggered', {
        path: '/onboarding',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
      // Silently fail - don't show error to bot
      return;
    }

    try {
      // Sanitize text inputs
      const sanitizedSourceDetails = answers.sourceDetails ? sanitizeInput(answers.sourceDetails) : undefined;

      // Save to Convex
      await saveOnboarding({
        userId,
        role: sanitizeInput(answers.role),
        tools: answers.tools.map(t => sanitizeInput(t)),
        painPoint: sanitizeInput(answers.painPoint),
        projectTypes: answers.projectTypes.map(p => sanitizeInput(p)),
        techFamiliarity: sanitizeInput(answers.techFamiliarity),
        goal: sanitizeInput(answers.goal),
        source: sanitizeInput(answers.source),
        sourceDetails: sanitizedSourceDetails
      });

      // Identify user in PostHog with their responses (use sanitized values)
      posthog.identify(userId, {
        role: sanitizeInput(answers.role),
        painPoint: sanitizeInput(answers.painPoint),
        goal: sanitizeInput(answers.goal),
        techFamiliarity: sanitizeInput(answers.techFamiliarity),
        tools: answers.tools.map(t => sanitizeInput(t)).join(', '),
        projectTypes: answers.projectTypes.map(p => sanitizeInput(p)).join(', '),
        source: sanitizeInput(answers.source)
      });

      // Capture completion event
      posthog.capture('onboarding_completed', {
        userId,
        role: answers.role,
        painPoint: answers.painPoint,
        goal: answers.goal
      });

      setIsCompleted(true);

      // Show success message and complete the onboarding
      toast.success('Onboarding completed! Welcome to Conard.');
      onComplete();
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      toast.error('Failed to save onboarding data. Please try again.');
    }
  };

  const getRecommendation = () => {
    if (answers.role === 'Vibe Coder (Using AI tools, learning to code)' &&
      answers.painPoint === 'AI generates broken/buggy code') {
      return {
        heading: "Start with our Cursor Builder",
        description: "It'll generate step-by-step prompts that prevent common mistakes.",
        cta: "Try Cursor Builder First",
        action: () => router.push('/cursor-builder')
      };
    } else if (answers.role === 'Professional Developer (3+ years experience)' &&
      answers.goal === 'Build features 10x faster') {
      return {
        heading: "Jump straight to GitHub analysis",
        description: "Save hours on every new project.",
        cta: "Analyze My First Repo",
        action: () => router.push('/github-analyzer')
      };
    } else if (answers.techFamiliarity === 'Just learning - need lots of guidance') {
      return {
        heading: "Check out our templates",
        description: "Pre-built prompts for common project types.",
        cta: "Browse Templates",
        action: () => router.push('/templates')
      };
    } else {
      return {
        heading: "Let's start by generating context for your first project",
        description: "Get started with our GitHub repository analysis tool.",
        cta: "Analyze a GitHub Repo",
        action: () => router.push('/github-analyzer')
      };
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // Role Identification
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-4 leading-tight">Welcome! Let{'\''}s personalize your experience</h2>
            <h3 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">What best describes your role?</h3>

            <div className="space-y-3">
              {[
                { emoji: '👨‍💻', label: 'Vibe Coder (Using AI tools, learning to code)' },
                { emoji: '💼', label: 'Professional Developer (3+ years experience)' },
                { emoji: '🎨', label: 'Designer/No-Code Builder' },
                { emoji: '🚀', label: 'Founder/Entrepreneur' },
                { emoji: '🎓', label: 'Student/Learning to Code' },
                { emoji: '📊', label: 'Other' }
              ].map((option) => (
                <button
                  key={option.label}
                  className={`w-full text-left p-4 rounded-lg border transition-all shadow-depth-sm hover:shadow-depth-md ${answers.role === option.label
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50 text-foreground'
                    }`}
                  onClick={() => handleAnswer('role', option.label)}
                >
                  <span className="mr-3 text-lg">{option.emoji}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 1: // Current Tool Usage
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">Which AI coding tools are you currently using?</h2>
            <p className="text-muted-foreground mb-6 text-sm">(Select all that apply)</p>

            <div className="space-y-3">
              {[
                { emoji: '⚡', label: 'Cursor' },
                { emoji: '🌊', label: 'Windsurf' },
                { emoji: '🤖', label: 'GitHub Copilot' },
                { emoji: '🔮', label: 'Replit' },
                { emoji: '🎯', label: 'Other AI coding tool' },
                { emoji: '❌', label: 'None yet (just exploring)' }
              ].map((option) => (
                <div key={option.label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tool-${option.label}`}
                    checked={answers.tools.includes(option.label)}
                    onChange={() => handleCheckboxChange('tools', option.label)}
                    className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor={`tool-${option.label}`}
                    className="ml-3 text-foreground flex items-center cursor-pointer w-full py-3 text-sm md:text-base"
                  >
                    <span className="mr-3 text-lg">{option.emoji}</span>
                    <span>{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 2: // Main Pain Point
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">What{'\''}s your biggest frustration with AI coding tools?</h2>

            <div className="space-y-3">
              {[
                { emoji: '😤', label: 'AI generates broken/buggy code' },
                { emoji: '🤷', label: 'AI doesn\'t understand my project structure' },
                { emoji: '⏰', label: 'Takes too long to set up context for each project' },
                { emoji: '💸', label: 'Wasting API credits on bad results' },
                { emoji: '📚', label: 'Don\'t know how to write good prompts' },
                { emoji: '😕', label: 'Not sure yet / Just getting started' }
              ].map((option) => (
                <button
                  key={option.label}
                  className={`w-full text-left p-4 rounded-lg border transition-all shadow-depth-sm hover:shadow-depth-md ${answers.painPoint === option.label
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50 text-foreground'
                    }`}
                  onClick={() => handleAnswer('painPoint', option.label)}
                >
                  <span className="mr-3 text-lg">{option.emoji}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 3: // Project Types
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">What types of projects do you build?</h2>
            <p className="text-muted-foreground mb-6 text-sm">(Select all that apply)</p>

            <div className="grid grid-cols-1 gap-3">
              {[
                { emoji: '🌐', label: 'Web Applications (React, Vue, etc.)' },
                { emoji: '📱', label: 'Mobile Apps (React Native, Flutter, etc.)' },
                { emoji: '🖥️', label: 'Desktop Applications' },
                { emoji: '🔌', label: 'APIs & Backend Services' },
                { emoji: '💼', label: 'Portfolio/Landing Pages' },
                { emoji: '🛒', label: 'E-commerce Sites' },
                { emoji: '🎮', label: 'Games' },
                { emoji: '📊', label: 'Data/Analytics Tools' },
                { emoji: '🤔', label: 'Still exploring / Learning' }
              ].map((option) => (
                <div key={option.label} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`project-${option.label}`}
                    checked={answers.projectTypes.includes(option.label)}
                    onChange={() => handleCheckboxChange('projectTypes', option.label)}
                    className="w-5 h-5 text-primary bg-secondary border-border rounded focus:ring-primary focus:ring-2"
                  />
                  <label
                    htmlFor={`project-${option.label}`}
                    className="ml-3 text-foreground flex items-center cursor-pointer w-full py-3 text-sm md:text-base"
                  >
                    <span className="mr-3 text-lg">{option.emoji}</span>
                    <span>{option.label}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 4: // Tech Stack Familiarity
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">How familiar are you with your tech stack?</h2>

            <div className="space-y-3">
              {[
                { emoji: '🎓', label: 'Just learning - need lots of guidance' },
                { emoji: '📝', label: 'Somewhat familiar - can follow tutorials' },
                { emoji: '💪', label: 'Confident - know my way around' },
                { emoji: '🧙', label: 'Expert - know best practices deeply' }
              ].map((option) => (
                <button
                  key={option.label}
                  className={`w-full text-left p-4 rounded-lg border transition-all shadow-depth-sm hover:shadow-depth-md ${answers.techFamiliarity === option.label
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50 text-foreground'
                    }`}
                  onClick={() => handleAnswer('techFamiliarity', option.label)}
                >
                  <span className="mr-3 text-lg">{option.emoji}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 5: // Desired Outcome
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">What{'\''}s your main goal in the next 30 days?</h2>

            <div className="space-y-3">
              {[
                { emoji: '🚀', label: 'Ship my first AI-generated project' },
                { emoji: '⚡', label: 'Build features 10x faster' },
                { emoji: '📖', label: 'Better understand how to work with AI tools' },
                { emoji: '💼', label: 'Improve code quality from AI' },
                { emoji: '🎯', label: 'Stop wasting time on bad AI outputs' },
                { emoji: '🔧', label: 'Set up better workflows for my team' }
              ].map((option) => (
                <button
                  key={option.label}
                  className={`w-full text-left p-4 rounded-lg border transition-all shadow-depth-sm hover:shadow-depth-md ${answers.goal === option.label
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50 text-foreground'
                    }`}
                  onClick={() => handleAnswer('goal', option.label)}
                >
                  <span className="mr-3 text-lg">{option.emoji}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case 6: // How They Found Us
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">How did you hear about Conard?</h2>

            <div className="space-y-3 mb-6">
              {[
                { emoji: '🐦', label: 'Twitter/X' },
                { emoji: '🔍', label: 'Google Search' },
                { emoji: '📺', label: 'YouTube' },
                { emoji: '💬', label: 'Reddit/Discord/Forum' },
                { emoji: '👥', label: 'Friend or Colleague' },
                { emoji: '📱', label: 'Product Hunt' },
                { emoji: '📰', label: 'Blog/Article' },
                { emoji: '🤷', label: 'Don\'t remember' }
              ].map((option) => (
                <button
                  key={option.label}
                  className={`w-full text-left p-4 rounded-lg border transition-all shadow-depth-sm hover:shadow-depth-md ${answers.source === option.label
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border hover:border-primary/50 bg-card hover:bg-secondary/50 text-foreground'
                    }`}
                  onClick={() => handleAnswer('source', option.label)}
                >
                  <span className="mr-3 text-lg">{option.emoji}</span>
                  <span className="text-sm md:text-base">{option.label}</span>
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="sourceDetails" className="block text-foreground mb-2">Any other details? (optional)</label>
              <input
                type="text"
                id="sourceDetails"
                value={answers.sourceDetails}
                onChange={(e) => handleAnswer('sourceDetails', e.target.value)}
                className="w-full p-3 rounded-lg bg-secondary border border-border text-foreground shadow-inset focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
                placeholder="Tell us more..."
              />
            </div>
          </div>
        );

      case 7: // Final Recommendation Screen
        const recommendation = getRecommendation();
        return (
          <div className="w-full max-w-md">
            <h2 className="text-2xl font-bold text-foreground mb-6 leading-tight">Perfect! Here{'\''}s What We Recommend For You</h2>

            <div className="bg-secondary/50 p-6 rounded-lg border border-border shadow-depth-md">
              <h3 className="text-xl font-semibold text-primary mb-2">{recommendation.heading}</h3>
              <p className="text-foreground mb-6">{recommendation.description}</p>

              <button
                onClick={recommendation.action}
                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
              >
                {recommendation.cta}
              </button>
            </div>

            <div className="mt-8 p-4 bg-secondary/30 rounded-lg border border-border">
              <h4 className="font-semibold text-foreground mb-2">Quick Tips for Success:</h4>
              <ul className="text-muted-foreground space-y-1">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Start with a small, simple repo first</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Review generated files before using</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">✓</span>
                  <span>Customize .cursorrules for your style</span>
                </li>
              </ul>
            </div>

            <div className="mt-6">
              <button
                onClick={() => {
                  handleSubmit();
                }}
                className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
              >
                Get Started
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isCompleted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={(e) => e.stopPropagation()} />

      {/* Modal Container with scroll support */}
      <div className="relative w-full max-w-2xl bg-card rounded-xl border border-border overflow-hidden shadow-depth-lg my-8">
        {/* Progress Bar */}
        <div className="h-1.5 bg-muted">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: `${progress}%` }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Header with step indicator */}
        <div className="p-6 border-b border-border bg-card">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm font-medium">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={() => {
                posthog.capture('onboarding_abandoned', {
                  userId,
                  lastQuestion: currentStep + 1
                });
                onComplete();
              }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center min-h-[400px] bg-card">
          <HoneypotField />
          <input
            ref={honeypotRef}
            type="text"
            name="website_url"
            style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full flex flex-col items-center"
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        {currentStep < 7 && (
          <div className="p-6 border-t border-border flex justify-between bg-card">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-lg transition-colors ${currentStep === 0
                  ? 'text-muted-foreground/50 cursor-not-allowed'
                  : 'text-foreground hover:bg-secondary'
                }`}
            >
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={
                (currentStep === 0 && !answers.role) ||
                (currentStep === 2 && !answers.painPoint) ||
                (currentStep === 4 && !answers.techFamiliarity) ||
                (currentStep === 5 && !answers.goal) ||
                (currentStep === 6 && !answers.source)
              }
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {currentStep === 6 ? 'Finish' : 'Next'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingModal;