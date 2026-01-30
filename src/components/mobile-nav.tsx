'use client';

import Link from 'next/link';
import { Home, Settings, Trophy } from 'lucide-react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 w-full z-50 bg-[#0a0a0a] border-t-4 border-[#1a1a1a]">
            <div className="max-w-md mx-auto flex justify-between items-center px-6 py-4">

                <Link href="/" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-90">
                        {pathname === '/' && <div className="absolute inset-0 bg-[#ccff00]/10 skew-x-12"></div>}
                        <Home
                            className={clsx("w-7 h-7 transition-colors", pathname === '/' ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white")}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname === '/' ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white"
                    )}>
                        Home
                    </span>
                </Link>

                <Link href="/admin" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-90">
                        {pathname.startsWith('/admin') && <div className="absolute inset-0 bg-[#ccff00]/10 skew-x-12"></div>}
                        <Settings
                            className={clsx("w-7 h-7 transition-colors", pathname.startsWith('/admin') ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white")}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname.startsWith('/admin') ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white"
                    )}>
                        Admin
                    </span>
                </Link>

                <Link href="/join" className="flex flex-col items-center gap-1 group">
                    <div className="relative flex items-center justify-center p-2 transition-transform group-active:scale-90">
                        {pathname.startsWith('/join') && <div className="absolute inset-0 bg-[#ccff00]/10 skew-x-12"></div>}
                        <Trophy
                            className={clsx("w-7 h-7 transition-colors", pathname.startsWith('/join') ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white")}
                        />
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold tracking-widest uppercase transition-colors",
                        pathname.startsWith('/join') ? "text-[#ccff00]" : "text-gray-500 group-hover:text-white"
                    )}>
                        Join
                    </span>
                </Link>
            </div>
        </nav>
    );
}
