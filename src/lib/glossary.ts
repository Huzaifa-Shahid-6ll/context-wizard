export interface GlossaryTerm {
  term: string;
  definition: string;
  category: string;
  relatedTerms: string[];
  examples?: string[];
  visualExample?: string;
}

export const glossary: Record<string, GlossaryTerm> = {
  // Cinematography Terms
  'aperture': {
    term: 'Aperture',
    definition: 'The opening in a camera lens that controls how much light enters the camera. Measured in f-stops (f/1.4, f/2.8, etc.). Lower numbers = wider opening = more light = shallower depth of field.',
    category: 'Cinematography',
    relatedTerms: ['depth of field', 'f-stop', 'exposure'],
    examples: ['f/1.4 for portraits with blurred backgrounds', 'f/8 for landscape shots with everything in focus']
  },
  'depth of field': {
    term: 'Depth of Field',
    definition: 'The area in front of and behind the subject that appears sharp and in focus. Controlled by aperture, focal length, and distance to subject.',
    category: 'Cinematography',
    relatedTerms: ['aperture', 'focal length', 'bokeh'],
    examples: ['Shallow depth of field for portraits', 'Deep depth of field for landscapes']
  },
  'focal length': {
    term: 'Focal Length',
    definition: 'The distance between the camera lens and the image sensor, measured in millimeters. Determines the field of view and perspective compression.',
    category: 'Cinematography',
    relatedTerms: ['wide angle', 'telephoto', 'field of view'],
    examples: ['14mm for wide landscapes', '85mm for portraits', '200mm for wildlife']
  },
  'rule of thirds': {
    term: 'Rule of Thirds',
    definition: 'A composition guideline that divides the frame into nine equal parts using two horizontal and two vertical lines. Important elements should be placed along these lines or at their intersections.',
    category: 'Cinematography',
    relatedTerms: ['composition', 'golden ratio', 'framing'],
    examples: ['Place horizon on upper or lower third line', 'Position subject at intersection points']
  },
  'golden hour': {
    term: 'Golden Hour',
    definition: 'The period shortly after sunrise or before sunset when the light is soft, warm, and diffused. Creates flattering, cinematic lighting conditions.',
    category: 'Cinematography',
    relatedTerms: ['blue hour', 'natural light', 'warm tones'],
    examples: ['Best time for outdoor portraits', 'Ideal for landscape photography']
  },

  // Lighting Terms
  'key light': {
    term: 'Key Light',
    definition: 'The main light source that illuminates the subject. Usually the brightest light and determines the overall mood and direction of the lighting.',
    category: 'Lighting',
    relatedTerms: ['fill light', 'rim light', 'three-point lighting'],
    examples: ['Window light for natural portraits', 'Studio strobe for controlled lighting']
  },
  'fill light': {
    term: 'Fill Light',
    definition: 'Secondary light source that reduces shadows created by the key light. Usually softer and less intense than the key light.',
    category: 'Lighting',
    relatedTerms: ['key light', 'shadow detail', 'lighting ratio'],
    examples: ['Reflector to bounce window light', 'Softbox to fill shadows']
  },
  'rim light': {
    term: 'Rim Light',
    definition: 'Light placed behind the subject to create a glowing edge that separates them from the background. Also called backlight or hair light.',
    category: 'Lighting',
    relatedTerms: ['backlight', 'separation', 'edge lighting'],
    examples: ['Sunset backlighting', 'Studio rim light for portraits']
  },
  'hard light': {
    term: 'Hard Light',
    definition: 'Direct, unfiltered light that creates sharp, defined shadows. Creates dramatic, high-contrast lighting.',
    category: 'Lighting',
    relatedTerms: ['soft light', 'shadow definition', 'contrast'],
    examples: ['Direct sunlight', 'Bare flash', 'Spotlight']
  },
  'soft light': {
    term: 'Soft Light',
    definition: 'Diffused light that creates gentle, gradual shadows. More flattering for portraits and creates even illumination.',
    category: 'Lighting',
    relatedTerms: ['hard light', 'diffusion', 'shadow softness'],
    examples: ['Overcast sky', 'Softbox', 'Window with sheer curtains']
  },

  // Audio Terms
  'foley': {
    term: 'Foley',
    definition: 'Sound effects created and recorded in post-production to enhance or replace sounds that were not captured during filming.',
    category: 'Audio',
    relatedTerms: ['sound effects', 'post-production', 'audio design'],
    examples: ['Footsteps on different surfaces', 'Door closing sounds', 'Clothing rustling']
  },
  'ambient sound': {
    term: 'Ambient Sound',
    definition: 'Background environmental audio that creates atmosphere and sense of place. Usually recorded separately from dialogue.',
    category: 'Audio',
    relatedTerms: ['atmosphere', 'room tone', 'background audio'],
    examples: ['Office chatter', 'Traffic noise', 'Nature sounds']
  },
  'diegetic sound': {
    term: 'Diegetic Sound',
    definition: 'Sound that exists within the story world and can be heard by the characters. Includes dialogue, music from radios, etc.',
    category: 'Audio',
    relatedTerms: ['non-diegetic', 'source music', 'story world'],
    examples: ['Character dialogue', 'Music from a radio in the scene', 'Footsteps']
  },
  'non-diegetic sound': {
    term: 'Non-Diegetic Sound',
    definition: 'Sound that exists outside the story world and is only heard by the audience. Includes background music, narration, etc.',
    category: 'Audio',
    relatedTerms: ['diegetic', 'background music', 'narrator'],
    examples: ['Film score', 'Voice-over narration', 'Sound effects for emphasis']
  },

  // Software Architecture Terms
  'microservices': {
    term: 'Microservices',
    definition: 'An architectural approach where applications are built as a collection of loosely coupled, independently deployable services.',
    category: 'Software Architecture',
    relatedTerms: ['monolith', 'service-oriented', 'distributed systems'],
    examples: ['User service', 'Payment service', 'Notification service']
  },
  'api gateway': {
    term: 'API Gateway',
    definition: 'A server that acts as an entry point for client requests, routing them to appropriate microservices and handling cross-cutting concerns.',
    category: 'Software Architecture',
    relatedTerms: ['microservices', 'routing', 'load balancing'],
    examples: ['Kong', 'AWS API Gateway', 'Zuul']
  },
  'event-driven architecture': {
    term: 'Event-Driven Architecture',
    definition: 'An architectural pattern where components communicate through events, making systems more loosely coupled and scalable.',
    category: 'Software Architecture',
    relatedTerms: ['pub/sub', 'message queues', 'asynchronous'],
    examples: ['User registration triggers email', 'Order placed updates inventory']
  },
  'serverless': {
    term: 'Serverless',
    definition: 'A cloud computing model where the cloud provider manages the server infrastructure, and you only pay for the compute time you use.',
    category: 'Software Architecture',
    relatedTerms: ['function as a service', 'cloud computing', 'auto-scaling'],
    examples: ['AWS Lambda', 'Vercel Functions', 'Netlify Functions']
  },

  // Code Style Terms
  'functional programming': {
    term: 'Functional Programming',
    definition: 'A programming paradigm that treats computation as the evaluation of mathematical functions, avoiding mutable state and side effects.',
    category: 'Code Style',
    relatedTerms: ['immutable', 'pure functions', 'declarative'],
    examples: ['map() and filter() in JavaScript', 'Haskell functions', 'React hooks']
  },
  'object-oriented programming': {
    term: 'Object-Oriented Programming',
    definition: 'A programming paradigm based on objects that contain data (attributes) and code (methods), with concepts like inheritance and encapsulation.',
    category: 'Code Style',
    relatedTerms: ['classes', 'inheritance', 'polymorphism'],
    examples: ['Java classes', 'Python objects', 'C++ inheritance']
  },
  'declarative': {
    term: 'Declarative',
    definition: 'A programming style that describes what you want to achieve rather than how to achieve it. Focuses on the end result.',
    category: 'Code Style',
    relatedTerms: ['imperative', 'functional', 'SQL'],
    examples: ['React JSX', 'SQL queries', 'CSS styling']
  },
  'immutable': {
    term: 'Immutable',
    definition: 'Data that cannot be changed after creation. Any modification creates a new instance rather than changing the original.',
    category: 'Code Style',
    relatedTerms: ['mutable', 'functional programming', 'state management'],
    examples: ['JavaScript strings', 'React state updates', 'Redux state']
  },

  // Prompt Engineering Terms
  'chain of thought': {
    term: 'Chain of Thought',
    definition: 'A prompting technique that encourages the AI to show its reasoning process step-by-step, leading to more accurate and reliable outputs.',
    category: 'Prompt Engineering',
    relatedTerms: ['reasoning', 'step-by-step', 'thinking process'],
    examples: ['"Let me think through this step by step..."', 'Showing work in math problems']
  },
  'few-shot learning': {
    term: 'Few-Shot Learning',
    definition: 'A prompting technique that provides the AI with a few examples of the desired input-output format before asking it to perform the task.',
    category: 'Prompt Engineering',
    relatedTerms: ['examples', 'demonstration', 'pattern learning'],
    examples: ['Showing 2-3 examples before asking for more', 'Template-based prompting']
  },
  'roleplay': {
    term: 'Roleplay',
    definition: 'A prompting technique where you ask the AI to assume a specific role or persona to get more targeted and expert responses.',
    category: 'Prompt Engineering',
    relatedTerms: ['persona', 'expertise', 'perspective'],
    examples: ['"Act as a senior software engineer..."', '"You are a marketing expert..."']
  },
  'temperature': {
    term: 'Temperature',
    definition: 'A parameter that controls the randomness of AI responses. Lower values (0.1-0.3) are more focused and deterministic, higher values (0.7-1.0) are more creative and random.',
    category: 'Prompt Engineering',
    relatedTerms: ['creativity', 'randomness', 'consistency'],
    examples: ['0.1 for factual responses', '0.7 for creative writing', '0.9 for brainstorming']
  }
};

export function getGlossaryTerm(term: string): GlossaryTerm | undefined {
  return glossary[term.toLowerCase()];
}

export function searchGlossary(query: string): GlossaryTerm[] {
  const searchTerm = query.toLowerCase();
  return Object.values(glossary).filter(term => 
    term.term.toLowerCase().includes(searchTerm) ||
    term.definition.toLowerCase().includes(searchTerm) ||
    term.category.toLowerCase().includes(searchTerm)
  );
}

export function getGlossaryByCategory(category: string): GlossaryTerm[] {
  return Object.values(glossary).filter(term => 
    term.category.toLowerCase() === category.toLowerCase()
  );
}

export function getRelatedTerms(term: string): GlossaryTerm[] {
  const glossaryTerm = getGlossaryTerm(term);
  if (!glossaryTerm) return [];
  
  return glossaryTerm.relatedTerms
    .map(relatedTerm => getGlossaryTerm(relatedTerm))
    .filter((term): term is GlossaryTerm => term !== undefined);
}
