'use client';

import { motion } from 'framer-motion';
import { Brain, Trophy, Users, Zap } from 'lucide-react';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
};

export const BentoFeatures = () => {
    return (
        <section className="py-32 px-6 relative z-10 w-full max-w-7xl mx-auto">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={containerVariants}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]"
            >
                {/* Header */}
                <div className="md:col-span-3 mb-10 text-center md:text-left">
                    <span className="text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4 block font-bold">Why QuizWhiz</span>
                    <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
                        Next-Gen<br />Trivia Experience
                    </h2>
                </div>

                {/* Feature 1: AI (Large, spans 2 cols) */}
                <motion.div
                    variants={itemVariants}
                    className="group relative md:col-span-2 row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:border-primary/50 transition-colors duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold uppercase tracking-wide mb-2">AI-Powered Generation</h3>
                            <p className="text-muted-foreground text-lg max-w-md">
                                Instantly generate quizzes on any topic. From "Quantum Physics" to "90s Pop Music", our AI crafts unique questions in seconds.
                            </p>
                        </div>
                    </div>
                    {/* Decorative visual */}
                    <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
                </motion.div>

                {/* Feature 2: Real-time (Tall on mobile, square on desktop) */}
                <motion.div
                    variants={itemVariants}
                    className="group relative md:col-span-1 row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:border-blue-500/50 transition-colors duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">Live Multiplayer</h3>
                            <p className="text-muted-foreground">
                                Compete with friends in real-time. Sync leads to zero lag.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 3: Leaderboards (Tall) */}
                <motion.div
                    variants={itemVariants}
                    className="group relative md:col-span-1 row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:border-yellow-500/50 transition-colors duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-4">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold uppercase tracking-wide mb-2">Global Ranks</h3>
                            <p className="text-muted-foreground">
                                Climb the weekly leaderboards and earn badges.
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Feature 4: Performance (Wide) */}
                <motion.div
                    variants={itemVariants}
                    className="group relative md:col-span-2 row-span-1 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/50 p-8 hover:border-purple-500/50 transition-colors duration-500"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 h-full flex flex-col justify-between">
                        <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 mb-4">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-3xl font-bold uppercase tracking-wide mb-2">Lightning Fast</h3>
                                <p className="text-muted-foreground text-lg max-w-sm">
                                    Built on the edge for <span className="text-white font-bold">sub-millisecond</span> latency.
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <div className="font-mono text-xs text-muted-foreground/50 text-right">
                                    <div>LATENCY: 12ms</div>
                                    <div>UPTIME: 99.9%</div>
                                    <div>REGION: GLOBAL</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </motion.div>
        </section>
    );
};
