'use client';

import { useState, useEffect } from 'react';
import type { Quiz } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, LogIn, ChevronsRight, CheckCircle, XCircle, Terminal, Cpu, Clock, Wifi, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { useToast } from '@/hooks/use-toast';
import clsx from 'clsx';

type GameState = 'joining' | 'waiting' | 'active' | 'review' | 'finished';

export default function QuizClient({ quiz }: { quiz: Quiz }) {
  const router = useRouter();
  const { toast } = useToast();
  const [gameState, setGameState] = useState<GameState>('joining');
  const [participantName, setParticipantName] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const [timeLeft, setTimeLeft] = useState(currentQuestion?.timeLimit || 30);
  const [isTimeUp, setIsTimeUp] = useState(false);
  useEffect(() => {
    if (gameState === 'active' && !isTimeUp) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsTimeUp(true);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState, currentQuestionIndex, isTimeUp]);

  useEffect(() => {
    if (isTimeUp) {
      handleAnswerSubmit();
    }
  }, [isTimeUp]);


  const handleJoin = () => {
    if (participantName.trim().length < 2) {
      toast({ title: 'Name Required', description: 'Please enter a valid name.', variant: 'destructive' });
      return;
    }
    setGameState('waiting');
    toast({ title: `Welcome!`, description: `Get ready to play, ${participantName}!` });
    setTimeout(() => setGameState('active'), 3000);
  };

  const handleAnswerSelect = (option: string) => {
    if (gameState !== 'active') return;
    setSelectedAnswer(option);
  };

  const handleAnswerSubmit = () => {
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(s => s + 1);
    }
    setGameState('review');
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(i => i + 1);
      setSelectedAnswer(null);
      setTimeLeft(quiz.questions[currentQuestionIndex + 1].timeLimit);
      setIsTimeUp(false);
      setGameState('active');
    } else {
      setGameState('finished');
    }
  };

  if (gameState === 'joining') {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505] text-white font-display overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full max-w-md mx-auto">
          <div className="w-full bg-[#0a0a0a] border border-[#333] p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#ccff00]"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-[#ccff00]"></div>

            <div className="flex item-center justify-center mb-8">
              <Terminal className="w-12 h-12 text-[#ccff00]" />
            </div>

            <h1 className="text-2xl font-black text-center mb-2 uppercase tracking-tight">Join Game</h1>
            <p className="text-xs font-mono text-center text-gray-500 uppercase mb-8">Joining: {quiz.title}</p>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest pl-1">Your Name</label>
                <Input
                  placeholder="Enter your name..."
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  autoFocus
                  className="bg-[#050505] border-[#333] text-white font-mono h-12 text-lg focus:border-[#ccff00] focus:ring-0 rounded-none placeholder:text-gray-800"
                />
              </div>

              <Button
                className="w-full h-12 bg-[#ccff00] hover:bg-white text-black font-black uppercase tracking-widest text-sm rounded-none transition-colors"
                onClick={handleJoin}
              >
                Join Game <LogIn className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'waiting') {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505] text-white font-display overflow-hidden relative items-center justify-center">
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>

        <div className="text-center space-y-8 relative z-10 p-6">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-32 h-32 border-2 border-[#ccff00] rounded-full animate-ping opacity-20 absolute"></div>
            <div className="w-24 h-24 border border-[#ccff00] rounded-full animate-pulse flex items-center justify-center bg-[#ccff00]/10 backdrop-blur-sm">
              <Wifi className="w-10 h-10 text-[#ccff00]" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tight animate-pulse">Waiting for Host</h1>
            <p className="text-sm font-mono text-gray-400 uppercase tracking-widest">
              The game will start soon...
            </p>
          </div>

          <div className="border border-[#333] bg-[#0a0a0a] px-4 py-2 inline-block">
            <span className="text-xs font-mono text-[#ccff00]">Player: {participantName}</span>
          </div>
        </div>
      </div>
    )
  }

  if (gameState === 'finished') {
    return (
      <div className="flex flex-col min-h-screen bg-[#050505] text-white font-display overflow-hidden relative items-center justify-center p-6">
        <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>

        <div className="w-full max-w-md bg-[#0a0a0a] border border-[#333] p-8 relative z-10 text-center space-y-8 relative overflow-hidden">
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-3 h-3 border-l-2 border-t-2 border-[#ccff00]"></div>
          <div className="absolute top-0 right-0 w-3 h-3 border-r-2 border-t-2 border-[#ccff00]"></div>
          <div className="absolute bottom-0 left-0 w-3 h-3 border-l-2 border-b-2 border-[#ccff00]"></div>
          <div className="absolute bottom-0 right-0 w-3 h-3 border-r-2 border-b-2 border-[#ccff00]"></div>

          <div>
            <h1 className="text-3xl font-black uppercase text-white mb-2">Quiz Complete</h1>
            <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Here are your results</p>
          </div>

          <div className="py-8 border-y border-[#222]">
            <div className="text-6xl font-black text-[#ccff00] tabular-nums mb-2">{score}</div>
            <div className="text-[10px] font-mono text-gray-400 uppercase">Correct Answers</div>
            <div className="text-xs font-mono text-gray-600 mt-1">/ {quiz.questions.length} TOTAL</div>
          </div>

          <Button
            className="w-full h-14 bg-white hover:bg-[#ccff00] text-black font-black uppercase tracking-widest transition-colors rounded-none"
            onClick={() => router.push(`/quiz/${quiz.id}/leaderboard`)}
          >
            View Leaderboard <ChevronsRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white font-display overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-10 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Header Info */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#050505]/90 backdrop-blur-md border-b border-[#222] z-50 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#ccff00]" />
          <span className="font-mono text-xs uppercase text-gray-400 hidden sm:inline">Quiz: {quiz.title}</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-xs uppercase">
          <span>Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
          <span className="text-[#ccff00] font-bold px-2 py-1 border border-[#ccff00] bg-[#ccff00]/10">Score: {score}</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 md:p-8 pt-24 max-w-3xl mx-auto w-full relative z-10">

        {/* Timer Bar */}
        <div className="mb-8 w-full h-1 bg-[#111] overflow-hidden relative">
          <div
            className={clsx("h-full transition-all duration-1000 ease-linear",
              timeLeft <= 5 ? "bg-red-500 shadow-[0_0_10px_red]" : "bg-[#ccff00] shadow-[0_0_10px_#ccff00]"
            )}
            style={{ width: `${(timeLeft / currentQuestion.timeLimit) * 100}%` }}
          ></div>
        </div>

        {/* Question Card */}
        <div className="flex-1 flex flex-col justify-center min-h-[50vh]">
          <h2 className="text-2xl md:text-4xl font-black uppercase leading-tight mb-8 text-shadow-glow">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = option === currentQuestion.correctAnswer;
              const isSelected = option === selectedAnswer;

              let stateClass = "border-[#333] hover:border-gray-500 bg-[#0a0a0a]";

              if (gameState === 'active') {
                if (isSelected) stateClass = "border-[#ccff00] bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.4)]";
              } else if (gameState === 'review') {
                if (isCorrect) stateClass = "border-green-500 bg-green-500 text-black";
                else if (isSelected && !isCorrect) stateClass = "border-red-500 bg-red-500 text-black";
                else stateClass = "border-[#222] opacity-50";
              }

              return (
                <button
                  key={option}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={gameState !== 'active'}
                  className={clsx(
                    "w-full text-left p-6 md:p-8 border transition-all duration-200 relative group overflow-hidden flex items-center justify-between",
                    stateClass
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <span className={clsx("font-mono text-xs w-6 h-6 flex items-center justify-center border rounded-sm",
                      gameState === 'active' && isSelected ? "border-black text-black" :
                        gameState === 'review' && (isCorrect || isSelected) ? "border-black text-black" : "border-[#444] text-gray-500"
                    )}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-bold text-lg md:text-xl uppercase tracking-tight">{option}</span>
                  </div>

                  {gameState === 'review' && (
                    <div className="relative z-10">
                      {isCorrect && <CheckCircle className="w-6 h-6 text-black" />}
                      {isSelected && !isCorrect && <XCircle className="w-6 h-6 text-black" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 h-16 flex items-end justify-center">
          {gameState === 'active' && (
            <div className="text-center animate-pulse text-gray-500 font-mono text-xs uppercase">
              <Clock className="w-4 h-4 inline-block mr-2" />
              {timeLeft}s Remaining
            </div>
          )}

          {gameState === 'review' && (
            <Button
              className="w-full md:w-auto px-12 h-14 bg-white hover:bg-[#ccff00] text-black font-black uppercase tracking-widest text-lg transition-colors"
              onClick={() => {
                if (currentQuestionIndex < quiz.questions.length - 1) {
                  handleNextQuestion();
                } else {
                  setGameState('finished');
                }
              }}
            >
              {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Results'} <ChevronsRight className="ml-2 w-6 h-6" />
            </Button>
          )}
        </div>

      </main>
    </div>
  );
}
