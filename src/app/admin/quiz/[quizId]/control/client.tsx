'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  subscribeToQuiz,
  subscribeToParticipants,
  subscribeToQuestions,
  updateQuizStatus,
  startQuestion,
  endQuiz,
  calculateQuestionResults
} from '@/lib/firebase-service';
import { Quiz, Question, Participant, QuestionResult } from '@/types/quiz';
import { Users, Play, SkipForward, Trophy, Wifi, Radio, Zap, BarChart3, ArrowLeft, Layers, UserPlus, StopCircle } from 'lucide-react';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import clsx from 'clsx';

interface QuizControlProps {
  quizId?: string;
}

export default function QuizControl({ quizId: propQuizId }: QuizControlProps = {}) {
  const params = useParams();
  const quizId = propQuizId || (params?.quizId as string);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentResults, setCurrentResults] = useState<QuestionResult | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${quiz?.code}`
    : '';

  useEffect(() => {
    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubParticipants = subscribeToParticipants(quizId, setParticipants);
    const unsubQuestions = subscribeToQuestions(quizId, setQuestions);

    return () => {
      unsubQuiz();
      unsubParticipants();
      unsubQuestions();
    };
  }, [quizId]);
  useEffect(() => {
    if (!quiz || quiz.status !== 'active' || !quiz.questionStartTime) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - quiz.questionStartTime!;
      const remaining = Math.max(0, currentQuestion.timeLimit * 1000 - elapsed);
      setTimeRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0) {
        handleShowResults();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, questions]);

  const handleStartLobby = async () => {
    await updateQuizStatus(quizId, 'lobby');
  };

  const handleStartFirstQuestion = async () => {
    if (questions.length === 0) {
      alert('Error: No questions found.');
      return;
    }
    await startQuestion(quizId, 0);
  };

  const handleShowResults = async () => {
    if (!quiz || quiz.currentQuestionIndex < 0) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    const results = await calculateQuestionResults(quizId, currentQuestion.id);
    setCurrentResults(results);
  };

  const handleNextQuestion = async () => {
    if (!quiz) return;

    const nextIndex = quiz.currentQuestionIndex + 1;

    if (nextIndex >= questions.length) {
      await endQuiz(quizId);
    } else {
      setCurrentResults(null);
      await startQuestion(quizId, nextIndex);
    }
  };

  const handleEndQuiz = async () => {
    if (confirm('Are you sure you want to end the game early?')) {
      await endQuiz(quizId);
    }
  };

  if (!quiz) return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#ccff00] font-mono">
      <div className="flex flex-col items-center gap-4 animate-pulse">
        <Radio className="w-12 h-12" />
        <span className="tracking-widest">Connecting...</span>
      </div>
    </div>
  );

  const currentQuestion = quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;
  const answeredCount = currentQuestion && participants.length > 0
    ? participants.filter(p => String(quiz.currentQuestionIndex) in p.answers).length
    : 0;
  const progressPercent = questions.length > 0 ? ((quiz.currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden pb-20 md:pb-0">

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#ccff00]">
            <Wifi className="w-5 h-5 animate-pulse" />
            <span className="font-mono text-sm tracking-widest uppercase">Live Game</span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              asChild
              className="text-gray-500 hover:text-white font-mono text-xs uppercase tracking-widest"
            >
              <Link href={`/admin/quiz/${quizId}/edit`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Config
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10 space-y-8">

        {/* Top Status Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#222] pb-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter text-white mb-2">{quiz.title}</h1>
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className={clsx(
                "px-2 py-0.5 border text-black font-bold uppercase",
                quiz.status === 'active' ? "bg-green-500 border-green-500 animate-pulse" :
                  quiz.status === 'lobby' ? "bg-yellow-500 border-yellow-500" :
                    quiz.status === 'completed' ? "bg-blue-500 border-blue-500" : "bg-gray-500 border-gray-500"
              )}>
                Status: {quiz.status}
              </span>
              <span>Code: {quiz.code}</span>
            </div>
          </div>

          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-[10px] font-mono text-gray-500 uppercase">Players</p>
              <div className="text-3xl font-black text-white flex justify-end items-center gap-2">
                {participants.length} <Users className="w-5 h-5 text-[#ccff00]" />
              </div>
            </div>
            {quiz.status === 'active' && (
              <div className="text-right">
                <p className="text-[10px] font-mono text-gray-500 uppercase">Time Left</p>
                <div className={clsx(
                  "text-3xl font-black flex justify-end items-center gap-2 tabular-nums",
                  timeRemaining <= 5 ? "text-red-500 animate-pulse" : "text-[#ccff00]"
                )}>
                  {timeRemaining}s <Zap className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Left Column: Command Center */}
          <div className="space-y-6">

            {/* Controls */}
            <div className="bg-[#0a0a0a] border border-[#333] p-1">
              <div className="h-6 bg-[#111] px-3 flex items-center justify-between border-b border-[#333]">
                <span className="text-[10px] font-mono text-gray-500 uppercase">Control Panel</span>
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {quiz.status === 'draft' && (
                  <button onClick={handleStartLobby} className="w-full h-16 bg-[#ccff00] hover:bg-white text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3">
                    <Radio className="w-6 h-6" /> Open Lobby
                  </button>
                )}

                {quiz.status === 'lobby' && (
                  <button onClick={handleStartFirstQuestion} className="w-full h-16 bg-[#ccff00] hover:bg-white text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3 animate-pulse">
                    <Play className="w-6 h-6" /> Start Game
                  </button>
                )}

                {quiz.status === 'active' && !currentResults && (
                  <div className="space-y-4">
                    <div className="border border-[#333] bg-[#050505] p-4 text-center">
                      <p className="text-[10px] font-mono text-gray-500 uppercase mb-2">Answers Received</p>
                      <div className="h-2 w-full bg-[#111] overflow-hidden">
                        <div
                          className="h-full bg-[#ccff00] transition-all duration-500 ease-out"
                          style={{ width: `${participants.length > 0 ? (answeredCount / participants.length) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <p className="text-2xl font-black text-white mt-2">
                        {answeredCount} <span className="text-gray-600 text-sm">/ {participants.length}</span>
                      </p>
                    </div>
                    <button onClick={handleShowResults} className="w-full h-14 bg-white hover:bg-gray-200 text-black font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                      <BarChart3 className="w-5 h-5" /> Show Results
                    </button>
                  </div>
                )}

                {currentResults && (
                  <button onClick={handleNextQuestion} className="w-full h-16 bg-[#ccff00] hover:bg-white text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-3">
                    {quiz.currentQuestionIndex < questions.length - 1 ? (
                      <>
                        <span>Next Question</span>
                        <SkipForward className="w-6 h-6" />
                      </>
                    ) : (
                      <>
                        <span>Finish Quiz</span>
                        <Trophy className="w-6 h-6" />
                      </>
                    )}
                  </button>
                )}

                {quiz.status === 'completed' && (
                  <Link href={`/admin/quiz/${quizId}/leaderboard`} className="block">
                    <button className="w-full h-16 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                      <Trophy className="w-6 h-6" /> View Leaderboard
                    </button>
                  </Link>
                )}

                {quiz.status !== 'completed' && quiz.status !== 'draft' && (
                  <button onClick={handleEndQuiz} className="w-full h-10 border border-red-900 text-red-700 hover:bg-red-950/30 hover:text-red-500 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2 mt-4">
                    <StopCircle className="w-4 h-4" /> End Game
                  </button>
                )}
              </div>
            </div>

            {/* QR Uplink Card */}
            {(quiz.status === 'draft' || quiz.status === 'lobby') && (
              <div className="bg-[#0a0a0a] border border-[#333] p-1 group">
                <div className="p-6 flex flex-col items-center gap-4">
                  <div className="bg-white p-2 relative group-hover:scale-105 transition-transform duration-500">
                    <div className="absolute top-0 left-0 w-8 h-8 border-l-4 border-t-4 border-[#ccff00] -translate-x-2 -translate-y-2"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-r-4 border-b-4 border-[#ccff00] translate-x-2 translate-y-2"></div>
                    <QRCode value={joinUrl} size={180} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Game Code</p>
                    <p className="text-4xl font-black text-[#ccff00] tracking-widest">{quiz.code}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Participants Feed */}
            <div className="bg-[#0a0a0a] border border-[#333] text-sm">
              <div className="p-3 border-b border-[#333] flex justify-between items-center bg-[#111]">
                <span className="text-xs font-mono text-gray-400 uppercase flex items-center gap-2">
                  <UserPlus className="w-3 h-3" /> Players Joined
                </span>
                <span className="text-[#ccff00] font-bold">{participants.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto w-full custom-scrollbar p-0">
                {participants.length === 0 ? (
                  <div className="p-8 text-center text-gray-600 font-mono text-xs italic">
                    Waiting for players...
                  </div>
                ) : (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#222]">
                      {participants.map((p, i) => (
                        <tr key={p.id} className="hover:bg-[#111] transition-colors">
                          <td className="p-3 text-gray-400 font-mono text-[10px]">#{String(i + 1).padStart(2, '0')}</td>
                          <td className="p-3 font-bold text-white">{p.name}</td>
                          <td className="p-3 text-right font-mono text-[#ccff00]">{p.totalScore}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Tactical Display */}
          <div className="space-y-6">

            {/* Question Monitor */}
            <div className="bg-[#0a0a0a] border border-[#333] h-full min-h-[400px] relative overflow-hidden flex flex-col">
              {/* Grid Background */}
              <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(18,18,18,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0.5)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

              {/* Header */}
              <div className="h-8 bg-[#111] border-b border-[#333] flex items-center justify-between px-4 relative z-10">
                <span className="text-[10px] font-mono text-gray-400 uppercase">Live View</span>
                <span className="text-[10px] font-mono text-[#ccff00]">
                  Question {quiz.currentQuestionIndex + 1}/{questions.length}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 p-8 flex flex-col justify-center relative z-10">
                {currentQuestion ? (
                  <div className="space-y-8">
                    <h2 className="text-2xl md:text-3xl font-bold text-center leading-tight">
                      {currentQuestion.questionText}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentQuestion.options.map((option, index) => (
                        <div key={index} className={clsx(
                          "p-4 border transition-all relative overflow-hidden",
                          currentResults && index === currentQuestion.correctOptionIndex
                            ? "bg-green-900/30 border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.3)]"
                            : "bg-[#050505] border-[#333] opacity-60"
                        )}>
                          {/* Bar Chart Behind */}
                          {currentResults && (
                            <div
                              className={clsx(
                                "absolute inset-0 z-0 opacity-20",
                                index === currentQuestion.correctOptionIndex ? "bg-green-500" : "bg-gray-500"
                              )}
                              style={{ width: `${currentResults.totalResponses > 0 ? (currentResults.optionCounts[index] / currentResults.totalResponses) * 100 : 0}%` }}
                            ></div>
                          )}

                          <div className="relative z-10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs w-6 h-6 flex items-center justify-center border border-[#444] rounded-sm bg-[#111] text-gray-400">
                                {String.fromCharCode(65 + index)}
                              </span>
                              <span className="font-bold text-sm md:text-base">{option}</span>
                            </div>

                            {currentResults && (
                              <div className="text-right">
                                <span className="block text-lg font-black">{currentResults.optionCounts[index]}</span>
                                <span className="text-[10px] font-mono text-gray-400">
                                  {currentResults.totalResponses > 0 ? Math.round((currentResults.optionCounts[index] / currentResults.totalResponses) * 100) : 0}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-600 space-y-4">
                    <Layers className="w-16 h-16 mx-auto opacity-20" />
                    <p className="font-mono text-sm uppercase tracking-widest">
                      {quiz.status === 'completed' ? 'Quiz Complete' : 'Waiting for question...'}
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}



