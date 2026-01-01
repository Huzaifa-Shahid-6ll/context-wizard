import { trackEvent } from "@/lib/analytics";
import { Twitter, Github, Linkedin, MessageCircle } from "@/lib/icons";
import React, { useState } from "react";
import { FeedbackModal } from "@/components/feedback/FeedbackModal";

export const Footer: React.FC = () => {
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [initialPage] = useState(() => typeof window !== 'undefined' ? window.location.pathname : '');

  const openFeedbackModal = () => {
    trackEvent('feedback_modal_opened', { location: 'footer' });
    setIsFeedbackModalOpen(true);
  };

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] px-4 py-12 text-sm text-white/60">
      {/* Footer Columns */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Column 1: Brand */}
        <div>
          <div className="flex items-center space-x-2">
            {/* Replace with your logo */}
            <div className="h-8 w-8 bg-gray-700" />
            <span className="text-lg font-semibold text-white">Conard</span>
          </div>
          <p className="mt-2">Build complete apps with guided prompts</p>
          <p className="mt-2">
            Transform your app building workflow with step-by-step prompts that guide you from idea to production-ready application.
          </p>
          <div className="mt-4 flex space-x-4">
            <a href="https://twitter.com/contextwizard" aria-label="Twitter" className="text-white/60 transition-colors hover:text-white" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'twitter' })}>
              <Twitter className="h-5 w-5" />
            </a>
            <a href="https://github.com/contextwizard" aria-label="GitHub" className="text-white/60 transition-colors hover:text-white" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'github' })}>
              <Github className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/company/contextwizard" aria-label="LinkedIn" className="text-white/60 transition-colors hover:text-white" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'linkedin' })}>
              <Linkedin className="h-5 w-5" />
            </a>
            <a href="https://discord.gg/contextwizard" aria-label="Discord" className="text-white/60 transition-colors hover:text-white" target="_blank" rel="noreferrer noopener" onClick={() => trackEvent('footer_link_clicked', { link_name: 'discord' })}>
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Column 2: Product */}
        <div>
          <h3 className="text-base font-semibold text-white">Product</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="#features" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'features' })}>Features</a></li>
            <li><a href="#how-it-works" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'how_it_works' })}>How It Works</a></li>
            <li><a href="#pricing" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'pricing' })}>Pricing</a></li>
            <li><a href="/dashboard" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'dashboard' })}>Dashboard</a></li>
          </ul>
        </div>

        {/* Column 3: Resources */}
        <div>
          <h3 className="text-base font-semibold text-white">Resources</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/docs" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'documentation' })}>Documentation</a></li>
            <li><a href="https://discord.gg/contextwizard" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'community' })}>Community</a></li>
            <li><a href="mailto:support@contextwizard.com" className="text-white/60 transition-colors hover:text-white" onClick={() => { trackEvent('footer_link_clicked', { link_name: 'support' }); trackEvent('support_link_clicked'); }}>Support</a></li>
          </ul>
        </div>

        {/* Column 4: Legal */}
        <div>
          <h3 className="text-base font-semibold text-white">Legal</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/privacy" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'privacy' })}>Privacy Policy</a></li>
            <li><a href="/terms" className="text-white/60 transition-colors hover:text-white" onClick={() => trackEvent('footer_link_clicked', { link_name: 'terms' })}>Terms of Service</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mx-auto mt-8 flex max-w-6xl flex-col justify-between border-t border-white/10 pt-4 text-center md:flex-row md:text-center">
        <p>© 2025 Conard. All rights reserved.</p>
        <p>Built with ❤️ for developers</p>
        <p className="flex items-center">
          <span className="mr-2 h-2 w-2 rounded-full bg-green-500" />
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
