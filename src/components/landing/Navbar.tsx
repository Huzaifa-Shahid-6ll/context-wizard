'use client';

import React from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { trackEvent } from '@/lib/analytics';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from '@/lib/icons';
import ThemeToggleButton from '@/components/ui/ThemeToggleButton';

type NavItem = {
  href: string;
  label: string;
  hash?: string;
};

const navItems: NavItem[] = [
  { href: '/#how-it-works', label: 'How It Works', hash: '#how-it-works' },
  { href: '/#features', label: 'Features', hash: '#features' },
  { href: '/tools', label: 'Tools' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ', hash: '#faq' },
];

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null);
  const idsKey = ids.join(',');

  React.useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const options: IntersectionObserverInit = {
      root: null,
      rootMargin: '0px 0px -60% 0px',
      threshold: 0.1,
    };

    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(id);
          }
        });
      }, options);
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [ids, idsKey]);

  return active;
}

export const Navbar: React.FC = () => {
  const active = useActiveSection(['how-it-works', 'features', 'faq']);
  const [open, setOpen] = React.useState(false);

  function linkClasses(targetHash?: string): string {
    const isActive = targetHash && active === targetHash.replace('#', '');
    return isActive
      ? 'px-4 py-2 text-white font-medium'
      : 'px-4 py-2 text-white/60 hover:text-white transition-colors';
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-lg font-semibold tracking-tight text-white">Conard</span>
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.hash ? active === item.hash.replace('#', '') : false;
            const linkClass = isActive
              ? 'px-4 py-2 text-white font-medium'
              : 'px-4 py-2 text-white/60 hover:text-white transition-colors';
            return (
              <Link key={item.href} href={item.href} className={linkClass} onClick={() => { setOpen(false); trackEvent('footer_link_clicked', { link_name: item.label.toLowerCase() }); }}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right: Auth + Mobile */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggleButton className="size-8" />
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="text-white/80 hover:text-white hover:bg-white/10 px-3"
                  onClick={() => { try { localStorage.setItem('auth_flow', 'signin'); } catch {} trackEvent('signin_button_clicked', { location: 'navbar_desktop' }); trackEvent('signin_started'); }}
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  className="bg-white text-black hover:bg-white/90 transition-colors px-4"
                  onClick={() => { trackEvent('signup_button_clicked', { location: 'navbar_desktop' }); trackEvent('signup_started', { location: 'navbar_desktop' }); }}
                >
                  Sign up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="bg-white text-black hover:bg-white/90 transition-colors px-4">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-[#0a0a0a] border-white/10 p-0">
              <div className="flex h-full flex-col">
                <div className="border-b border-white/10 px-6 py-4">
                  <span className="text-lg font-semibold text-white">Menu</span>
                </div>
                <nav className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-4">
                  {navItems.map((item) => {
                    const isActive = item.hash ? active === item.hash.replace('#', '') : false;
                    const linkClass = isActive
                      ? 'w-full p-4 text-white text-base font-medium text-left'
                      : 'w-full p-4 text-white/60 hover:text-white text-base text-left transition-colors';
                    return (
                      <Link key={item.href} href={item.href} className={linkClass} onClick={() => { setOpen(false); trackEvent('footer_link_clicked', { link_name: item.label.toLowerCase() }); }}>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="flex items-center gap-2 border-t border-white/10 px-6 py-4">
                  <ThemeToggleButton className="size-8" />
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        variant="ghost"
                        className="text-white/80 hover:text-white hover:bg-white/10 w-full"
                        onClick={() => { try { localStorage.setItem('auth_flow', 'signin'); } catch {} trackEvent('signin_button_clicked', { location: 'navbar_mobile' }); trackEvent('signin_started'); }}
                      >
                        Sign in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        className="bg-white text-black hover:bg-white/90 transition-colors w-full"
                        onClick={() => { trackEvent('signup_button_clicked', { location: 'navbar_mobile' }); trackEvent('signup_started', { location: 'navbar_mobile' }); }}
                      >
                        Sign up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                      <Button className="bg-white text-black hover:bg-white/90 transition-colors w-full">Dashboard</Button>
                    </Link>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
