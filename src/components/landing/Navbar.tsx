'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';

type NavItem = {
  href: string;
  label: string;
  hash?: string;
};

const navItems: NavItem[] = [
  { href: '/#features', label: 'Features', hash: '#features' },
  { href: '/#how-it-works', label: 'How It Works', hash: '#how-it-works' },
  { href: '/#pricing', label: 'Pricing', hash: '#pricing' },
  { href: '/#faq', label: 'FAQ', hash: '#faq' },
];

function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = React.useState<string | null>(null);

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
  }, [ids.join(',')]);

  return active;
}

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const active = useActiveSection(['features', 'how-it-works', 'pricing', 'faq']);
  const [open, setOpen] = React.useState(false);

  function linkClasses(targetHash?: string): string {
    const isActive = targetHash && active === targetHash.replace('#', '');
    return `transition-colors ${isActive ? 'text-primary' : 'text-foreground/80 hover:text-primary/80'}`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 backdrop-blur-lg bg-background/80 shine-top">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <Link href="/" className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span className="text-xl font-bold tracking-tight text-primary">Context Wizard</span>
        </Link>

        {/* Center: Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClasses(item.hash)} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth + Mobile */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <SignedOut>
              <SignInButton mode="modal">
                <Button variant="ghost" className="px-3">Sign in</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard">
                <Button className="px-3">Dashboard</Button>
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
            <SheetContent side="right" className="p-0">
              <div className="flex h-full flex-col">
                <div className="px-6 py-4 border-b border-border/40">
                  <span className="text-lg font-semibold text-primary">Menu</span>
                </div>
                <nav className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
                  {navItems.map((item) => (
                    <Link key={item.href} href={item.href} className="text-base text-foreground/90 hover:text-primary" onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="px-6 py-4 border-t border-border/40 flex items-center gap-2">
                  <SignedOut>
                    <SignInButton mode="modal">
                      <Button variant="ghost" className="w-full">Sign in</Button>
                    </SignInButton>
                  </SignedOut>
                  <SignedIn>
                    <Link href="/dashboard" className="w-full" onClick={() => setOpen(false)}>
                      <Button className="w-full">Dashboard</Button>
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


