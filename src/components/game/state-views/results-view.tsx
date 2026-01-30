'use client';

import { Question, Participant, Quiz } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Trophy, BarChart2, AlertCircle } from 'lucide-react';
import { ResultsChart } from '@/components/game/results-chart';
import { Podium } from '@/components/game/podium';
import { Badge } from '@/components/ui/badge';
import clsx from 'clsx';
import { useMemo } from 'react';

interface ResultsViewProps {
    quiz: Quiz;
    question: Question | null;
    participants: Participant[];
    currentParticipant: Participant | null;
    isHost: boolean;
    onRestart: () => void;
    isFinalResult: boolean;
}

export function ResultsView({
    quiz,
    question,
    participants,
    currentParticipant,
    isHost,
    onRestart,
    isFinalResult
}: ResultsViewProps) {

    // If match is over/completed, show Podium
    if (isFinalResult || quiz.status === 'completed') {
        return <Podium participants={participants} isHost={isHost} onRestart={onRestart} />;
    }

    if (!question) return null;

    const correctOption = question.options[question.correctOptionIndex];

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] w-full max-w-md mx-auto bg-[#050505] font-display text-white relative overflow-hidden pt-16 md:pt-6">

            {/* Background Noise & Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
                backgroundSize: '100% 4px'
            }}></div>

            {/* Top Label */}
            <div className="relative z-10 w-full flex justify-center mb-8">
                <div className="bg-[#b00b69] text-white px-4 py-1 text-sm font-mono tracking-widest uppercase transform -skew-x-12 border border-white/20 shadow-[0_0_15px_rgba(176,11,105,0.6)]">
                    SESSION_PAUSED
                </div>
            </div>

            <div className="text-center w-full space-y-8 relative z-10 px-6">

                {/* Correct Answer Reveal */}
                <div className="animate-in zoom-in duration-500">
                    <h2 className="text-[#ccff00] text-xs font-mono uppercase tracking-[0.3em] mb-4 drop-shadow-md">CORRECT_PATTERN_DETECTED</h2>

                    <div className="relative group">
                        {/* Glitch Borders */}
                        <div className="absolute -inset-1 bg-[#ccff00] opacity-20 blur group-hover:opacity-40 transition-opacity skew-x-2"></div>

                        <div className="bg-[#0a0a0a] border-2 border-[#ccff00] p-8 relative overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                            {/* Corner Decors */}
                            <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-[#ccff00]"></div>
                            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-[#ccff00]"></div>

                            <div className="absolute -right-8 -top-8 opacity-10 rotate-12">
                                <CheckCircle className="w-32 h-32 text-[#ccff00]" />
                            </div>

                            <h3 className="text-3xl md:text-5xl font-black text-white font-archivo break-words relative z-10 uppercase tracking-tight leading-[0.9]">
                                {correctOption}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Host Chart (Data Breach Style) */}
                {isHost && (
                    <div className="w-full bg-[#111] border border-[#333] p-4 mt-8 relative overflow-hidden">
                        <div className="flex items-center justify-between mb-4 border-b border-[#333] pb-2">
                            <h4 className="text-xs text-[#b00b69] font-mono font-bold tracking-widest flex items-center gap-2">
                                <BarChart2 className="w-3 h-3" /> ANALYTICS_DATA
                            </h4>
                            <span className="text-[10px] text-gray-600 font-mono">{participants.length} DATA_POINTS</span>
                        </div>

                        <ResultsChart
                            participants={participants}
                            question={question}
                            questionIndex={quiz.currentQuestionIndex}
                        />
                    </div>
                )}

                {/* Player Stats */}
                {!isHost && currentParticipant && (
                    <div className="grid grid-cols-2 gap-4 mt-8 w-full animate-in slide-in-from-bottom-5 duration-700">
                        <div className="bg-[#111] border border-[#333] p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-[#ccff00]/30 transition-colors">
                            <div className="absolute inset-0 bg-[#ccff00]/5 skew-y-12 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                            <span className="text-xs text-gray-500 font-mono tracking-widest uppercase z-10">Total Score</span>
                            <span className="text-4xl font-black text-[#ccff00] font-archivo z-10">{currentParticipant.totalScore}</span>
                        </div>
                        <div className="bg-[#111] border border-[#333] p-4 flex flex-col items-center justify-center gap-2 relative overflow-hidden group hover:border-white/30 transition-colors">
                            <span className="text-xs text-gray-500 font-mono tracking-widest uppercase z-10">Current Rank</span>
                            <div className="flex items-baseline gap-1 z-10">
                                <span className="text-2xl font-black text-white font-archivo">#</span>
                                <span className="text-4xl font-black text-white font-archivo">
                                    {participants.sort((a, b) => b.totalScore - a.totalScore).findIndex(p => p.id === currentParticipant.id) + 1}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 w-full text-center">
                <p className="text-[10px] text-gray-600 font-mono tracking-widest uppercase animate-pulse">
                    {isHost ? "AWAITING_COMMAND..." : "ESTABLISHING_UPLINK..."}
                </p>
            </div>
        </div>
    );
}
