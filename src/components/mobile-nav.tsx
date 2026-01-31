'use client';

import Link from 'next/link';
import { Home, Settings, Trophy, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-background/80 backdrop-blur-lg border-t border-border">
            <div className="max-w-md mx-auto flex justify-between items-center px-6 py-4">

                <Link href="/" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-95">
                        {pathname === '/' && <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>}
                        <Home
                            className={clsx("w-6 h-6 transition-colors", pathname === '/' ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground")}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname === '/' ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        Home
                    </span>
                </Link>

                <Link href="/admin" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-95">
                        {pathname.startsWith('/admin') && <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>}
                        <Shield
                            className={clsx("w-6 h-6 transition-colors", pathname.startsWith('/admin') ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground")}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname.startsWith('/admin') ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        Admin
                    </span>
                </Link>

                <Link href="/settings" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-95">
                        {pathname.startsWith('/settings') && <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>}
                        <Settings
                            className={clsx("w-6 h-6 transition-colors", pathname.startsWith('/settings') ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground")}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname.startsWith('/settings') ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        Config
                    </span>
                </Link>

                <Link href="/join" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-95">
                        {pathname.startsWith('/join') && <div className="absolute inset-0 bg-primary/20 blur-sm rounded-full"></div>}
                        <Trophy
                            className={clsx("w-6 h-6 transition-colors", pathname.startsWith('/join') ? "text-primary fill-primary/10" : "text-muted-foreground group-hover:text-foreground")}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname.startsWith('/join') ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        Join
                    </span>
                </Link>
            </div>
        </nav>
    );
}
