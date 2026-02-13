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

                // Configure Transparent Status Bar
                try {
                    await StatusBar.setStyle({ style: Style.Dark });
                    await StatusBar.setOverlaysWebView({ overlay: true });
                } catch (e) {
                    console.warn('StatusBar plugin not available or failed', e);
                }

                // Check onboarding status (checking both potential keys for safety, defaulting to hasCompletedOnboarding)
                const { value } = await Preferences.get({ key: "hasCompletedOnboarding" });
                // Fallback check for "onboarding_completed" if you want to support both or just migrate
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
        // Optional: Return a splash screen or null while checking
        return null;
    }

    // If native mobile, and onboarding NOT complete -> show Onboarding
    if (isMobile && !isOnboardingComplete) {
        return (
            <MobileOnboarding
                onComplete={() => setIsOnboardingComplete(true)}
            />
        );
    }

    // Otherwise check if children contains login/home structure
    // This wrapper just ensures onboarding is handled first.
    // We add padding-top to prevent the fixed navbar from overlapping content on non-home pages
    return (
        <div className={clsx("min-h-screen", pathname !== '/' && "pt-24")}>
            {children}
        </div>
    );
}
