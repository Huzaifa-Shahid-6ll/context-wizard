import { trackEvent } from "@/lib/analytics";
import { Twitter, Github, Linkedin, MessageCircle } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export const Footer: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [initialPage] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '');

  const openFeedbackModal = () => {
    trackEvent('feedback_modal_opened', { location: 'footer' });
    setIsFeedbackModalOpen(true);
  };

  return (
    <footer className="bg-muted/30 border-t py-12 px-4 text-sm text-muted-foreground">
      {/* Newsletter Signup */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-lg font-bold text-shadow-sm">Stay Updated</h2>
        <p>Get the latest features and updates delivered to your inbox</p>
        <form className="mt-4 flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
          <Input type="email" placeholder="Enter your email" className="flex-1 depth-layer-1 shadow-inset border-0" aria-label="Email address" />
          <Button type="submit" className="depth-top shadow-depth-md hover:shadow-elevated">Subscribe</Button>
        </form>
        <p className="mt-2 text-xs">No spam. Unsubscribe anytime.</p>
      </div>

      {/* Footer Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
        {/* Column 1: Brand */}
        <div>
          <div className="flex items-center space-x-2">
            {/* Replace with your logo */}
            <div className="h-8 w-8 bg-gray-300" />
            <span className="text-lg font-bold">Context Wizard</span>
          </div>
          <p className="mt-2">AI-powered context generation for better code</p>
          <p className="mt-2">
            Transform your development workflow with intelligent context files that make AI coding assistants understand your
            projects perfectly.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="https://twitter.com/contextwizard" aria-label="Twitter" className="hover:text-primary transition-colors" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'twitter' })}>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://github.com/contextwizard" aria-label="GitHub" className="hover:text-primary transition-colors" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'github' })}>
              <Github className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/company/contextwizard" aria-label="LinkedIn" className="hover:text-primary transition-colors" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'linkedin' })}>
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://discord.gg/contextwizard" aria-label="Discord" className="hover:text-primary transition-colors" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'discord' })}>
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Column 2: Product */}
        <div>
          <h3 className="font-semibold text-shadow-sm">Product</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="#features" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'features' })}>Features</a></li>
            <li><a href="#how-it-works" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'how_it_works' })}>How It Works</a></li>
            <li><a href="#pricing" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'pricing' })}>Pricing</a></li>
            <li><a href="/dashboard" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'dashboard' })}>Dashboard</a></li>
            <li><span className="text-muted-foreground">Changelog (coming soon)</span></li>
            <li><span className="text-muted-foreground">Roadmap (coming soon)</span></li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h3 className="font-semibold text-shadow-sm">Resources</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="/docs" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'documentation' })}>Documentation</a></li>
            <li><a href="/api-docs" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'api_reference' })}>API Reference</a></li>
            <li><a href="/tools" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'tools' })}>Tools</a></li>
            <li><a href="/blog" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'blog' })}>Blog</a></li>
            <li><a href="/tutorials" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'tutorials' })}>Tutorials</a></li>
            <li><a href="https://discord.gg/contextwizard" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'community' })}>Community</a></li>
            <li><a href="#" className="hover:text-primary transition-colors" onClick={(e) => { e.preventDefault(); openFeedbackModal(); trackEvent('footer_link_clicked', { link_name: 'feedback' }); }}>Feedback</a></li>
            <li><a href="mailto:support@contextwizard.com" className="hover:text-primary transition-colors" onClick={() => { trackEvent('footer_link_clicked', { link_name: 'support' }); trackEvent('support_link_clicked'); }}>Support</a></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h3 className="font-semibold text-shadow-sm">Legal</h3>
          <ul className="mt-2 space-y-2">
            <li><a href="/privacy" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'privacy' })}>Privacy Policy</a></li>
            <li><a href="/terms" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'terms' })}>Terms of Service</a></li>
            <li><a href="/cookies" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'cookies' })}>Cookie Policy</a></li>
            <li><a href="/gdpr" className="hover:text-primary transition-colors" onClick={() => trackEvent('footer_link_clicked', { link_name: 'gdpr' })}>GDPR Compliance</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 border-t pt-4 flex flex-col md:flex-row justify-between items-center text-center max-w-6xl mx-auto">
        <p>© 2025 Context Wizard. All rights reserved.</p>
        <p>Built with ❤️ for developers</p>
        <p className="flex items-center">
          <span className="h-2 w-2 bg-green-500 rounded-full mr-2" />
          All systems operational
        </p>
      </div>
      {/* Feedback Modal */}
      <FeedbackModal 
        isOpen={isFeedbackModalOpen} 
        onClose={() => setIsFeedbackModalOpen(false)} 
        initialPage={initialPage}
      />
    </footer>
  );
};


