import ToolsClient from './ClientComponent';

export const metadata = {
  title: "Best AI Coding Tools 2025 | Cursor, Windsurf & More",
  description: "Personally tested AI development tools that actually work. Complete guide to Cursor, Windsurf, GitHub Copilot, and more.",
  keywords: "ai coding tools, cursor ai, windsurf codeium, github copilot, best ai for coding",
};

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-900 to-purple-900">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">The Complete AI Development Toolkit</h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Everything we use and recommend to build better with AI. All personally tested and approved by our team.
          </p>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-yellow-200">
              <span className="font-bold">Note:</span> We only recommend tools we actually use. Some links are affiliate links—using them supports Context Wizard at no cost to you.
            </p>
          </div>
        </div>
      </section>

      <ToolsClient />

      {/* Comparison Table */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">AI Code Editor Comparison</h2>
          <div className="overflow-x-auto bg-gray-800 rounded-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Feature</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cursor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Windsurf</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">GitHub Copilot</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Replit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Price</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Free trial, then $20/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Free forever, Pro $10/mo</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">$10/mo or $100/yr</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Free, Pro $7/mo</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Multi-file editing</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Context understanding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">Excellent</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">Great</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">Good</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">Fair</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Works with .cursorrules</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-400">Limited</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">✗</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Offline mode</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400">✓</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-400">✗</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Best for</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">AI-first coding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Flow coding</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">VS Code users</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">Rapid prototyping</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Personal Recommendation Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center">
              <div className="mb-6 md:mb-0 md:mr-8">
                {/* Placeholder for avatar */}
                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 flex items-center justify-center text-gray-500">
                  Avatar
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">What We Actually Use</h2>
                <p className="text-gray-200 mb-4">
                  I personally use Cursor for 90% of my coding. Combined with Context Wizard{'&apos;'}s generated files, it{'&apos;'}s like having a senior developer pair programming with you.
                </p>
                <p className="text-gray-200 mb-4">
                  For quick prototypes, I switch to Replit. For deployment, always Vercel. And yes, I pay for all of these tools myself— they{'&apos;'}re worth every penny.
                </p>
                <p className="text-gray-300 font-medium">[Your Name], Founder of Context Wizard</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-2">Are these affiliate links?</h3>
              <p className="text-gray-300">
                Some are! If you purchase through our links, we earn a small commission at no extra cost to you. This helps keep Context Wizard free and improving. We only recommend tools we genuinely use and love.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-2">Why should I trust these recommendations?</h3>
              <p className="text-gray-300">
                We{'&apos;'}re developers first, marketers second. Every tool here is something we{'&apos;'}ve personally tested and use in our own workflow. We turn down affiliate partnerships if the product isn{'&apos;'}t great.
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h3 className="text-xl font-bold mb-2">Do I need all of these tools?</h3>
              <p className="text-gray-300">
                No! Start with Cursor + Context Wizard. Add other tools as your needs grow.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mb-16">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-blue-800 to-purple-800 rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to supercharge your AI coding workflow?</h2>
            <p className="text-xl text-gray-200 mb-6">
              Context Wizard generates perfect configuration files for all these tools. Try it free.
            </p>
            <a 
              href="/dashboard"
              className="inline-block bg-white text-blue-900 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Analyze Your First Repo →
            </a>
          </div>
        </div>
      </section>
      
      {/* Last Updated */}
      <div className="text-center py-6 text-gray-500 text-sm">
        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}