'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Shield, Monitor, Volume2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
            <div className="w-full max-w-md md:max-w-5xl mx-auto space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-12">

                {/* Header - Spans full width on mobile, left col on desktop */}
                <div className="md:col-span-12 flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#ccff00]/10 border border-[#ccff00]/20">
                        <Settings className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Settings</h1>
                        <p className="text-xs text-gray-500 font-mono">USER_ID: GUEST_01</p>
                    </div>
                </div>

                {/* Left Column (Desktop) */}
                <div className="md:col-span-7 space-y-8">
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
                </div>

                {/* Right Column (Desktop) */}
                <div className="md:col-span-5 space-y-8">
                    {/* Section: Application Download */}
                    <DownloadSection />

                    {/* Section: System */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">App Settings</h2>
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
        </div >
    );
}

function DownloadSection() {
    return (
        <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Get the Desktop App</h2>
            <div className="bg-[#0a0a0a] border border-[#222] p-6 text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-[#333]">
                        <Monitor className="w-8 h-8 text-[#ccff00]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        QuizWhiz for Windows
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                        Experience better performance and offline capabilities.
                    </p>
                </div>

                <div className="grid gap-3">
                    <Button asChild className="w-full bg-[#0078D7] hover:bg-[#0063b1] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(0,120,215,0.3)]">
                        <a href="/downloads/QuizWhiz-Setup.exe" download>
                            Download for Windows (.EXE)
                        </a>
                    </Button>
                    <Button asChild className="w-full bg-[#333] hover:bg-[#444] text-white font-bold h-12 uppercase tracking-widest border border-[#555]">
                        <a href="/downloads/QuizWhiz-mac.dmg" download>
                            Download for macOS (.DMG)
                        </a>
                    </Button>
                    <Button asChild className="w-full bg-[#E95420] hover:bg-[#c74418] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(233,84,32,0.3)]">
                        <a href="/downloads/QuizWhiz-linux.AppImage" download>
                            Download for Linux (.AppImage)
                        </a>
                    </Button>
                    <p className="text-[10px] text-gray-600 font-mono uppercase">
                        Current Version: 1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}
