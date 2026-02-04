'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { WalletButton } from '@/components/WalletButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { cn } from '@/lib/utils';
import { Zap, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/bounties', label: 'Bounties' },
  { href: '/create', label: 'Create' },
  { href: '/dashboard', label: 'Dashboard' },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Zap className="h-6 w-6 text-primary" />
            <span>AgentBounty</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'text-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Desktop Wallet Button */}
          <div className="hidden md:block">
            <WalletButton />
          </div>
          
          {/* Mobile Menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="flex items-center gap-2 font-bold text-xl mb-8">
                <Zap className="h-6 w-6 text-primary" />
                <span>AgentBounty</span>
              </SheetTitle>
              
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'text-lg font-medium transition-colors hover:text-primary py-2',
                      pathname === link.href
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
              
              <div className="mt-8 pt-8 border-t">
                <WalletButton />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
