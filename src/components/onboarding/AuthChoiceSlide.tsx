'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Ghost } from 'lucide-react';

interface AuthChoiceSlideProps {
    onLogin?: () => void;
    onSignup?: () => void;
}

const AuthChoiceSlide: React.FC<AuthChoiceSlideProps> = ({ onLogin, onSignup }) => {
    const router = useRouter();

    const handleSkip = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasCompletedOnboarding', 'true');
        }
        router.push('/dashboard');
    };

    const handleLogin = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasCompletedOnboarding', 'true');
        }

        if (onLogin) {
            onLogin();
        } else {
            router.push('/login');
        }
    }

    const handleSignup = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasCompletedOnboarding', 'true');
        }

        if (onSignup) {
            onSignup();
        } else {
            router.push('/signup');
        }
    }


    return (
        <div className="relative h-screen w-full bg-[#050505] text-white flex flex-col justify-between p-8">

            {/* Top Bar: Skip Button */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleSkip}
                    className="text-gray-500 text-sm font-medium hover:text-white transition-colors"
                >
                    Skip for now
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col items-center justify-center space-y-8">

                {/* Animated Icon/Graphic */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="w-40 h-40 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.3)] mb-4"
                >
                    <Ghost className="w-20 h-20 text-white" />
                </motion.div>

                <div className="text-center space-y-2 max-w-xs">
                    <h2 className="text-3xl font-bold tracking-tight">Join the Action</h2>
                    <p className="text-gray-400">Create an account to save your progress, host quizzes, and climb the global leaderboard.</p>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="w-full space-y-4 pb-8">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <Button
                        onClick={handleSignup}
                        className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border-none"
                    >
                        Sign Up
                    </Button>
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <Button
                        onClick={handleLogin}
                        variant="outline"
                        className="w-full h-14 text-lg font-bold border-2 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-600 rounded-xl bg-transparent"
                    >
                        Log In
                    </Button>
                </motion.div>
            </div>

        </div>
    );
};

export default AuthChoiceSlide;
