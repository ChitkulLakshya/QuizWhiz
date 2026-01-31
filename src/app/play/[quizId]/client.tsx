'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
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
  calculateQuestionResults,
  restartGame
} from '@/lib/firebase-service';
import { auth } from '@/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import type { Quiz, Question, Participant, QuestionResult } from '@/types/quiz';
import {
  Play,
  SkipForward,
  Timer,
  Share2,
  Volume2,
  VolumeX,
  Smartphone
} from 'lucide-react';
import { ShareModal } from '@/components/game/share-modal';
import { useGameSounds } from '@/hooks/use-game-sounds';

// View Components
import { LobbyView } from '@/components/game/state-views/lobby-view';
import { QuestionView } from '@/components/game/state-views/question-view';
import { ResultsView } from '@/components/game/state-views/results-view';

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
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Derived State
  const isHost = quiz && user ? quiz.ownerId === user.uid : false;
  const currentQuestion = quiz && quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

  // Sound Hooks
  const { playCorrect, playWrong, playCountdown, playResults, isMuted, toggleMute } = useGameSounds();

  // 1. Auth & Data Subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubParticipants = subscribeToParticipants(quizId, (parts) => {
      setParticipants(parts);
      if (auth.currentUser) {
        const me = parts.find(p => p.id === auth.currentUser?.uid);
        if (me) setCurrentParticipant(me);
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

  // 1b. Host Auto-Join
  useEffect(() => {
    if (isHost && user && quiz && quiz.status === 'lobby') {
      const amIJoined = participants.some(p => p.id === user.uid);
      if (!amIJoined) {
        joinQuiz(quizId, user.displayName || "Host").catch(console.error);
      }
    }
  }, [isHost, user, quiz, participants]);

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

      if (remaining > 0 && remaining <= 5000) {
        const previousSec = Math.ceil((limit - (elapsed - 100)) / 1000);
        const currentSec = Math.ceil(remaining / 1000);
        if (currentSec !== previousSec) {
          playCountdown();
        }
      }

      if (remaining <= 0) {
        setViewState('results');
      } else {
        setViewState('question');
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, currentQuestion, playCountdown]);

  // 3. Status Synchro
  useEffect(() => {
    if (!quiz) return;
    if (quiz.status === 'lobby' || quiz.status === 'draft') {
      setViewState('lobby');
    } else if (quiz.status === 'completed') {
      setViewState('completed');
    } else if (quiz.status === 'active') {
      if (viewState !== 'results') {
        setViewState('question');
      }
    }
  }, [quiz?.status]);

  // 3b. Reset Local State on New Question
  useEffect(() => {
    if (currentQuestion) {
      setIsAnswerSubmitted(false);
      setSelectedAnswer(null);
    }
  }, [currentQuestion?.id]);


  // 4. Host: Calculate Results
  useEffect(() => {
    if (isHost && viewState === 'results' && currentQuestion) {
      calculateQuestionResults(quizId, currentQuestion.id).then(setHostResults);
    } else {
      setHostResults(null);
    }
  }, [isHost, viewState, currentQuestion, quizId]);

  // 5. Sound Triggers
  useEffect(() => {
    if (viewState === 'question') {
      playCountdown();
    } else if (viewState === 'results' || viewState === 'completed') {
      playResults();
    }
  }, [viewState, playCountdown, playResults]);


  // Handlers
  const handleJoinGame = async (name: string) => {
    if (!name) return;
    try {
      const pId = await joinQuiz(quizId, name);
      if (!currentParticipant) {
        setCurrentParticipant({ id: pId, name, totalScore: 0, currentStreak: 0, answers: {}, quizId } as any);
      }
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Failed to join' });
    }
  };

  const handleAnswerSubmit = async (option: string, index: number) => {
    if (!currentParticipant || !currentQuestion || isAnswerSubmitted) return;

    setSelectedAnswer(option);
    setIsAnswerSubmitted(true);

    try {
      // Server-side scoring - Cloud Function calculates correctness
      const result = await submitAnswer(
        quizId,
        currentParticipant.id,
        quiz?.currentQuestionIndex ?? 0,
        index
      );

      // Play sound based on server response
      if (result.isCorrect) playCorrect();
      else playWrong();
    } catch (error) {
      console.error(error);
      // Fallback: play wrong sound on error
      playWrong();
    }
  };

  const hostStartGame = async () => {
    if (questions.length === 0) return toast({ title: "No questions loaded!" });
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await updateQuizStatus(quizId, 'lobby');
      await startQuestion(quizId, 0);
    } finally {
      setIsProcessing(false);
    }
  };

  const hostNextQuestion = async () => {
    if (!quiz) return;
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const nextIdx = quiz.currentQuestionIndex + 1;
      if (nextIdx >= questions.length) {
        await endQuiz(quizId);
      } else {
        await startQuestion(quizId, nextIdx);
        setViewState('question'); // Force view update immediately
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestart = async () => {
    try {
      await restartGame(quizId);
      toast({ title: "Game Restarted!" });
    } catch (error) {
      console.error("Restart failed:", error);
    }
  };

  if (!quiz) return <div className="h-screen w-full bg-[#050505] flex items-center justify-center text-[#ccff00] font-mono">LOADING GAME_HUD...</div>;

  const joinUrl = typeof window !== 'undefined' ? `${window.location.origin}/join?code=${quiz.code}` : '';

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans overflow-hidden">

      {/* Sound Toggle (Absolute) */}
      <div className="absolute top-4 right-4 z-50">
        <Button variant="ghost" size="icon" onClick={toggleMute} className="bg-black/50 text-white hover:bg-black/80 hover:text-[#ccff00]">
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </Button>
      </div>

      <main className="flex-1 w-full relative">

        {viewState === 'lobby' && (
          <LobbyView
            quiz={quiz}
            participants={participants}
            currentParticipant={currentParticipant}
            joinUrl={joinUrl}
            isHost={isHost}
            onJoin={handleJoinGame}
          />
        )}

        {viewState === 'question' && currentQuestion && (
          <QuestionView
            question={currentQuestion}
            questionIndex={quiz.currentQuestionIndex}
            totalQuestions={questions.length}
            timeRemaining={timeRemaining}
            currentParticipant={currentParticipant}
            selectedAnswer={selectedAnswer}
            isAnswerSubmitted={isAnswerSubmitted}
            onAnswerSubmit={handleAnswerSubmit}
            streak={currentParticipant?.currentStreak}
            totalParticipants={participants.length}
          />
        )}

        {(viewState === 'results' || viewState === 'completed') && (
          <ResultsView
            quiz={quiz}
            question={currentQuestion}
            participants={participants}
            currentParticipant={currentParticipant}
            isHost={isHost}
            onRestart={handleRestart}
            isFinalResult={viewState === 'completed'}
          />
        )}

      </main>

      {/* HOST CONTROLS OVERLAY */}
      {isHost && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#111] border-t border-[#ccff00] p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] z-50">
          <div className="container max-w-lg mx-auto flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">
              <div className="bg-[#ccff00] text-black px-2 py-0.5 text-xs font-black rounded-sm">HOST</div>
              <span className="text-xs font-mono text-gray-400 hidden md:inline">
                {participants.length} AGENTS // STATUS: {quiz.status.toUpperCase()}
              </span>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsShareModalOpen(true)}
                className="bg-transparent border-gray-700 text-gray-400 hover:text-white shrink-0 rounded-none w-10 h-10"
              >
                <Share2 className="h-4 w-4" />
              </Button>

              {viewState === 'lobby' && (
                <Button onClick={hostStartGame} disabled={isProcessing} className="bg-[#ccff00] hover:bg-[#bbee00] text-black font-bold uppercase rounded-none w-full md:w-auto h-10 px-6">
                  <Play className="mr-2 h-4 w-4" /> {isProcessing ? "INITIATING..." : "START SECTOR"}
                </Button>
              )}

              {viewState === 'question' && (
                <Button disabled variant="secondary" className="bg-[#1a1a1a] text-[#ccff00] font-mono border border-[#ccff00]/30 rounded-none h-10 w-full md:w-auto">
                  <Timer className="mr-2 h-4 w-4 animate-spin" /> {timeRemaining}s
                </Button>
              )}


              {viewState === 'results' && (
                <Button onClick={hostNextQuestion} disabled={isProcessing} className="bg-[#ccff00] hover:bg-[#bbee00] text-black font-bold uppercase rounded-none w-full md:w-auto h-10 px-6">
                  {isProcessing ? "LOADING..." : "NEXT SECTOR"} <SkipForward className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {quiz && (
        <ShareModal
          quizId={quizId}
          quizCode={quiz.code}
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}
    </div>
  );
}



