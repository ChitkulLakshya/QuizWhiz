"use client";

import { useEffect, useState } from "react";
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import MobileOnboarding from "./MobileOnboarding";

import { StatusBar, Style } from '@capacitor/status-bar';

export default function MobileWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isMobile, setIsMobile] = useState(false);
    const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPlatform = async () => {
            if (Capacitor.isNativePlatform()) {
                setIsMobile(true);
                try {
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setOverlaysWebView({ overlay: true });
                } catch (e) {
                    console.warn('StatusBar plugin not available or failed', e);
                }
                const { value } = await Preferences.get({ key: "hasCompletedOnboarding" });
                const { value: oldKey } = await Preferences.get({ key: "onboarding_completed" });

                if (value === "true" || oldKey === "true") {
                    setIsOnboardingComplete(true);
                }
            }
            setIsLoading(false);
        };

        checkPlatform();
    }, []);

    if (isLoading) {
        return null;
    }
    if (isMobile && !isOnboardingComplete) {
        return (
            <MobileOnboarding
                onComplete={() => setIsOnboardingComplete(true)}
            />
        );
    }
    return (
        <div className={clsx("min-h-screen", pathname !== '/' && "pt-24")}>
            {children}
        </div>
    );
}
