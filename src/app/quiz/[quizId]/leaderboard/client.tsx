'use client';

import { mockQuizzes, mockLeaderboard } from '@/lib/mock-data';
import Header from '@/components/header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import LeaderboardClient from './leaderboard-client';
import { useParams } from 'next/navigation';

export default function LeaderboardPage() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params.quizId[0] : params?.quizId;
  const quiz = mockQuizzes.find(q => q.id === quizId);

  if (!quiz) {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505] text-[#ccff00] font-mono items-center justify-center p-6 text-center space-y-4">
        <div className="w-16 h-16 border-2 border-red-500 rounded-full flex items-center justify-center animate-pulse">
          <Terminal className="w-8 h-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest">404: Data Log Missing</h1>
        <p className="text-sm text-gray-500 uppercase tracking-widest">Unable to retrieve performance metrics.</p>
        <div className="mt-8 border border-[#333] px-4 py-2 hover:bg-[#333] transition-colors cursor-pointer">
          <a href="/" className="text-xs uppercase">Return to Base</a>
        </div>
      </div>
    );
  }
  return <LeaderboardClient quiz={quiz} leaderboardData={mockLeaderboard} />;
}



