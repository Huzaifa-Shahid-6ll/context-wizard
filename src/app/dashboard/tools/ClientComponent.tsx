'use client';

import { trackAffiliateClick } from '@/lib/affiliates';
import { useState } from 'react';

export default function ToolsClient() {
  const [activeTab, setActiveTab] = useState('ai-coding');

  return (
    <>
      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex flex-wrap justify-center gap-2 mb-12 border-b border-border pb-4">
          {[
            { id: 'ai-coding', label: 'AI Coding Tools ⭐' },
            { id: 'dev-tools', label: 'Development Tools 🛠️' },
            { id: 'learning', label: 'Learning Resources 📚' },
            { id: 'productivity', label: 'Productivity Tools ⚡' },
            { id: 'design', label: 'Design Tools 🎨' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg transition-colors shadow-depth-sm ${activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-secondary border border-border'
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* AI Coding Tools Section */}
        {activeTab === 'ai-coding' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Cursor */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">Cursor</h3>
                    <p className="text-primary mb-2">The AI-first code editor</p>
                  </div>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">🔥 Our Top Pick</span>
                </div>
                <p className="text-muted-foreground mb-4">
                  The best AI coding tool we{'\''}ve used. Conard generates perfect .cursorrules files specifically for Cursor. Integrated GitHub Copilot++ and GPT-4.
                </p>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> AI-powered code completion</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Natural language editing</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Multi-file editing</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Works with .cursorrules</li>
                </ul>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free trial, then $20/month</div>
                <a
                  href="https://cursor.sh"
                  onClick={() => trackAffiliateClick('Cursor', 'AI Coding', 'https://cursor.sh')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Try Cursor Free →
                </a>
              </div>

              {/* Windsurf */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">Windsurf</h3>
                    <p className="text-primary mb-2">Flow state for coding</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Another excellent AI code editor with great context understanding. Works beautifully with Conard{'\''}s generated files.
                </p>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Real-time AI collaboration</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Multi-language support</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Context-aware suggestions</li>
                </ul>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free forever, Pro $10/month</div>
                <a
                  href="https://windsurf.ai"
                  onClick={() => trackAffiliateClick('Windsurf', 'AI Coding', 'https://windsurf.ai')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Try Windsurf →
                </a>
              </div>

              {/* GitHub Copilot */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1 text-foreground">GitHub Copilot</h3>
                    <p className="text-primary mb-2">Your AI pair programmer</p>
                  </div>
                </div>
                <p className="text-muted-foreground mb-4">
                  Works in VS Code, JetBrains, and more. Great for developers who want to stick with their favorite editor.
                </p>
                <ul className="mb-4 space-y-2">
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Works in VS Code</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Trained on billions of lines</li>
                  <li className="flex items-center text-foreground"><span className="text-green-500 mr-2">✓</span> Multi-IDE support</li>
                </ul>
                <div className="text-muted-foreground text-sm mb-4">Pricing: $10/month or $100/year</div>
                <a
                  href="https://github.com/features/copilot"
                  onClick={() => trackAffiliateClick('GitHub Copilot', 'AI Coding', 'https://github.com/features/copilot')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Get Copilot →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Development Tools Section */}
        {activeTab === 'dev-tools' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Replit */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Replit</h3>
                <p className="text-muted-foreground mb-4">
                  Build and deploy apps directly in browser. Perfect for quick prototypes and learning.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free, Pro $7/month</div>
                <a
                  href="https://replit.com"
                  onClick={() => trackAffiliateClick('Replit', 'Development', 'https://replit.com')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Try Replit →
                </a>
              </div>

              {/* Vercel */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Vercel</h3>
                <p className="text-muted-foreground mb-4">
                  Deploy your Next.js, React, and frontend projects in seconds. We use it for Conard.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free hobby tier, Pro $20/month</div>
                <a
                  href="https://vercel.com"
                  onClick={() => trackAffiliateClick('Vercel', 'Development', 'https://vercel.com')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Deploy Free →
                </a>
              </div>

              {/* Supabase */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Supabase</h3>
                <p className="text-muted-foreground mb-4">
                  Open source Firebase alternative. Postgres database, authentication, real-time subscriptions.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free, Pro $25/month</div>
                <a
                  href="https://supabase.com"
                  onClick={() => trackAffiliateClick('Supabase', 'Development', 'https://supabase.com')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Get Started →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Learning Resources Section */}
        {activeTab === 'learning' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AI Course */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">AI-Powered Developer Course</h3>
                <p className="text-purple-500 mb-2">Video Course</p>
                <p className="text-muted-foreground mb-4">
                  Learn to build full-stack apps using AI tools. Perfect for vibe coders.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Price: $99 (Use code CONTEXTWIZARD for 20%)</div>
                <a
                  href="#"
                  onClick={() => trackAffiliateClick('AI Developer Course', 'Learning', '#')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Get Course →
                </a>
              </div>

              {/* AI Developer's Handbook */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">The AI Developer{'\''}s Handbook</h3>
                <p className="text-purple-500 mb-2">eBook</p>
                <p className="text-muted-foreground mb-4">
                  Complete guide to prompt engineering for developers.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Price: $29</div>
                <a
                  href="#"
                  onClick={() => trackAffiliateClick('AI Developer Handbook', 'Learning', '#')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Download →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Productivity Tools Section */}
        {activeTab === 'productivity' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Arc Browser */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Arc Browser</h3>
                <p className="text-muted-foreground mb-4">
                  The browser designed for developers. Spaces, split view, and AI features.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free</div>
                <a
                  href="https://arc.net"
                  onClick={() => trackAffiliateClick('Arc Browser', 'Productivity', 'https://arc.net')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Download Arc →
                </a>
              </div>

              {/* Raycast */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Raycast</h3>
                <p className="text-muted-foreground mb-4">
                  Extendable launcher for Mac. Search, calculate, and control your tools.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free, Pro $8/month</div>
                <a
                  href="https://raycast.com"
                  onClick={() => trackAffiliateClick('Raycast', 'Productivity', 'https://raycast.com')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Get Raycast →
                </a>
              </div>
            </div>
          </section>
        )}

        {/* Design Tools Section */}
        {activeTab === 'design' && (
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* v0 by Vercel */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">v0 by Vercel</h3>
                <p className="text-muted-foreground mb-4">
                  Generate UI with AI, export to React/Next.js code.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free credits, then paid</div>
                <a
                  href="https://v0.dev"
                  onClick={() => trackAffiliateClick('v0 by Vercel', 'Design', 'https://v0.dev')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Try v0 →
                </a>
              </div>

              {/* Figma */}
              <div className="bg-card rounded-xl p-6 border border-border hover:border-primary transition-all duration-300 shadow-depth-md hover:shadow-elevated">
                <h3 className="text-xl font-bold mb-2 text-foreground">Figma</h3>
                <p className="text-muted-foreground mb-4">
                  Design tool every developer should know. Create mockups before coding.
                </p>
                <div className="text-muted-foreground text-sm mb-4">Pricing: Free, Pro $12/month</div>
                <a
                  href="https://figma.com"
                  onClick={() => trackAffiliateClick('Figma', 'Design', 'https://figma.com')}
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-2 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
                >
                  Start Designing →
                </a>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}