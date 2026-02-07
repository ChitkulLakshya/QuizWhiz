'use client';

import Link from 'next/link';
import { Home, Settings, Trophy, Shield, Layers } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import MobileNav from './mobile-nav';

export default function Navbar() {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for desktop navbar transparency
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { name: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
        { name: 'Admin', href: '/admin', icon: Shield, match: (p: string) => p.startsWith('/admin') },
        { name: 'Config', href: '/settings', icon: Settings, match: (p: string) => p.startsWith('/settings') },
        { name: 'Join', href: '/join', icon: Trophy, match: (p: string) => p.startsWith('/join') },
    ];

    return (
        <>
            {/* DESKTOP NAV (Visible on md+) */}
            <header
                className={clsx(
                    "hidden md:flex fixed top-0 left-0 right-0 z-50 transition-all duration-300 items-center justify-between px-8 py-4",
                    scrolled ? "bg-background/70 backdrop-blur-md border-b border-border/50" : "bg-transparent"
                )}
            >
                {/* Logo Area */}
                <Link href="/" className="flex items-center gap-2 group">
                    <div className="bg-primary/10 p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Layers className="w-6 h-6 text-primary" />
                    </div>
                    <span className="text-xl font-bold tracking-tight font-space-grotesk text-foreground">
                        Quiz<span className="text-primary">Whiz</span>
                    </span>
                </Link>

                {/* Desktop Navigation Links (Right Side) */}
                <nav className="flex items-center gap-8">
                    {navItems.map((item) => {
                        const isActive = item.match(pathname);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    "flex items-center gap-2 text-sm font-medium transition-all duration-200 relative py-2",
                                    isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={clsx("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                                <span>{item.name}</span>
                                {isActive && (
                                    <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </header>

            {/* MOBILE NAV (Handled by imported component, which is md:hidden) */}
            <MobileNav />
        </>
    );
}
