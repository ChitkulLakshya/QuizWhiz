'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Monitor, Zap } from 'lucide-react';

export default function ComingSoonPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl w-full text-center relative z-10"
            >
                <div className="mb-8 inline-flex items-center justify-center p-4 bg-[#ccff00]/10 rounded-full border border-[#ccff00]/20 shadow-[0_0_30px_rgba(204,255,0,0.15)]">
                    <Monitor className="w-12 h-12 text-[#ccff00]" />
                </div>

                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6 leading-none">
                    Before <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                        You Download
                    </span>
                </h1>

                <p className="text-xl text-gray-400 font-light mb-12 max-w-lg mx-auto leading-relaxed">
                    The desktop experience is currently in <span className="text-[#ccff00] font-bold">active development</span>.
                    We're polishing the final bits to ensure a flawless offline-capable experience.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button asChild size="lg" className="h-14 px-8 bg-[#ccff00] text-black hover:bg-white font-bold uppercase tracking-widest text-sm w-full sm:w-auto">
                        <Link href="/settings">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Settings
                        </Link>
                    </Button>

                    
                </div>

                <div className="mt-16 pt-8 border-t border-white/5">
                    <p className="text-xs font-mono text-gray-600 uppercase tracking-[0.2em]">
                        ETA: Q4 2026 • Windows / macOS / Linux
                    </p>
                </div>

            </motion.div>
        </div>
    );
}
