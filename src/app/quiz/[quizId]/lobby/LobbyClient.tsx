'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, PlayCircle, Loader2 } from 'lucide-react';
import { mockQuizzes, mockParticipants } from '@/lib/mock-data';
import type { Quiz } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function LobbyClient() {
  const params = useParams();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId;
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [joinUrl, setJoinUrl] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const foundQuiz = mockQuizzes.find(q => q.id === quizId);
    setQuiz(foundQuiz || null);

    if (typeof window !== 'undefined') {
      setJoinUrl(`${window.location.origin}/quiz/${quizId}`);
    }
  }, [quizId]);

  const handleStartQuiz = () => {
    toast({
      title: "Quiz Started!",
      description: "Participants can now begin answering questions."
    });
    // In a real app, this would trigger a state change in your database (e.g., Firebase)
    // to notify all participants that the quiz has started.
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-muted/40">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="text-center mb-8">
          <h1 className="font-headline text-3xl md:text-5xl">{quiz.title}</h1>
          <p className="text-muted-foreground mt-2 text-lg">Lobby is open! Ask your participants to scan the QR code to join.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Users /> Participants ({mockParticipants.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {mockParticipants.map(p => (
                    <div key={p.id} className="bg-secondary text-secondary-foreground rounded-full px-4 py-2 font-medium">
                      {p.name}
                    </div>
                  ))}
                  <div className="bg-secondary/50 border border-dashed rounded-full px-4 py-2 text-muted-foreground animate-pulse">
                    Waiting for more...
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Scan to Join</CardTitle>
                <CardDescription>Use your phone's camera.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center p-6 bg-white rounded-b-lg">
                {joinUrl && (
                  <QRCode
                    value={joinUrl}
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                )}
              </CardContent>
            </Card>
            <Button size="lg" className="w-full text-lg py-8" onClick={handleStartQuiz}>
              <PlayCircle className="h-8 w-8 mr-4" /> Start Quiz for Everyone
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
