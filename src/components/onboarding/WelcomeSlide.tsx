'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeSlideProps {
    onGetStarted?: () => void;
}

const WelcomeSlide: React.FC<WelcomeSlideProps> = ({ onGetStarted }) => {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white flex flex-col items-center justify-center p-6">
            {/* Animated Gradient Background */}
            <motion.div
                className="absolute inset-0 z-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900"
                initial={{ backgroundSize: '200% 200%', backgroundPosition: '0% 0%' }}
                animate={{
                    backgroundPosition: ['0% 0%', '100% 100%', '0% 100%', '0% 0%'],
                }}
                transition={{
                    duration: 15,
                    ease: 'linear',
                    repeat: Infinity,
                }}
            />

            {/* Decorative Overlay Pattern */}
            <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none" />

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-12 max-w-md w-full text-center">

                {/* Floating Icon */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="p-6 bg-white/10 backdrop-blur-lg rounded-3xl border border-white/20 shadow-2xl"
                    >
                        <Rocket className="w-16 h-16 text-yellow-300 drop-shadow-[0_0_15px_rgba(253,224,71,0.5)]" />
                    </motion.div>
                </motion.div>

                {/* Title */}
                <div className="space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
                        className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-indigo-400 drop-shadow-sm"
                    >
                        Welcome to <br />
                        <span className="text-5xl md:text-6xl text-white">QuizWhiz</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="text-lg text-indigo-200 font-medium"
                    >
                        The ultimate realtime quiz platform.
                    </motion.p>
                </div>

                {/* Action Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="w-full"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    >
                        <Button
                            onClick={onGetStarted}
                            size="lg"
                            className="w-full h-14 text-lg font-bold bg-white text-indigo-900 hover:bg-indigo-50 hover:text-indigo-950 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.3)] border-none"
                        >
                            Get Started
                        </Button>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default WelcomeSlide;
