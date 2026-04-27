'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Header from '@/components/header';
import { 
  subscribeToQuiz, 
  subscribeToQuestions,
  submitAnswer,
  getLeaderboard
} from '@/lib/firebase-service';
import { Quiz, Question, LeaderboardEntry } from '@/types/quiz';
import { Clock, Trophy } from 'lucide-react';

import { Clock, Trophy, ChevronLeft, MoreHorizontal, User, Layout, Search, Home, Settings as SettingsIcon, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PlayClient() {
  const params = useParams();
  const router = useRouter();
  const quizId = Array.isArray(params?.quizId) ? params?.quizId[0] : params?.quizId || '';

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [participantId, setParticipantId] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardTab, setLeaderboardTab] = useState<'Week' | 'Month' | 'Year'>('Week');

  useEffect(() => {
    const storedId = localStorage.getItem('participantId');
    const storedName = localStorage.getItem('participantName');
    const storedQuizId = localStorage.getItem('quizId');

    if (!storedId || !storedName || storedQuizId !== quizId) {
      router.push('/join');
      return;
    }

    setParticipantId(storedId);
    setParticipantName(storedName);

    const unsubQuiz = subscribeToQuiz(quizId, setQuiz);
    const unsubQuestions = subscribeToQuestions(quizId, setQuestions);

    return () => {
      unsubQuiz();
      unsubQuestions();
    };
  }, [quizId, router]);

  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [quiz?.currentQuestionIndex]);

  useEffect(() => {
    if (quiz?.status === 'completed') {
      loadLeaderboard();
    }
  }, [quiz?.status]);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(quizId);
    setLeaderboard(data);
  };

  useEffect(() => {
    if (!quiz || quiz.status !== 'active' || !quiz.questionStartTime || hasAnswered) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const interval = setInterval(() => {
      const elapsed = Date.now() - quiz.questionStartTime!;
      const remaining = Math.max(0, currentQuestion.timeLimit * 1000 - elapsed);
      setTimeRemaining(Math.ceil(remaining / 1000));

      if (remaining <= 0 && !hasAnswered) {
        handleTimeout();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [quiz, questions, hasAnswered]);

  const handleTimeout = async () => {
    if (!quiz || hasAnswered) return;
    setHasAnswered(true);

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    try {
      await submitAnswer(quizId, participantId, {
        questionId: currentQuestion.id,
        selectedOptionIndex: -1,
        answeredAt: Date.now(),
        isCorrect: false,
        pointsEarned: 0,
        timeToAnswer: currentQuestion.timeLimit * 1000
      });
    } catch (error) {
      console.error('Error submitting timeout:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (selectedOption === null || hasAnswered || !quiz) return;

    const currentQuestion = questions[quiz.currentQuestionIndex];
    if (!currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctOptionIndex;
    const timeToAnswer = Date.now() - quiz.questionStartTime!;
    let pointsEarned = 0;
    if (isCorrect) {
      const timeRatio = 1 - (timeToAnswer / (currentQuestion.timeLimit * 1000));
      pointsEarned = Math.round(currentQuestion.points * Math.max(0.5, timeRatio));
    }

    try {
      await submitAnswer(quizId, participantId, {
        questionId: currentQuestion.id,
        selectedOptionIndex: selectedOption,
        answeredAt: Date.now(),
        isCorrect,
        pointsEarned,
        timeToAnswer
      });
      setHasAnswered(true);
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  if (!quiz) return <div className="p-8">Loading...</div>;

  const currentQuestion = quiz.currentQuestionIndex >= 0 ? questions[quiz.currentQuestionIndex] : null;

  // ══════════════════════════════════════════════════════════════════════════
  // LOBBY VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (quiz.status === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-8 animate-pulse">
           <Trophy className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter italic">Lobby Phase</h1>
        <p className="text-slate-500 max-w-xs mb-12">Waiting for the host to initiate the quiz. Hang tight, {participantName}!</p>
        <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-primary"
          />
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ACTIVE QUIZ VIEW (Matches Screen 2)
  // ══════════════════════════════════════════════════════════════════════════
  if (quiz.status === 'active') {
    if (!currentQuestion) {
      return (
        <div className="min-h-screen bg-[#f0eaff] flex items-center justify-center p-6 text-center">
           <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="font-black italic uppercase tracking-tighter text-slate-400">Loading Question...</p>
           </div>
        </div>
      );
    }
    
    const progress = ((quiz.currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-[100dvh] bg-[#f0eaff] flex flex-col pt-12 pb-10 px-6 overflow-hidden text-slate-900">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
           <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center border border-slate-100">
              <ChevronLeft className="w-6 h-6" />
           </button>
           <div className="w-16 h-12 bg-white rounded-full shadow-xl flex items-center justify-center border border-slate-100 font-bold">
              {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
           </div>
        </header>

        {/* Question Header */}
        <div className="mb-6 flex flex-col gap-2">
           <p className="text-2xl font-black tracking-tighter">Q. {quiz.currentQuestionIndex + 1}</p>
           <div className="w-full h-1 bg-white/50 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
              />
           </div>
        </div>

        {/* Question Text */}
        <div className="flex-1 flex flex-col">
           <h2 className="text-3xl font-black leading-tight mb-12 text-slate-800">
             {currentQuestion.questionText}
           </h2>

           {/* Options Grid */}
           <div className="space-y-4 mb-20">
             {currentQuestion.options.map((option, index) => (
               <button
                 key={index}
                 onClick={() => !hasAnswered && setSelectedOption(index)}
                 disabled={hasAnswered}
                 className={`w-full p-4 rounded-3xl text-left transition-all flex items-center gap-4 border-2 shadow-lg ${
                   selectedOption === index
                     ? 'bg-purple-100 border-purple-400'
                     : 'bg-white border-transparent'
                 } ${hasAnswered ? 'opacity-70' : 'active:scale-[0.98]'}`}
               >
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                   selectedOption === index ? 'border-primary bg-primary' : 'border-slate-200'
                 }`}>
                    {selectedOption === index && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                 </div>
                 <span className="font-bold text-lg text-slate-700">{option}</span>
               </button>
             ))}
           </div>

           {/* Bottom Buttons */}
           <div className="flex gap-4 mt-auto">
             <button className="flex-1 h-16 bg-white rounded-3xl font-black text-slate-400 tracking-tighter border border-slate-100 shadow-xl opacity-50 cursor-not-allowed">Previous</button>
             <button 
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null || hasAnswered}
                className={`flex-1 h-16 rounded-3xl font-black tracking-tighter shadow-[0_10px_30px_-5px_rgba(var(--primary),0.3)] hover:scale-105 transition-all text-black ${
                  selectedOption === null || hasAnswered ? 'bg-slate-300' : 'bg-primary'
                }`}
              >
                {hasAnswered ? 'Wait...' : 'Next'}
              </button>
           </div>
        </div>

        {/* Background illustration */}
        <div className="absolute bottom-12 right-0 opacity-20 pointer-events-none translate-x-12">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180Z" stroke="#ccff00" strokeWidth="2" strokeDasharray="10 10" />
              <path d="M60 100L90 130L140 70" stroke="#ccff00" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COMPLETED VIEW / LEADERBOARD (Matches Screen 3)
  // ══════════════════════════════════════════════════════════════════════════
  if (quiz.status === 'completed') {
    const topThree = leaderboard.slice(0, 3);
    const userRank = leaderboard.find(e => e.participantId === participantId);

    return (
      <div className="min-h-[100dvh] bg-[#f0f954] flex flex-col pt-12 pb-24 px-6 overflow-hidden text-slate-900 relative">
        <header className="flex justify-between items-center mb-8">
           <p className="text-3xl font-black uppercase tracking-tighter">Leaderboard</p>
           <button className="w-12 h-12 rounded-full bg-slate-900/10 flex items-center justify-center">
              <Grid className="w-6 h-6" />
           </button>
        </header>

        {/* Tabs */}
        <div className="bg-white/50 backdrop-blur-xl p-1.5 rounded-3xl flex mb-12 shadow-sm">
           {['Week', 'Month', 'Year'].map((tab) => (
             <button
                key={tab}
                onClick={() => setLeaderboardTab(tab as any)}
                className={`flex-1 py-3 rounded-[1.25rem] font-bold text-sm transition-all ${
                  leaderboardTab === tab ? 'bg-purple-300 text-slate-800 shadow-md' : 'text-slate-500'
                }`}
             >
                {tab}
             </button>
           ))}
        </div>

        {/* Podium */}
        <div className="flex items-end justify-center gap-2 mb-12">
            {/* Rank 3 */}
            {topThree[2] && (
              <div className="flex flex-col items-center flex-1">
                 <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden mb-2 bg-white shadow-lg">
                    <User className="w-full h-full text-slate-300" />
                 </div>
                 <p className="font-bold text-xs mb-2">{topThree[2].name}</p>
                 <div className="w-full h-24 bg-white/40 rounded-t-3xl relative flex flex-col items-center pt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-1">{topThree[2].totalScore}</div>
                    <p className="font-black text-xl text-slate-500">#3</p>
                 </div>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="flex flex-col items-center flex-1">
                 <div className="relative">
                    <Medal className="w-8 h-8 text-slate-800 absolute -top-4 -right-1 z-10 transform rotate-12" />
                    <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden mb-2 bg-white shadow-2xl relative z-0">
                        <User className="w-full h-full text-slate-400" />
                    </div>
                 </div>
                 <p className="font-black text-sm mb-2">{topThree[0].name}</p>
                 <div className="w-full h-40 bg-purple-300 rounded-t-3xl relative flex flex-col items-center pt-2 shadow-2xl">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold mb-2">{topThree[0].totalScore}</div>
                    <Trophy className="w-8 h-8 text-slate-800 mb-1" />
                    <p className="font-black text-2xl text-slate-900">#1</p>
                 </div>
              </div>
            )}

            {/* Rank 2 */}
            {topThree[1] && (
              <div className="flex flex-col items-center flex-1">
                 <div className="w-16 h-16 rounded-full border-2 border-white overflow-hidden mb-2 bg-white shadow-lg">
                    <User className="w-full h-full text-slate-300" />
                 </div>
                 <p className="font-bold text-xs mb-2">{topThree[1].name}</p>
                 <div className="w-full h-32 bg-white/60 rounded-t-3xl relative flex flex-col items-center pt-2">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold mb-2">{topThree[1].totalScore}</div>
                    <p className="font-black text-xl text-slate-700">#2</p>
                 </div>
              </div>
            )}
        </div>

        {/* User Status Card */}
        <div className="bg-white/90 p-6 rounded-[2.5rem] shadow-xl border border-white flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-slate-900">
                 <Zap className="w-6 h-6" />
              </div>
              <div>
                 <p className="font-black text-sm uppercase tracking-tighter">Your Score: {userRank?.totalScore || 0}</p>
                 <p className="text-[10px] text-slate-500 font-bold uppercase">Keep it up! Reach for the top.</p>
              </div>
           </div>
        </div>

        {/* Bottom Nav */}
        <nav className="fixed bottom-6 left-6 right-6 h-20 bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-around px-4 border border-white/10 backdrop-blur-sm z-50">
          <button className="p-4 text-slate-400 hover:text-white transition-colors" onClick={() => router.push('/')}>
            <Home className="w-6 h-6" />
          </button>
          <button className="p-4 text-slate-400 hover:text-white transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button className="p-4 bg-primary rounded-full text-black">
            <TrophyIcon className="w-6 h-6" />
          </button>
          <button className="p-4 text-slate-400 hover:text-white transition-colors">
            <SettingsIcon className="w-6 h-6" />
          </button>
        </nav>
      </div>
    );
  }

  return null;
}
