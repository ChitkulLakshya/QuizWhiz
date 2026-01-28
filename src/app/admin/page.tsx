'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { PlusCircle, PlayCircle, Users, Clock, BarChartHorizontal, Trash2 } from 'lucide-react';
import Header from '@/components/header';
import { getQuizzes, deleteQuiz } from '@/lib/firebase-service';
import { Quiz } from '@/types/quiz';
import { onAuthStateChanged } from 'firebase/auth'; // Import auth listener
import { auth } from '@/firebase'; // Import auth instance

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        loadQuizzes(user.uid);
      } else {
        setQuizzes([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadQuizzes = async (userId: string) => {
    try {
      const quizData = await getQuizzes(userId);
      setQuizzes(quizData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation if inside a link (though it's not here)
    if (!confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;

    try {
      await deleteQuiz(quizId);
      // Optimistically remove from state
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz');
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-headline text-3xl md:text-4xl">Admin Dashboard</h1>
          <Button asChild>
            <Link href="/admin/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create New Quiz
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading quizzes...</div>
        ) : quizzes.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4">No quizzes yet. Create your first quiz!</p>
              <Button asChild>
                <Link href="/admin/create">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Quiz
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">{quiz.title}</CardTitle>
                  <CardDescription>
                    Code: <span className="font-bold text-lg">{quiz.code}</span>
                  </CardDescription>
                  <CardDescription>
                    Status: <span className="capitalize">{quiz.status}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>Created {new Date(quiz.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap gap-2 justify-between">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/quiz/${quiz.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/quiz/${quiz.id}/leaderboard`}>
                        <BarChartHorizontal className="mr-1 h-4 w-4" />
                        Results
                      </Link>
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" asChild>
                      <Link href={`/admin/quiz/${quiz.id}/control`}>
                        <PlayCircle className="mr-1 h-4 w-4" />
                        Control
                      </Link>
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={(e) => handleDelete(quiz.id, e)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
