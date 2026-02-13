'use client';

import { Participant, Question } from '@/types/quiz';
import clsx from 'clsx';

interface ResultsChartProps {
    participants: Participant[];
    question: Question;
    questionIndex: number;
}

export function ResultsChart({ participants, question, questionIndex }: ResultsChartProps) {
    const optionCounts = new Array(question.options.length).fill(0);

    participants.forEach(p => {
        const selectedIdx = p.answers[String(questionIndex)];
        if (typeof selectedIdx === 'number' && selectedIdx >= 0 && selectedIdx < optionCounts.length) {
            optionCounts[selectedIdx]++;
        }
    });
    const totalVotes = optionCounts.reduce((sum, count) => sum + count, 0);
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="w-full space-y-4">
            {question.options.map((optionText, idx) => {
                const count = optionCounts[idx];
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isCorrect = idx === question.correctOptionIndex;

                return (
                    <div key={idx} className="space-y-1 group">
                        {/* Option Label and Text */}
                        <div className="flex items-center justify-between text-xs font-mono">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={clsx(
                                    "flex-shrink-0 w-5 h-5 flex items-center justify-center font-bold border border-current",
                                    isCorrect ? "text-[#ccff00] border-[#ccff00]" : "text-gray-500 border-gray-700"
                                )}>
                                    {optionLabels[idx] || idx + 1}
                                </span>
                                <span className={clsx(
                                    "truncate font-bold tracking-tight",
                                    isCorrect ? "text-[#ccff00]" : "text-gray-400"
                                )}>
                                    {optionText}
                                </span>
                            </div>
                            <span className={clsx(
                                "flex-shrink-0 ml-2 tracking-widest",
                                isCorrect ? "text-[#ccff00]" : "text-gray-600"
                            )}>
                                {count} <span className="text-[10px] opacity-50">AGENTS</span>
                            </span>
                        </div>

                        {/* Progress Bar Container */}
                        <div className="h-4 w-full bg-[#050505] border border-[#222] relative overflow-hidden">
                            {/* Grid pattern in background of bar */}
                            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '10px 100%' }}></div>

                            <div
                                className={clsx(
                                    "h-full transition-all duration-700 ease-out relative",
                                    isCorrect
                                        ? "bg-[#ccff00] shadow-[0_0_10px_rgba(204,255,0,0.5)]"
                                        : "bg-[#b00b69] opacity-50"
                                )}
                                style={{ width: `${Math.max(percentage, 0)}%` }}
                            >
                                {/* Glitch line on the bar */}
                                <div className="absolute top-0 right-0 w-1 h-full bg-white mix-blend-overlay opacity-50"></div>
                            </div>

                            {/* Percentage Label inside or outside */}
                            <div className="absolute top-0 right-1 h-full flex items-center">
                                <span className="text-[8px] font-mono text-gray-500">{percentage.toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
