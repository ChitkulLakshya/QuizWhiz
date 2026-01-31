'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeatureSlideProps {
    title: string;
    description: string;
    icon: LucideIcon;
    onNext?: () => void;
}

const FeatureSlide: React.FC<FeatureSlideProps> = ({ title, description, icon: Icon, onNext }) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2, // Stagger effect for children
            },
        },
    };

    const iconVariants = {
        hidden: { opacity: 0, scale: 0, rotate: -45 },
        visible: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: {
                type: 'spring',
                stiffness: 260,
                damping: 20
            }
        },
    };

    const textVariants = {
        hidden: { opacity: 0, x: 50 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 10
            }
        },
    };

    return (
        <div className="relative h-screen w-full bg-black text-white flex flex-col items-center justify-center p-8 overflow-hidden">
            {/* Background Decor */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
            <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="z-10 flex flex-col items-center text-center space-y-8 max-w-md"
            >
                {/* Icon */}
                <motion.div variants={iconVariants}>
                    <div className="p-8 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full border border-indigo-500/30 backdrop-blur-sm shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                        <Icon className="w-20 h-20 text-indigo-400" />
                    </div>
                </motion.div>

                {/* Text Content */}
                <div className="space-y-4">
                    <motion.h2 variants={textVariants} className="text-3xl md:text-4xl font-bold tracking-tight">
                        {title}
                    </motion.h2>
                    <motion.p variants={textVariants} className="text-gray-400 text-lg">
                        {description}
                    </motion.p>
                </div>
            </motion.div>

            {/* Next Button Positioned at Bottom Right */}
            <motion.div
                className="absolute bottom-8 right-8 z-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8 }}
            >
                <Button
                    onClick={onNext}
                    size="icon"
                    className="rounded-full w-14 h-14 bg-white text-black hover:bg-indigo-50 hover:text-indigo-900 shadow-lg"
                >
                    <ArrowRight className="w-6 h-6" />
                </Button>
            </motion.div>
        </div>
    );
};

export default FeatureSlide;
