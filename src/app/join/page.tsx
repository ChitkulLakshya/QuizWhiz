'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { getQuizByCode, joinQuiz } from '@/lib/firebase-service';
import { Quiz } from '@/types/quiz';

function JoinQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [code, setCode] = useState(codeFromUrl);
  const [name, setName] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (codeFromUrl) {
      handleFindQuiz(codeFromUrl);
    }
  }, [codeFromUrl]);

  const handleFindQuiz = async (quizCode: string) => {
    if (!quizCode.trim()) return;

    setLoading(true);
    setError('');
    try {
      const foundQuiz = await getQuizByCode(quizCode);
      if (foundQuiz) {
        if (foundQuiz.status !== 'lobby') {
          setError('This quiz has already started or ended.');
          return;
        }
        setQuiz(foundQuiz);
      } else {
        setError('Quiz not found. Check the code and try again.');
      }
    } catch (err) {
      setError('Error finding quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quiz || !name.trim()) return;

    setLoading(true);
    try {
      const participantId = await joinQuiz(quiz.id, name);
      // Store participant info in localStorage
      localStorage.setItem('participantId', participantId);
      localStorage.setItem('participantName', name);
      localStorage.setItem('quizId', quiz.id);
      
      router.push(`/play/${quiz.id}`);
    } catch (err) {
      setError('Failed to join quiz');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      <Header />
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="font-headline text-3xl text-center">Join Quiz</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!quiz ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="code">Enter Quiz Code</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="text-center text-2xl font-bold"
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button 
                  onClick={() => handleFindQuiz(code)} 
                  disabled={loading || code.length !== 6}
                  className="w-full"
                >
                  {loading ? 'Finding...' : 'Find Quiz'}
                </Button>
              </>
            ) : (
              <form onSubmit={handleJoin} className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-xl">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground">{quiz.description}</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    maxLength={20}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Joining...' : 'Join Game'}
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full"
                  onClick={() => {
                    setQuiz(null);
                    setCode('');
                    setName('');
                  }}
                >
                  Cancel
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function JoinQuiz() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <JoinQuizContent />
    </Suspense>
  );
}
