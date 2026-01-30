'use client';

import { Question, Participant } from '@/types/quiz';
import clsx from 'clsx';
import { CheckCircle, AlertOctagon, Activity, Users, HelpCircle } from 'lucide-react';

interface QuestionViewProps {
    question: Question;
    questionIndex: number;
    totalQuestions: number;
    timeRemaining: number;
    currentParticipant: Participant | null;
    selectedAnswer: string | null;
    isAnswerSubmitted: boolean;
    onAnswerSubmit: (option: string, index: number) => void;
    streak?: number;
    totalParticipants?: number;
}

export function QuestionView({
    question,
    questionIndex,
    totalQuestions,
    timeRemaining,
    currentParticipant,
    selectedAnswer,
    isAnswerSubmitted,
    onAnswerSubmit,
    streak = 0,
    totalParticipants = 0
}: QuestionViewProps) {

    const progress = (timeRemaining / question.timeLimit) * 100;

    return (
        <div className="relative flex-1 flex flex-col w-full max-w-md mx-auto bg-[#050505] overflow-hidden min-h-[calc(100vh-80px)] md:min-h-screen pt-16 md:pt-0 font-display">

            {/* Background Noise & Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
            <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
                backgroundSize: '100% 4px'
            }}></div>

            {/* Top Hard-Edged Progress Bar (Health Bar Style) */}
            <div className="w-full bg-[#1a1a1a] h-[10px] flex-none relative z-20 top-0">
                <div
                    className={clsx(
                        "h-full shadow-[0_0_15px_rgba(204,255,0,0.5)] transition-all duration-100 ease-linear",
                        timeRemaining < 5 ? "bg-red-500 shadow-[0_0_15px_rgba(255,0,0,0.5)] animate-pulse" : "bg-[#ccff00]"
                    )}
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            {/* Debug Data Header */}
            <div className="flex justify-between items-start pt-4 px-6 pb-2 z-10 font-mono text-xs tracking-widest text-white/50 uppercase">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-[#ccff00]/60">SYSTEM.Q_INDEX_{questionIndex + 1}</span>
                    <span className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-[#ccff00]" />
                        STREAK: {streak}
                    </span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-[10px] text-[#ccff00]/60">NET.UPLINK_STABLE</span>
                    <span className="flex items-center gap-2 justify-end">
                        AGENTS: {totalParticipants}
                        <Users className="w-3 h-3 text-[#ccff00]" />
                    </span>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col justify-center px-6 relative z-10 pb-12 mt-4 space-y-8">

                {/* Question Block (Glitch Container) */}
                <div className="relative group animate-in zoom-in duration-300">
                    <div className="absolute -inset-0.5 bg-[#ccff00] opacity-20 blur group-hover:opacity-30 transition-opacity"></div>

                    <div className="bg-[#0a0a0a] border border-[#ccff00]/50 p-6 relative overflow-hidden shadow-[0_0_30px_rgba(204,255,0,0.1)]">
                        {/* Corner Decors */}
                        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#ccff00]"></div>
                        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#ccff00]"></div>
                        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#ccff00]"></div>
                        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#ccff00]"></div>

                        <div className="absolute -right-4 -top-4 opacity-5 rotate-12">
                            <HelpCircle className="w-24 h-24 text-[#ccff00]" />
                        </div>

                        <h1 className="text-2xl md:text-3xl font-black text-white font-archivo break-words relative z-10 uppercase tracking-tight leading-[0.95] drop-shadow-md">
                            {question.questionText}
                        </h1>

                        <div className="mt-4 flex items-center gap-2 text-[#ccff00]/60 text-xs font-mono tracking-widest uppercase">
                            <AlertOctagon className="w-3 h-3 animate-pulse" />
                            <span>INPUT_REQUIRED</span>
                        </div>
                    </div>
                </div>

                {/* Answer Options Stack */}
                <div className="flex flex-col gap-4 w-full">
                    {question.options.map((option, idx) => {
                        const isSelected = selectedAnswer === option;
                        // const isOffset = idx % 2 !== 0; // Removed offset for stricter cleaner look matching Results

                        return (
                            <button
                                key={idx}
                                onClick={() => onAnswerSubmit(option, idx)}
                                disabled={isAnswerSubmitted || !currentParticipant}
                                className="group relative w-full text-left transition-all duration-150 focus:outline-none"
                            >
                                {/* Button Body */}
                                <div className={clsx(
                                    "relative flex items-center w-full min-h-[56px] px-4 py-3 border transition-all duration-200 group-hover:translate-x-1",
                                    isSelected
                                        ? "bg-[#ccff00] border-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.4)]"
                                        : "bg-[#0a0a0a] border-[#333] text-white hover:border-[#ccff00] hover:bg-[#111]"
                                )}>
                                    {/* Index Box */}
                                    <div className={clsx(
                                        "w-8 h-8 flex items-center justify-center font-mono text-sm font-bold border mr-4 flex-shrink-0",
                                        isSelected ? "border-black text-black" : "border-[#333] text-gray-500 group-hover:border-[#ccff00] group-hover:text-[#ccff00]"
                                    )}>
                                        {String.fromCharCode(65 + idx)}
                                    </div>

                                    <span className={clsx(
                                        "text-lg font-bold tracking-tight break-words w-full pr-2 leading-tight font-archivo uppercase",
                                        isSelected ? "text-black" : "text-gray-200 group-hover:text-white"
                                    )}>
                                        {option}
                                    </span>

                                    {isSelected && <CheckCircle className="w-5 h-5 ml-auto flex-shrink-0 animate-pulse text-black" />}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Bottom HUD Decor */}
                <div className="flex justify-between items-end opacity-30 px-4">
                    <div className="h-8 w-8 border-l border-b border-white"></div>
                    <div className="text-[10px] font-mono tracking-[0.5em] text-white/50 animate-pulse">
                        AWAITING_INPUT_STREAM
                    </div>
                    <div className="h-8 w-8 border-r border-b border-white"></div>
                </div>

            </div>
        </div>
    );
}
