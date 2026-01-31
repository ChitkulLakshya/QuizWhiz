'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import { getQuiz, getLeaderboard } from '@/lib/firebase-service';
import { Quiz, LeaderboardEntry } from '@/types/quiz';
import { Trophy, Medal, Award, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardClient() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId || '';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (quizId) {
      loadData();
    }
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

  if (loading) return <div className="p-8">Loading...</div>;
  if (!quiz) return <div className="p-8">Quiz not found</div>;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-8 w-8 text-gray-400" />;
      case 3:
        return <Award className="h-8 w-8 text-amber-600" />;
      default:
        return <span className="text-2xl font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>

          <div className="text-center mb-8">
            <h1 className="font-headline text-4xl mb-2">{quiz.title}</h1>
            <p className="text-xl text-muted-foreground">Final Leaderboard</p>
          </div>

          {leaderboard.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">No participants yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <Card key={entry.participantId} className={`
                  ${entry.rank === 1 ? 'border-yellow-500 border-2' : ''}
                  ${entry.rank === 2 ? 'border-gray-400 border-2' : ''}
                  ${entry.rank === 3 ? 'border-amber-600 border-2' : ''}
                `}>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0 w-16 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold">{entry.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {entry.correctAnswers} correct answers
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold">{entry.totalScore}</p>
                        <p className="text-sm text-muted-foreground">points</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link href={`/admin/quiz/${quizId}/control`}>
                Back to Control Panel
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
