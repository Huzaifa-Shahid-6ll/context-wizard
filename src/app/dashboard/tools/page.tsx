import ToolsClient from './ClientComponent';

export const metadata = {
  title: "Best AI Coding Tools 2025 | Cursor, Windsurf & More",
  description: "Personally tested AI development tools that actually work. Complete guide to Cursor, Windsurf, GitHub Copilot, and more.",
  keywords: "ai coding tools, cursor ai, windsurf codeium, github copilot, best ai for coding",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl mb-8 shadow-depth-md">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">The Complete AI Development Toolkit</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Everything we use and recommend to build better with AI. All personally tested and approved by our team.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-yellow-600 dark:text-yellow-400">
              <span className="font-bold">Note:</span> We only recommend tools we actually use. Some links are affiliate links—using them supports Context Wizard at no cost to you.
            </p>
          </div>
        </div>
      </section>

      <ToolsClient />

      {/* Comparison Table */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">AI Code Editor Comparison</h2>
          <div className="overflow-x-auto bg-card rounded-xl border border-border shadow-depth-md">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Cursor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Windsurf</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">GitHub Copilot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Replit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Price</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Free trial, then $20/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Free forever, Pro $10/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">$10/mo or $100/yr</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Free, Pro $7/mo</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Multi-file editing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Context understanding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Excellent</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Great</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">Good</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">Fair</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Works with .cursorrules</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-500">Limited</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">✗</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Offline mode</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">Best for</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">AI-first coding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Flow coding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">VS Code users</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">Rapid prototyping</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Personal Recommendation Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-xl p-8 max-w-3xl mx-auto shadow-depth-md border border-border">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                {/* Placeholder for avatar */}
                <div className="bg-secondary border-2 border-dashed border-border rounded-xl w-16 h-16 flex items-center justify-center text-muted-foreground">
                  Avatar
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4 text-foreground">What We Actually Use</h2>
                <p className="text-muted-foreground mb-4">
                  I personally use Cursor for 90% of my coding. Combined with Context Wizard{'\''}s generated files, it{'\''}s like having a senior developer pair programming with you.
                </p>
                <p className="text-muted-foreground mb-4">
                  For quick prototypes, I switch to Replit. For deployment, always Vercel. And yes, I pay for all of these tools myself— they{'\''}re worth every penny.
                </p>
                <p className="text-foreground font-medium">[Your Name], Founder of Context Wizard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center text-foreground">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-card rounded-xl p-6 border border-border shadow-depth-sm">
              <h3 className="text-xl font-bold mb-2 text-foreground">Are these affiliate links?</h3>
              <p className="text-muted-foreground">
                Some are! If you purchase through our links, we earn a small commission at no extra cost to you. This helps keep Context Wizard free and improving. We only recommend tools we genuinely use and love.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border shadow-depth-sm">
              <h3 className="text-xl font-bold mb-2 text-foreground">Why should I trust these recommendations?</h3>
              <p className="text-muted-foreground">
                We{'\''}re developers first, marketers second. Every tool here is something we{'\''}ve personally tested and use in our own workflow. We turn down affiliate partnerships if the product isn{'\''}t great.
              </p>
            </div>
            <div className="bg-card rounded-xl p-6 border border-border shadow-depth-sm">
              <h3 className="text-xl font-bold mb-2 text-foreground">Do I need all of these tools?</h3>
              <p className="text-muted-foreground">
                No! Start with Cursor + Context Wizard. Add other tools as your needs grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-primary/30 to-purple-600/30 rounded-2xl p-8 text-center border border-border shadow-depth-lg">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Ready to supercharge your AI coding workflow?</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Context Wizard generates perfect configuration files for all these tools. Try it free.
            </p>
            <a 
              href="/dashboard"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3 px-8 rounded-lg transition-colors shadow-depth-sm hover:shadow-elevated"
            >
              Analyze Your First Repo →
            </a>
          </div>
        </div>
      </section>
      
      {/* Last Updated */}
      <div className="text-center py-6 text-muted-foreground text-sm">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}