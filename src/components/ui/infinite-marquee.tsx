'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InfiniteMarqueeProps {
    items: string[];
    direction?: 'left' | 'right';
    speed?: number;
    className?: string;
}

export const InfiniteMarquee = ({ items, direction = 'left', speed = 30, className }: InfiniteMarqueeProps) => {
    const content = [...items, ...items, ...items]; // Triple for safety in large screens

    return (
        <div className={cn("relative flex overflow-hidden w-full select-none gap-4", className)}>
            {/* Gradient Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-r from-background to-transparent pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 z-10 bg-gradient-to-l from-background to-transparent pointer-events-none" />

            <motion.div
                className="flex min-w-full shrink-0 gap-4 py-4 items-center"
                animate={{
                    x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
            >
                {content.map((item, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 px-8 py-4 bg-secondary/30 border border-white/5 rounded-full backdrop-blur-sm text-sm font-mono uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                    >
                        {item}
                    </div>
                ))}
            </motion.div>
            <motion.div
                className="flex min-w-full shrink-0 gap-4 py-4 items-center"
                animate={{
                    x: direction === 'left' ? ['0%', '-33.33%'] : ['-33.33%', '0%'],
                }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: speed,
                }}
                aria-hidden="true"
            >
                {content.map((item, i) => (
                    <div
                        key={i}
                        className="flex-shrink-0 px-8 py-4 bg-secondary/30 border border-white/5 rounded-full backdrop-blur-sm text-sm font-mono uppercase tracking-widest hover:bg-primary/20 hover:border-primary/30 hover:text-primary transition-colors cursor-default"
                    >
                        {item}
                    </div>
                ))}
            </motion.div>
        </div>
    );
};
