export interface FeatureFlags {
  structuredImagePrompts: boolean;
  structuredVideoPrompts: boolean;
  structuredCursorBuilder: boolean;
  structuredGenericPrompt: boolean;
  smartAutofill: boolean;
  templateLibrary: boolean;
  progressiveDisclosure: boolean;
  realTimePreview: boolean;
  glossarySystem: boolean;
  enhancedTechStackDetection: boolean;
}

export const FEATURE_FLAGS: FeatureFlags = {
  structuredImagePrompts: true,
  structuredVideoPrompts: true,
  structuredCursorBuilder: true,
  structuredGenericPrompt: true,
  smartAutofill: true,
  templateLibrary: true,
  progressiveDisclosure: true,
  realTimePreview: true,
  glossarySystem: true,
  enhancedTechStackDetection: true,
};

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return FEATURE_FLAGS[feature];
}

export function getEnabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => enabled)
    .map(([feature]) => feature);
}

export function getDisabledFeatures(): string[] {
  return Object.entries(FEATURE_FLAGS)
    .filter(([, enabled]) => !enabled)
    .map(([feature]) => feature);
}
