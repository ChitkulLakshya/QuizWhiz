'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Bot } from 'lucide-react';

import WelcomeSlide from './WelcomeSlide';
import FeatureSlide from './FeatureSlide';
import PermissionsSlide from './PermissionsSlide';
import AuthChoiceSlide from './AuthChoiceSlide';

const OnboardingFlow = () => {
    const [currentStep, setCurrentStep] = useState(0);

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const steps = [
        <WelcomeSlide key="welcome" onGetStarted={nextStep} />,
        <FeatureSlide
            key="feature-1"
            title="Real-time Quizzes"
            description="Compete with friends instantly in high-speed battles."
            icon={Zap}
            onNext={nextStep}
        />,
        <FeatureSlide
            key="feature-2"
            title="AI Generation"
            description="Generate comprehensive quizzes in seconds using Gemini AI."
            icon={Bot}
            onNext={nextStep}
        />,
        <PermissionsSlide key="permissions" onComplete={nextStep} />,
        <AuthChoiceSlide key="auth" />
    ];
    const slideVariants = {
        enter: {
            x: 1000,
            opacity: 0
        },
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1
        },
        exit: {
            zIndex: 0,
            x: -1000,
            opacity: 0
        }
    };

    return (
        <div className="relative h-screen w-full bg-black overflow-hidden">

            {/* Main Slide Area */}
            <AnimatePresence initial={false} mode='wait'>
                <motion.div
                    key={currentStep}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                    className="absolute inset-0 w-full h-full"
                >
                    {steps[currentStep]}
                </motion.div>
            </AnimatePresence>

            {/* Step Indicator (Dots) - Hide on Auth Screen if desired, but keeping generally visible helps consistency */}
            {currentStep < steps.length - 1 && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-50">
                    {steps.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentStep
                                    ? 'w-8 bg-indigo-500'
                                    : 'w-2 bg-gray-700'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OnboardingFlow;
