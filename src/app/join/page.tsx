'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Header from '@/components/header';
import { getQuizByCode, joinQuiz } from '@/lib/firebase-service';
import { Quiz } from '@/types/quiz';

export default function JoinQuiz() {
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
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Joining</p>
                  <h3 className="text-2xl font-bold">{quiz.title}</h3>
                  <p className="text-sm text-muted-foreground capitalize">Status: {quiz.status}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    required
                    autoFocus
                  />
                </div>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setQuiz(null);
                      setError('');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={loading || !name.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Joining...' : 'Join Quiz'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
