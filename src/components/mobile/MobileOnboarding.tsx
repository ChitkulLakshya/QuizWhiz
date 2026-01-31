"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { PushNotifications } from "@capacitor/push-notifications";
import { Camera } from "@capacitor/camera";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";
import { ArrowRight, Bell, Camera as CameraIcon, Check, Smartphone, Zap, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingProps {
    onComplete: () => void;
}

const steps = [
    {
        id: "welcome",
        title: "Welcome to QuizWhiz",
        description: "The ultimate cyberpunk quiz battleground in your pocket.",
        icon: <Smartphone className="w-16 h-16 text-[#ccff00]" />,
        color: "#ccff00",
    },
    {
        id: "realtime",
        title: "Real-Time Battles",
        description: "Compete instantly with synced questions and live leaderboards.",
        icon: <Zap className="w-16 h-16 text-cyan-400" />,
        color: "#22d3ee",
    },
    {
        id: "permissions",
        title: "Grant Access",
        description: "Enable features to get the full Operative experience.",
        icon: <Globe className="w-16 h-16 text-magenta-500" />, // Using Globe as placeholder for network/conn
        color: "#d946ef",
    },
];

export default function MobileOnboarding({ onComplete }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [permissions, setPermissions] = useState({
        notifications: false,
        camera: false,
    });

    const handleNext = async () => {
        Haptics.impact({ style: ImpactStyle.Light });

        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            await completeOnboarding();
        }
    };

    const completeOnboarding = async () => {
        await Preferences.set({
            key: "onboarding_completed",
            value: "true",
        });
        onComplete();
    };

    const requestNotifications = async () => {
        try {
            const result = await PushNotifications.requestPermissions();
            if (result.receive === "granted") {
                PushNotifications.register();
                setPermissions((prev) => ({ ...prev, notifications: true }));
                Haptics.notification({ type: NotificationType.Success });
            }
        } catch (error) {
            console.error("Push notification error", error);
        }
    };

    const requestCamera = async () => {
        try {
            const result = await Camera.requestPermissions();
            if (result.camera === "granted") {
                setPermissions((prev) => ({ ...prev, camera: true }));
                Haptics.notification({ type: NotificationType.Success });
            }
        } catch (error) {
            console.error("Camera permission error", error);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#050505] text-white flex flex-col items-center justify-between p-8 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#ccff00]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-purple-500/5 rounded-full blur-[100px]" />
            </div>

            {/* Progress Bar */}
            <div className="w-full flex gap-2 pt-8 z-10">
                {steps.map((_, idx) => (
                    <div
                        key={idx}
                        className={`h-1 flex-1 rounded-full transition-colors duration-300 ${idx <= currentStep ? "bg-[#ccff00]" : "bg-gray-800"
                            }`}
                    />
                ))}
            </div>

            {/* Content Carousel */}
            <div className="flex-1 flex flex-col items-center justify-center w-full z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center text-center space-y-6"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-current blur-2xl opacity-20" style={{ color: steps[currentStep].color }} />
                            {steps[currentStep].icon}
                        </div>

                        <h1 className="text-3xl font-black uppercase tracking-tighter">
                            {steps[currentStep].title}
                        </h1>

                        <p className="text-gray-400 font-mono text-sm max-w-xs">
                            {steps[currentStep].description}
                        </p>

                        {/* Permission Buttons (Only for last step) */}
                        {steps[currentStep].id === "permissions" && (
                            <div className="w-full space-y-3 pt-4">
                                <Button
                                    variant="outline"
                                    className={`w-full justify-between border-gray-800 hover:bg-gray-900 ${permissions.notifications ? "border-[#ccff00]/50 text-[#ccff00]" : ""
                                        }`}
                                    onClick={requestNotifications}
                                    disabled={permissions.notifications}
                                >
                                    <span className="flex items-center gap-2">
                                        <Bell className="w-4 h-4" /> Notifications
                                    </span>
                                    {permissions.notifications && <Check className="w-4 h-4" />}
                                </Button>

                                <Button
                                    variant="outline"
                                    className={`w-full justify-between border-gray-800 hover:bg-gray-900 ${permissions.camera ? "border-[#ccff00]/50 text-[#ccff00]" : ""
                                        }`}
                                    onClick={requestCamera}
                                    disabled={permissions.camera}
                                >
                                    <span className="flex items-center gap-2">
                                        <CameraIcon className="w-4 h-4" /> Camera Access
                                    </span>
                                    {permissions.camera && <Check className="w-4 h-4" />}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation */}
            <div className="w-full z-10 pb-8">
                <Button
                    className="w-full h-14 bg-[#ccff00] hover:bg-[#bbe000] text-black font-bold uppercase tracking-widest text-lg"
                    onClick={handleNext}
                >
                    {currentStep === steps.length - 1 ? "Start Mission" : "Next"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
