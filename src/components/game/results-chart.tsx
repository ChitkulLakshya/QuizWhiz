'use client';

import { Participant, Question } from '@/types/quiz';

interface ResultsChartProps {
    participants: Participant[];
    question: Question;
    questionIndex: number;
}

export function ResultsChart({ participants, question, questionIndex }: ResultsChartProps) {
    // 1. Aggregation: Count votes for each option
    const optionCounts = new Array(question.options.length).fill(0);

    participants.forEach(p => {
        const selectedIdx = p.answers[String(questionIndex)];
        if (typeof selectedIdx === 'number' && selectedIdx >= 0 && selectedIdx < optionCounts.length) {
            optionCounts[selectedIdx]++;
        }
    });

    // 2. Calculate total votes
    const totalVotes = optionCounts.reduce((sum, count) => sum + count, 0);

    // 3. Option labels with letters (A, B, C, D...)
    const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

    return (
        <div className="w-full space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
                Response Distribution ({totalVotes} vote{totalVotes !== 1 ? 's' : ''})
            </h3>

            {question.options.map((optionText, idx) => {
                const count = optionCounts[idx];
                const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                const isCorrect = idx === question.correctOptionIndex;

                return (
                    <div key={idx} className="space-y-1">
                        {/* Option Label and Text */}
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className={`
                  flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${isCorrect
                                        ? 'bg-green-500 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}
                `}>
                                    {optionLabels[idx] || idx + 1}
                                </span>
                                <span className={`truncate ${isCorrect ? 'font-semibold text-green-600 dark:text-green-400' : ''}`}>
                                    {optionText}
                                </span>
                            </div>
                            <span className="flex-shrink-0 ml-2 text-muted-foreground">
                                {count} ({percentage.toFixed(0)}%)
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="h-8 w-full bg-slate-100 dark:bg-slate-800 rounded-md overflow-hidden relative">
                            <div
                                className={`
                  h-full transition-all duration-500 ease-out rounded-md
                  ${isCorrect
                                        ? 'bg-gradient-to-r from-green-400 to-green-500'
                                        : count > 0
                                            ? 'bg-gradient-to-r from-red-300 to-red-400 dark:from-red-700 dark:to-red-600'
                                            : 'bg-slate-200 dark:bg-slate-700'}
                `}
                                style={{ width: `${Math.max(percentage, 0)}%` }}
                            />
                            {/* Inner count label for larger bars */}
                            {percentage > 20 && (
                                <span className="absolute inset-y-0 left-3 flex items-center text-white text-sm font-medium drop-shadow-sm">
                                    {count} vote{count !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-green-400 to-green-500"></div>
                    <span>Correct Answer</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-r from-red-300 to-red-400"></div>
                    <span>Incorrect</span>
                </div>
            </div>
        </div>
    );
}
