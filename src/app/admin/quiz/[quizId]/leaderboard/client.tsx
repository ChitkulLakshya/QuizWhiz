'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { getQuiz, getLeaderboard } from '@/lib/firebase-service';
import { Quiz, LeaderboardEntry } from '@/types/quiz';
import { Trophy, Medal, Award, ArrowLeft, Terminal, Cpu, Share2 } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface AdminLeaderboardProps {
  quizId?: string;
}

export default function AdminLeaderboard({ quizId: propQuizId }: AdminLeaderboardProps = {}) {
  const params = useParams();
  const quizId = propQuizId || (params.quizId as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [quizId]);

  const loadData = async () => {
    try {
      const [quizData, leaderboardData] = await Promise.all([
        getQuiz(quizId),
        getLeaderboard(quizId)
      ]);
      setQuiz(quizData);
      setLeaderboard(leaderboardData);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#ccff00] font-mono">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Cpu className="w-12 h-12" />
        <span className="tracking-widest">Loading Leaderboard...</span>
      </div>
    </div>
  );

  if (!quiz) return <div className="p-8 bg-[#050505] text-red-500 font-mono">Error: Quiz Not Found</div>;

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          border: 'border-yellow-500',
          bg: 'bg-yellow-500/10',
          text: 'text-yellow-500',
          icon: <Trophy className="w-8 h-8 text-yellow-500" />
        };
      case 2:
        return {
          border: 'border-gray-300',
          bg: 'bg-gray-300/10',
          text: 'text-gray-300',
          icon: <Medal className="w-8 h-8 text-gray-300" />
        };
      case 3:
        return {
          border: 'border-amber-600',
          bg: 'bg-amber-600/10',
          text: 'text-amber-600',
          icon: <Award className="w-8 h-8 text-amber-600" />
        };
      default:
        return {
          border: 'border-[#333]',
          bg: 'bg-[#0a0a0a]',
          text: 'text-gray-500',
          icon: <span className="text-xl font-mono text-gray-600 font-bold">#{String(rank).padStart(2, '0')}</span>
        };
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden pb-20 md:pb-0">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ccff00]">
            <Terminal className="w-5 h-5" />
            <span className="font-mono text-sm tracking-widest uppercase">Leaderboard</span>
          </div>

          <Button
            variant="ghost"
            asChild
            className="text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest"
          >
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 md:p-8 relative z-10 space-y-8">

        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">{quiz.title}</h1>
          <div className="inline-flex items-center gap-4 text-xs font-mono text-gray-500 uppercase border border-[#333] px-4 py-2 bg-[#0a0a0a]">
            <span>Total Players: {leaderboard.length}</span>
            <span className="text-[#ccff00]">Status: Complete</span>
          </div>
        </div>

        {leaderboard.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-[#333]">
            <p className="text-gray-500 font-mono">No performance data recorded.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaderboard.map((entry) => {
              const style = getRankStyle(entry.rank);
              return (
                <div key={entry.participantId} className={clsx(
                  "relative group border p-6 flex items-center gap-6 transition-all hover:translate-x-1",
                  style.border,
                  style.bg
                )}>
                  <div className="w-12 flex justify-center flex-shrink-0">
                    {style.icon}
                  </div>

                  <div className="flex-1">
                    <h3 className={clsx("text-2xl font-bold uppercase tracking-tight", entry.rank <= 3 ? "text-white" : "text-gray-400")}>
                      {entry.name}
                    </h3>
                    <div className="flex gap-4 mt-1 text-[10px] font-mono uppercase text-gray-500">
                      <span>Correct: {entry.correctAnswers}</span>
                      <span>Accuracy: {entry.correctAnswers > 0 ? Math.round((entry.correctAnswers / (quiz.questions?.length || 1)) * 100) : 0}%</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-4xl font-black text-white tabular-nums tracking-tighter">{entry.totalScore.toLocaleString()}</div>
                    <div className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest">Score</div>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-12 flex justify-center gap-4">
          <Link href={`/admin/quiz/${quizId}/control`}>
            <button className="px-8 py-4 border border-[#333] hover:border-[#ccff00] hover:text-[#ccff00] text-gray-400 font-mono text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
              <Terminal className="w-4 h-4" /> Back to Dashboard
            </button>
          </Link>
        </div>

      </main>
    </div>
  );
}



