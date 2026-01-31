'use client';

import { mockQuizzes, mockLeaderboard } from '@/lib/mock-data';
import Header from '@/components/header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import LeaderboardClient from './leaderboard-client'; // The existing child component
import { useParams } from 'next/navigation';

export default function LeaderboardPageClient() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId;
  const quiz = mockQuizzes.find(q => q.id === quizId);

  if (!quiz) {
    return (
        <div className="flex flex-col w-full">
            <Header />
            <main className="flex-1 p-8 flex items-center justify-center">
                 <Alert variant="destructive" className="max-w-md">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle className="font-headline">Quiz Not Found</AlertTitle>
                    <AlertDescription>
                        The quiz you are looking for does not exist or may have been moved.
                    </AlertDescription>
                </Alert>
            </main>
        </div>
    );
  }

  // In a real app, you would fetch leaderboard data for the specific quizId.
  // For now, we use the same mock leaderboard for all quizzes.
  return <LeaderboardClient quiz={quiz} leaderboardData={mockLeaderboard} />;
}
