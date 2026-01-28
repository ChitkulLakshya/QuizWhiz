'use client';

import Confetti from 'react-confetti';
import { Participant } from '@/types/quiz';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, RefreshCcw, Medal } from 'lucide-react';

interface PodiumProps {
    participants: Participant[];
    onRestart: () => void;
    isHost: boolean;
}

export function Podium({ participants, onRestart, isHost }: PodiumProps) {
    // Confetti dimensions (usually window size)
    // Note: 'use-window-size' or similar is often used with react-confetti. 
    // If we don't have it, we can just omit width/height and it defaults to window,
    // or use a simple hook if we want to be exact.
    // Let's assume default fullscreen behavior is fine, or simple generic approach.

    const sorted = [...participants].sort((a, b) => b.totalScore - a.totalScore);
    const top3 = sorted.slice(0, 3);
    const others = sorted.slice(3);

    // Helper to get visual order for podium (2nd, 1st, 3rd)
    // We want 1st in middle.
    // Layout: [2nd] [1st] [3rd]
    let podiumOrder: Participant[] = [];
    if (top3.length >= 1) podiumOrder[1] = top3[0]; // Center
    if (top3.length >= 2) podiumOrder[0] = top3[1]; // Left
    if (top3.length >= 3) podiumOrder[2] = top3[2]; // Right

    // Clean empty slots if < 3 players
    podiumOrder = podiumOrder.filter(Boolean);

    return (
        <div className="flex flex-col items-center w-full max-w-4xl mx-auto space-y-8 animate-in fade-in duration-1000">
            <Confetti numberOfPieces={500} recycle={false} />

            <div className="text-center space-y-2">
                <Medal className="h-16 w-16 text-yellow-400 mx-auto" />
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Game Over</h1>
                <p className="text-muted-foreground text-lg">The results are in!</p>
            </div>

            {/* TOP 3 PODIUM */}
            <div className="flex items-end justify-center w-full gap-4 md:gap-8 h-64 md:h-80 pb-4">
                {podiumOrder.map((p, index) => {
                    // Determine Rank based on score/original sort
                    const rank = sorted.findIndex(x => x.id === p.id) + 1;

                    let heightClass = 'h-32';
                    let bgClass = 'bg-slate-200';
                    let borderClass = 'border-slate-300';
                    let iconColor = 'text-slate-400';
                    let scaleClass = 'scale-90';
                    let rankLabel = 'Runner Up';

                    if (rank === 1) {
                        heightClass = 'h-52 md:h-64';
                        bgClass = 'bg-yellow-100';
                        borderClass = 'border-yellow-400';
                        iconColor = 'text-yellow-500';
                        scaleClass = 'scale-110 z-10';
                        rankLabel = 'Winner';
                    } else if (rank === 2) {
                        heightClass = 'h-40 md:h-48';
                        bgClass = 'bg-slate-100';
                        borderClass = 'border-slate-300'; // Silver-ish
                        iconColor = 'text-slate-400';
                        scaleClass = 'scale-100';
                        rankLabel = '2nd Place';
                    } else if (rank === 3) {
                        heightClass = 'h-32 md:h-40';
                        bgClass = 'bg-orange-50';
                        borderClass = 'border-orange-300'; // Bronze-ish
                        iconColor = 'text-orange-500';
                        scaleClass = 'scale-95';
                        rankLabel = '3rd Place';
                    }

                    return (
                        <div key={p.id} className={`flex flex-col items-center ${scaleClass} transition-all duration-500`}>
                            <div className="mb-2 text-center animate-bounce">
                                <Trophy className={`h-8 w-8 ${iconColor}`} />
                                <span className={`font-bold block ${iconColor}`}>{rankLabel}</span>
                            </div>

                            <Card className={`w-28 md:w-36 ${heightClass} ${bgClass} border-4 ${borderClass} flex flex-col items-center justify-end relative shadow-xl`}>
                                <div className="absolute top-[-20px] bg-white rounded-full p-1 border-2 border-indigo-100 shadow-sm">
                                    <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <CardContent className="p-2 text-center w-full pb-4">
                                    <h3 className="font-bold text-slate-800 truncate w-full text-sm md:text-base">{p.name}</h3>
                                    <p className="font-black text-indigo-600 text-lg md:text-xl">{p.totalScore}</p>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* RANK LIST (Rest of players) */}
            {others.length > 0 && (
                <div className="w-full max-w-md bg-white rounded-xl shadow-lg border p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 border-b pb-2">Leaderboard</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        {others.map((p, idx) => {
                            const rank = idx + 4;
                            return (
                                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="font-mono text-slate-400 w-6 font-bold">#{rank}</span>
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                            {p.name.charAt(0)}
                                        </div>
                                        <span className="font-medium text-slate-700">{p.name}</span>
                                    </div>
                                    <Badge variant="secondary" className="bg-white border text-indigo-600">{p.totalScore} pts</Badge>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {isHost && (
                <div className="pt-8">
                    <Button onClick={onRestart} size="lg" className="text-lg px-8 shadow-xl bg-indigo-600 hover:bg-indigo-700">
                        <RefreshCcw className="mr-2 h-5 w-5" /> Play Again
                    </Button>
                </div>
            )}
        </div>
    );
}

// Simple Badge component shim locally if convenient, or import from UI. 
// Let's import to be consistent.
import { Badge } from '@/components/ui/badge';
