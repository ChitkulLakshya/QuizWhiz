'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import {
  subscribeToQuiz,
  subscribeToParticipants,
  subscribeToQuestions,
  updateQuizStatus,
  startQuestion,
  endQuiz,
  joinQuiz,
  submitAnswer,
  calculateQuestionResults
} from '@/lib/firebase-service';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Quiz, Question, Participant, QuestionResult } from '@/types/quiz';
import {
  Play,
  SkipForward,
  Trophy,
  Users,
  Timer,
  CheckCircle,
  XCircle,
  Crown,
  Share2
} from 'lucide-react';
import QRCode from 'react-qr-code';

export default function PlayPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();
  const { toast } = useToast();

  // Data State
  const [user, setUser] = useState<User | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Local Game State
  const [currentParticipant, setCurrentParticipant] = useState<Participant | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [viewState, setViewState] = useState<'lobby' | 'question' | 'results' | 'completed'>('lobby');
  const [hostResults, setHostResults] = useState<QuestionResult | null>(null);

  // Derived State
  const isHost = quiz && user ? quiz.ownerId === user.uid : false;
  const currentQuestion = quiz && quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

  // 1. Auth & Data Subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubParticipants = subscribeToParticipants(quizId, (parts) => {
      setParticipants(parts);
      // Update local participant reference if user is logged in
      if (auth.currentUser) {
        const me = parts.find(p => p.id === auth.currentUser?.uid || (p as any).userId === auth.currentUser?.uid);
        // Note: Our join logic currently uses random IDs or Auto-IDs. 
        // We need to match by something unique. 
        // For simplified "Quick Play", we might rely on localStorage or name matching if Auth ID isn't stored on Participant.
        // However, `joinQuiz` creates a document. If we want to link it to `auth.currentUser`, we should have stored `userId` in participant.
        // Looking at `firebase-service.ts`: `joinQuiz` stores `name`, `quizId`. It DOES NOT currently store `userId`.
        // This is a limitation for re-joining. 
        // For now, valid for a single session.

        // Workaround: We will find participant by name if we can, or just rely on local state for "Have I joined?"
        // Actually, for the HOST, they don't necessarily need to be a "Participant" to play, 
        // BUT the requirement says "Host can play along". 
        // So the Host should JOIN explicitly or be auto-joined?
        // Let's assume Host needs to click "Join" too if they want to track score, 
        // OR we auto-join them.
        // Let's stick to manual join for now for simplicity.
      }
    });
    const unsubQuestions = subscribeToQuestions(quizId, setQuestions);

    return () => {
      unsubscribeAuth();
      unsubQuiz();
      unsubParticipants();
      unsubQuestions();
    };
  }, [quizId]);

  // 2. Timer Logic
  useEffect(() => {
    if (!quiz || !currentQuestion || quiz.status !== 'active' || !quiz.questionStartTime) {
      return;
    }

    const interval = setInterval(() => {
      const elapsed = Date.now() - quiz.questionStartTime!;
      const limit = currentQuestion.timeLimit * 1000;
      const remaining = Math.max(0, limit - elapsed);

      setTimeRemaining(Math.ceil(remaining / 1000));

      // View State Transition: Question -> Results
      // We use a buffer of 1s to allow animations
      if (remaining <= 0) {
        setViewState('results');
      } else {
        setViewState('question');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, currentQuestion]);

  // 3. Status Synchronization
  useEffect(() => {
    if (!quiz) return;
    if (quiz.status === 'lobby' || quiz.status === 'draft') setViewState('lobby');
    if (quiz.status === 'completed') setViewState('completed');

    // 'active' is handled by the timer effect to toggle between question/results
  }, [quiz?.status]);

  // 4. Host: Calculate Results when entering Results view
  useEffect(() => {
    if (isHost && viewState === 'results' && currentQuestion) {
      calculateQuestionResults(quizId, currentQuestion.id).then(setHostResults);
    } else {
      setHostResults(null);
    }
  }, [isHost, viewState, currentQuestion, quizId]);


  // Handlers
  const handleJoinGame = async (name: string) => {
    if (!name) return;
    try {
      // We store the ID in localStorage to reclaim session? 
      // For now, simpler: just create participant.
      const pId = await joinQuiz(quizId, name);
      // We need to know "which participant is me".
      // Since `joinQuiz` returns ID, we should store it.
      // But `setParticipants` comes from DB.
      // Let's just track `myParticipantId` state.
      // Wait, standard join stores it where?
      // The `join` page usually redirects to `quiz/[id]/play`.
      // Here, we are ON the play page.

      // We'll just define that if I have a participant ID, I am joined.
      // For the "Host Play Along", they trigger this manually.
      setCurrentParticipant({ id: pId, name, totalScore: 0, answers: [] } as any); // Optimistic
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to join' });
    }
  };

  const handleSubmitAnswer = async (option: string) => {
    if (!currentParticipant || !currentQuestion || isAnswerSubmitted) return;

    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    const isCorrect = option === currentQuestion.questions?.[currentQuestion.correctOptionIndex]?.toString()
      || questions[quiz!.currentQuestionIndex].options[questions[quiz!.currentQuestionIndex].correctOptionIndex] === option;

    // Fix: logic to match option string
    const actualCorrectOption = currentQuestion.options[currentQuestion.correctOptionIndex];
    const correct = option === actualCorrectOption;

    try {
      await submitAnswer(quizId, currentParticipant.id, {
        questionId: currentQuestion.id,
        answer: option,
        isCorrect: correct,
        pointsEarned: correct ? currentQuestion.points : 0,
        timeSpent: currentQuestion.timeLimit - timeRemaining
      });
    } catch (error) {
      console.error(error);
      // Revert optimistic if needed, but usually fine
    }
  };

  // Host Actions
  const hostStartGame = async () => {
    if (questions.length === 0) return toast({ title: "No questions loaded!" });
    await updateQuizStatus(quizId, 'lobby'); // Ensure lobby state
    await startQuestion(quizId, 0);
  };

  const hostNextQuestion = async () => {
    if (!quiz) return;
    const nextIdx = quiz.currentQuestionIndex + 1;
    if (nextIdx >= questions.length) {
      await endQuiz(quizId);
    } else {
      await startQuestion(quizId, nextIdx);
      setIsAnswerSubmitted(false);
      setSelectedAnswer(null);
    }
  };

  // Render Helpers
  if (!quiz) return <div className="h-screen flex items-center justify-center">Loading Game Room...</div>;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${quiz.code}` : '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header />

      <main className="flex-1 container max-w-4xl mx-auto p-4 pb-32">
        {/* LOBBY VIEW */}
        {viewState === 'lobby' && (
          <div className="flex flex-col items-center space-y-8 py-10">
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-indigo-900 tracking-tight">{quiz.title}</h1>
              <Badge variant="outline" className="text-lg px-4 py-1 border-indigo-200 text-indigo-600">
                Code: {quiz.code}
              </Badge>
            </div>

            {!currentParticipant ? (
              <Card className="w-full max-w-md border-2 border-indigo-100 shadow-xl">
                <CardHeader>
                  <CardTitle>Join the Game</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    const form = e.target as HTMLFormElement;
                    handleJoinGame((form.elements.namedItem('name') as HTMLInputElement).value);
                  }} className="space-y-4">
                    <input
                      name="name"
                      className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-lg ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Enter your nickname..."
                      autoFocus
                      defaultValue={isHost ? "Host" : ""}
                    />
                    <Button type="submit" size="lg" className="w-full text-lg">
                      Join Lobby
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="text-center animate-pulse">
                <p className="text-2xl font-bold text-indigo-600">You are in!</p>
                <p className="text-muted-foreground">Waiting for host to start...</p>
              </div>
            )}

            {/* Participants Grid */}
            <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              {participants.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-2 animate-in fade-in zoom-in">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium truncate">{p.name} {p.id === currentParticipant?.id && '(You)'}</span>
                </div>
              ))}
            </div>

            {/* Only show QR code if not joined or just generically */}
            <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
              <QRCode value={joinUrl} size={150} />
              <p className="text-center text-xs mt-2 text-muted-foreground">Scan to Join</p>
            </div>
          </div>
        )}

        {/* QUESTION VIEW */}
        {viewState === 'question' && currentQuestion && (
          <div className="space-y-6 max-w-2xl mx-auto py-8">
            {/* Timer Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-semibold text-muted-foreground">
                <span>Question {quiz.currentQuestionIndex + 1}/{questions.length}</span>
                <span className={timeRemaining < 5 ? "text-red-500 animate-pulse" : ""}>
                  {timeRemaining}s
                </span>
              </div>
              <Progress value={(timeRemaining / currentQuestion.timeLimit) * 100} className="h-3" />
            </div>

            {/* Question Card */}
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardContent className="p-8 text-center bg-white">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
                  {currentQuestion.questionText}
                </h2>
              </CardContent>
            </Card>

            {/* Options Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswer === option;
                return (
                  <button
                    key={idx}
                    disabled={isAnswerSubmitted || !currentParticipant}
                    onClick={() => handleSubmitAnswer(option)}
                    className={`
                                            p-6 rounded-xl text-left transition-all transform hover:scale-[1.02] active:scale-95
                                            shadow-md border-2
                                            ${isSelected
                        ? 'bg-indigo-600 border-indigo-600 text-white'
                        : 'bg-white border-transparent hover:border-indigo-200 text-slate-700'}
                                            ${!currentParticipant && 'opacity-50 cursor-not-allowed'}
                                        `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                                                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                                                ${isSelected ? 'bg-white text-indigo-600' : 'bg-slate-100 text-slate-500'}
                                            `}>
                        {String.fromCharCode(65 + idx)}
                      </div>
                      <span className="text-lg font-semibold">{option}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* RESULTS VIEW */}
        {viewState === 'results' && currentQuestion && (
          <div className="space-y-6 max-w-2xl mx-auto py-8 text-center">
            <Badge className="bg-orange-500 text-white px-4 py-1 text-lg mb-4">Time's Up!</Badge>

            <h2 className="text-2xl font-bold mb-8">The correct answer is:</h2>

            <Card className="bg-green-600 text-white border-0 shadow-xl transform scale-105">
              <CardContent className="p-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-3xl font-black">{currentQuestion.options[currentQuestion.correctOptionIndex]}</h3>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Your Points</p>
                  <p className="text-3xl font-bold text-indigo-600">
                    {currentParticipant ? currentParticipant.totalScore : 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-muted-foreground text-sm">Rank</p>
                  <p className="text-3xl font-bold text-slate-700">#1</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* COMPLETED VIEW */}
        {viewState === 'completed' && (
          <div className="flex flex-col items-center justify-center py-20 space-y-6">
            <Trophy className="h-24 w-24 text-yellow-400 animate-bounce" />
            <h1 className="text-4xl font-bold">Quiz Completed!</h1>
            <p className="text-xl text-muted-foreground">Thanks for playing!</p>
            <Button onClick={() => router.push('/')} size="lg">Back to Home</Button>
          </div>
        )}

      </main>

      {/* HOST OVERLAY */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-2xl z-50 safe-area-bottom">
          <div className="container max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Badge variant="default" className="bg-indigo-600">HOST</Badge>
              <span className="text-sm font-semibold hidden md:inline">
                {participants.length} Players • {quiz.status.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2">
              {viewState === 'lobby' && (
                <Button onClick={hostStartGame} size="lg" className="bg-green-600 hover:bg-green-700 text-white shadow-lg w-full md:w-auto">
                  <Play className="mr-2 h-4 w-4" /> Start Game
                </Button>
              )}

              {viewState === 'question' && (
                <Button disabled variant="secondary" className="w-full md:w-auto">
                  <Timer className="mr-2 h-4 w-4 animate-spin" /> {timeRemaining}s
                </Button>
              )}

              {viewState === 'results' && (
                <Button onClick={hostNextQuestion} size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg w-full md:w-auto">
                  Next Question <SkipForward className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
