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
      ? 'px-4 py-2 rounded-lg depth-layer-3 text-primary shadow-depth-md font-medium transition-all duration-200'
      : 'px-4 py-2 rounded-lg text-muted-foreground hover:depth-layer-3 hover:text-primary hover:shadow-depth-sm transition-all duration-200';
  }

  return (
    <header className="sticky top-0 z-50 w-full depth-layer-1 shadow-depth-md border-b border-border/40 backdrop-blur-lg transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2 depth-layer-2 rounded-lg px-3 py-1.5 shadow-depth-sm hover-lift cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-xl font-bold tracking-tight text-primary">Conard</span>
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = item.hash ? active === item.hash.replace('#', '') : false;
            const linkClass = isActive 
              ? 'px-4 py-2 rounded-lg depth-layer-3 text-primary shadow-depth-md font-medium transition-all duration-200'
              : 'px-4 py-2 rounded-lg text-muted-foreground hover:depth-layer-3 hover:text-primary hover:shadow-depth-sm transition-all duration-200';
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
                  className="depth-layer-2 shadow-depth-sm hover-lift px-3"
                  onClick={() => { try { localStorage.setItem('auth_flow', 'signin'); } catch {} trackEvent('signin_button_clicked', { location: 'navbar_desktop' }); trackEvent('signin_started'); }}
                >
                  Sign in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button
                  className="shadow-depth-md hover:shadow-elevated transition-all duration-200 px-3"
                  onClick={() => { trackEvent('signup_button_clicked', { location: 'navbar_desktop' }); trackEvent('signup_started', { location: 'navbar_desktop' }); }}
                >
                  Sign up
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="shadow-depth-md hover:shadow-elevated transition-all duration-200 px-3">Dashboard</Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="depth-layer-1 shadow-depth-lg p-0">
              <div className="flex h-full flex-col">
                <div className="px-6 py-4 border-b border-border/40">
                  <span className="text-lg font-semibold text-primary">Menu</span>
                </div>
                <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                  {navItems.map((item) => {
                    const isActive = item.hash ? active === item.hash.replace('#', '') : false;
                    const linkClass = isActive
                      ? 'w-full depth-layer-3 rounded-lg p-4 shadow-depth-md text-primary text-base font-medium text-left transition-all'
                      : 'w-full depth-layer-2 rounded-lg p-4 shadow-depth-sm hover-lift text-base text-foreground/90 hover:text-primary text-left transition-all';
                    return (
                      <Link key={item.href} href={item.href} className={linkClass} onClick={() => { setOpen(false); trackEvent('footer_link_clicked', { link_name: item.label.toLowerCase() }); }}>
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
                <div className="px-6 py-4 border-t border-border/40 flex items-center gap-2">
                  <ThemeToggleButton className="size-8" />
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button
                        variant="ghost"
                        className="depth-layer-2 shadow-depth-sm hover-lift w-full"
                        onClick={() => { try { localStorage.setItem('auth_flow', 'signin'); } catch {} trackEvent('signin_button_clicked', { location: 'navbar_mobile' }); trackEvent('signin_started'); }}
                      >
                        Sign in
                      </Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                      <Button
                        className="shadow-depth-md hover:shadow-elevated transition-all duration-200 w-full"
                        onClick={() => { trackEvent('signup_button_clicked', { location: 'navbar_mobile' }); trackEvent('signup_started', { location: 'navbar_mobile' }); }}
                      >
                        Sign up
                      </Button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                      <Button className="shadow-depth-md hover:shadow-elevated transition-all duration-200 w-full">Dashboard</Button>
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
