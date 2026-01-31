'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Shield, Monitor, Volume2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
            <div className="max-w-md mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#ccff00]/10 border border-[#ccff00]/20">
                        <Settings className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">System Config</h1>
                        <p className="text-xs text-gray-500 font-mono">USER_ID: GUEST_01</p>
                    </div>
                </div>

                {/* Section: Profile */}
                <div className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">UserProfile</h2>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#222] flex items-center justify-center">
                                    <User className="w-5 h-5 text-gray-400" />
                                </div>
                                <div>
                                    <p className="font-bold uppercase text-sm">Guest User</p>
                                    <p className="text-xs text-gray-600">Sync Disabled</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase border-[#333] hover:border-[#ccff00] hover:text-[#ccff00]">
                                Edit
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Section: Preferences */}
                <div className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Preferences</h2>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Volume2 className="w-4 h-4 text-gray-400" />
                                <Label htmlFor="sfx" className="uppercase text-xs font-bold">Sound Effects</Label>
                            </div>
                            <Switch id="sfx" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Monitor className="w-4 h-4 text-gray-400" />
                                <Label htmlFor="haptics" className="uppercase text-xs font-bold">Haptic Feedback</Label>
                            </div>
                            <Switch id="haptics" defaultChecked />
                        </div>
                    </div>
                </div>

                {/* Section: Application Download */}
                <DownloadSection />

                {/* Section: System */}
                <div className="space-y-4">
                    <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">System</h2>
                    <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-2">
                        <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 uppercase text-xs font-bold tracking-wider h-12">
                            <LogOut className="w-4 h-4 mr-3" />
                            Disconnect Session
                        </Button>
                        <div className="pt-2 border-t border-[#222] text-center">
                            <p className="text-[10px] text-gray-700 font-mono">VERSION: 2.1.0_PROD</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DownloadSection() {
    const [os, setOs] = useState<'win' | 'mac' | 'linux' | 'mobile' | 'unknown'>('unknown');

    useEffect(() => {
        const ua = navigator.userAgent.toLowerCase();
        const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);

        if (isMobile) {
            setOs('mobile');
        } else if (ua.indexOf('win') > -1) {
            setOs('win');
        } else if (ua.indexOf('mac') > -1) {
            setOs('mac');
        } else if (ua.indexOf('linux') > -1) {
            setOs('linux');
        } else {
            setOs('win'); // Default to windows
        }
    }, []);

    if (os === 'unknown') return null;

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Get the App</h2>
            <div className="bg-[#0a0a0a] border border-[#222] p-6 text-center space-y-6">

                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-[#333]">
                        <Monitor className="w-8 h-8 text-[#ccff00]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white" id="platform-title">
                        {os === 'mobile' ? 'Desktop Only' : `Download for ${os === 'win' ? 'Windows' : os === 'mac' ? 'Mac' : 'Linux'}`}
                    </h3>
                    {os === 'mobile' && (
                        <p className="text-sm text-gray-500 font-mono">
                            Our physical desktop app is available for Laptop and Desktop computers only. <br />
                            Please open this link on your computer to download.
                        </p>
                    )}
                </div>

                {os === 'win' && (
                    <Button asChild className="w-full bg-[#0078D7] hover:bg-[#0063b1] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(0,120,215,0.3)]">
                        <a href="YOUR_EXE_LINK_HERE">Download .EXE</a>
                    </Button>
                )}

                {os === 'mac' && (
                    <Button asChild className="w-full bg-[#333] hover:bg-[#444] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        <a href="YOUR_DMG_LINK_HERE">Download .DMG</a>
                    </Button>
                )}

                {os === 'linux' && (
                    <Button asChild className="w-full bg-[#E95420] hover:bg-[#d04b1c] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(233,84,32,0.3)]">
                        <a href="YOUR_DEB_LINK_HERE">Download .DEB</a>
                    </Button>
                )}
            </div>
        </div>
    );
}
