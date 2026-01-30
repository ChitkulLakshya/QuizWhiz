'use client';

import { Participant } from '@/types/quiz';
import clsx from 'clsx';
import { ArrowLeft, Share2, BarChart2, Crown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PodiumProps {
    participants: Participant[];
    isHost: boolean;
    onRestart: () => void;
}

export function Podium({ participants, isHost, onRestart }: PodiumProps) {
    // Sort logic
    const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
    const [winner, second, third] = sorted;

    return (
        <div className="bg-[#050505] font-display text-white min-h-screen w-full relative selection:bg-[#ccff00] selection:text-black overflow-hidden flex flex-col pt-16 md:pt-0">

            {/* Background Noise & Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
                backgroundSize: '100% 4px'
            }}></div>

            {/* Massive Crown Watermark */}
            <div className="fixed -right-24 top-[10%] pointer-events-none z-0 opacity-[0.03] rotate-12">
                <Crown strokeWidth={0.5} className="w-[600px] h-[600px] text-white" />
            </div>

            <div className="relative z-10 flex flex-col h-full w-full max-w-md mx-auto flex-1">

                {/* Header Badge */}
                <div className="flex justify-center pt-8 pb-4">
                    <div className="bg-[#b00b69] text-white px-4 py-1 text-sm font-mono tracking-widest uppercase transform -skew-x-12 border border-white/20 shadow-[0_0_15px_rgba(176,11,105,0.6)]">
                        SESSION_TERMINATED
                    </div>
                </div>

                <div className="w-full h-[20px] mb-8"></div> {/* Spacer similar to progress bar in HUD */}

                <main className={`flex-1 flex flex-col justify-end px-6 overflow-y-auto scrollbar-hide ${isHost ? 'pb-32' : 'pb-6'}`}>

                    {/* Performance Metrics (Visual Equalizer) */}
                    <div className="mt-4 mb-8 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-2 mb-3 px-1">
                            <BarChart2 className="text-[#b00b69] w-4 h-4" />
                            <p className="text-white/70 text-xs font-mono font-bold tracking-widest uppercase">Performance Metrics</p>
                        </div>
                        <div className="flex items-end justify-between h-16 gap-3 px-2 bg-[#0a0a0a] p-2 border border-[#222]">
                            {[0.4, 0.8, 0.3, 0.6].map((h, i) => (
                                <div key={i} className="flex-1 h-full flex items-end overflow-hidden relative group">
                                    <div className="absolute bottom-0 w-full bg-[#ccff00] opacity-20 h-full"></div>
                                    <div style={{ height: `${h * 100}%` }} className="w-full bg-[#ccff00] shadow-[0_0_8px_rgba(204,255,0,0.5)] relative z-10"></div>
                                </div>
                            ))}
                        </div>
                    </div>


                    {/* PODIUM SECTION */}
                    <div className="flex-1 flex flex-col justify-end relative mt-2">

                        {/* Winner Score - Big and Glitchy */}
                        <div className="absolute top-0 left-0 right-0 z-30 flex justify-center pointer-events-none mix-blend-hard-light -translate-y-12">
                            <h2 className="text-[6rem] leading-none font-black text-[#ccff00] transform -rotate-6 drop-shadow-[4px_4px_0_rgba(176,11,105,1)] font-archivo">
                                {winner?.totalScore ?? 0}
                            </h2>
                        </div>

                        {/* Winner Badge */}
                        <div className="absolute top-[28%] right-4 z-30 transform rotate-12 animate-pulse">
                            <div className="bg-[#b00b69] text-white text-xs font-bold px-3 py-1 uppercase tracking-widest shadow-lg -rotate-12 border border-white">
                                WINNER
                            </div>
                        </div>

                        {/* Podium Structure */}
                        <div className="flex items-end justify-center w-full gap-2 mb-8">

                            {/* Rank 2 */}
                            <div className="flex-1 flex flex-col items-center">
                                {second && (
                                    <div className="mb-2 flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 rounded-sm border border-[#b00b69] bg-[#222] flex items-center justify-center font-bold text-white text-lg font-mono">
                                            {second.name.charAt(0)}
                                        </div>
                                        <span className="text-white font-bold uppercase text-xs tracking-tight truncate max-w-[80px] font-mono">{second.name}</span>
                                    </div>
                                )}
                                <div className="w-full h-32 border border-[#b00b69] bg-black/80 relative group"
                                    style={{ clipPath: 'polygon(0 5%, 100% 0, 100% 100%, 0% 100%)' }}>

                                    <div className="absolute inset-0 bg-[#b00b69] opacity-10"></div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#b00b69] font-black text-4xl opacity-50 font-archivo">2</div>
                                </div>
                            </div>

                            {/* Rank 1 */}
                            <div className="flex-1 flex flex-col items-center z-10 -mx-1 mb-[-4px]">
                                {winner && (
                                    <div className="mb-4 flex flex-col items-center gap-1 transform">
                                        <div className="relative">
                                            <Crown className="absolute -top-8 left-1/2 -translate-x-1/2 text-[#ccff00] w-10 h-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] animate-bounce" />
                                            <div className="w-16 h-16 rounded-sm border-2 border-[#ccff00] bg-[#222] shadow-[0_0_20px_rgba(204,255,0,0.4)] flex items-center justify-center font-black text-2xl text-[#ccff00] font-mono">
                                                {winner.name.charAt(0)}
                                            </div>
                                        </div>
                                        <span className="text-[#ccff00] font-black uppercase text-sm tracking-tight bg-black px-2 mt-2 font-mono truncate max-w-[100px]">{winner.name}</span>
                                    </div>
                                )}
                                <div className="w-full h-48 bg-[#ccff00] relative shadow-[0_0_30px_rgba(204,255,0,0.2)] flex flex-col justify-end pb-4"
                                    style={{ clipPath: 'polygon(0 0, 100% 10%, 100% 100%, 0% 100%)' }}>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-black font-black text-6xl opacity-20 font-archivo">1</div>
                                    <div className="w-full flex justify-center">
                                        <Crown className="text-black/20 w-8 h-8" />
                                    </div>
                                </div>
                            </div>

                            {/* Rank 3 */}
                            <div className="flex-1 flex flex-col items-center">
                                {third && (
                                    <div className="mb-2 flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 rounded-sm border border-[#b00b69] bg-[#222] flex items-center justify-center font-bold text-white text-lg font-mono">
                                            {third.name.charAt(0)}
                                        </div>
                                        <span className="text-white font-bold uppercase text-xs tracking-tight truncate max-w-[80px] font-mono">{third.name}</span>
                                    </div>
                                )}
                                <div className="w-full h-24 border border-[#b00b69] bg-black/80 relative"
                                    style={{ clipPath: 'polygon(0 15%, 100% 0, 100% 100%, 0% 100%)' }}>
                                    <div className="absolute inset-0 bg-[#b00b69] opacity-10"></div>
                                    <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[#b00b69] font-black text-4xl opacity-50 font-archivo">3</div>
                                </div>
                            </div>

                        </div>

                        {/* Remainder List */}
                        {sorted.length > 3 && (
                            <div className="bg-[#111] border border-[#222] max-h-32 overflow-y-auto mb-6 custom-scrollbar">
                                {sorted.slice(3).map((p, i) => (
                                    <div key={p.id} className="flex justify-between items-center p-3 border-b border-[#222] last:border-0 hover:bg-[#1a1a1a]">
                                        <span className="text-gray-600 font-mono text-xs w-6">#{i + 4}</span>
                                        <span className="text-gray-300 font-bold text-sm truncate flex-1 px-2 font-mono">{p.name}</span>
                                        <span className="text-[#ccff00] font-mono text-xs">{p.totalScore}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>

                    {/* Footer Action */}
                    {isHost && (
                        <div className="mt-4 mb-4">
                            <button
                                onClick={onRestart}
                                className="group relative w-full h-14 bg-[#ccff00] flex items-center justify-center transform hover:scale-[1.02] active:scale-[0.98] transition-all focus:outline-none"
                            >
                                {/* Button Decor - Angular Corners */}
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[10px] border-r-[10px] border-t-black border-r-transparent"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[10px] border-l-[10px] border-b-black border-l-transparent"></div>

                                <span className="relative z-10 text-black text-lg font-black tracking-widest uppercase flex items-center gap-2 font-archivo">
                                    PLAY AGAIN / REBOOT
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-rotate-ccw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12" /><path d="M3 3v9h9" /></svg>
                                </span>

                                {/* Glitch hover effect overlay */}
                                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity mix-blend-overlay"></div>
                            </button>
                        </div>
                    )}

                    {!isHost && (
                        <div className="mt-4 mb-4 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#333]">
                                <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
                                <p className="text-white/40 font-mono text-xs uppercase tracking-widest">
                                    SERVER_STANDBY_MODE
                                </p>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
