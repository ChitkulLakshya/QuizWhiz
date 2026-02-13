'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Lock, Wifi, AlertTriangle, ArrowLeft } from 'lucide-react';
import { getQuizByCode, joinQuiz } from '@/lib/firebase-service';
import { Quiz } from '@/types/quiz';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';

function JoinQuizContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const codeFromUrl = searchParams.get('code') || '';

  const [code, setCode] = useState(codeFromUrl);
  const [name, setName] = useState('');
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, ''); // Remove non-numeric
    val = val.substring(0, 6); // Limit to 6
    setCode(val);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value.substring(0, 15)); // Limit name length
  };

  const handleAction = async () => {
    setError('');
    if (!quiz) {
      if (code.length !== 6) return;
      setLoading(true);
      try {
        const foundQuiz = await getQuizByCode(code);
        if (foundQuiz) {
          if (foundQuiz.status !== 'lobby') {
            setError('Session Ended');
            return;
          }
          setQuiz(foundQuiz);
        } else {
          setError('Invalid Game Code');
        }
      } catch (err) {
        console.error(err);
        setError('Connection Failed');
      } finally {
        setLoading(false);
      }
    }
    else {
      if (!name.trim()) return;
      setLoading(true);
      try {
        const participantId = await joinQuiz(quiz.id, name);
        localStorage.setItem('participantId', participantId);
        localStorage.setItem('participantName', name);
        localStorage.setItem('quizId', quiz.id);
        router.push(`/play/${quiz.id}`);
      } catch (err) {
        console.error(err);
        setError('Failed to Join');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (codeFromUrl && codeFromUrl.length === 6 && !quiz && !loading) {
    }
  }, [codeFromUrl, quiz, loading]);


  return (
    <div className="relative flex h-[100dvh] w-full flex-col bg-[#050505] overflow-hidden font-sans text-white selection:bg-[#ccff00] selection:text-black">

      {/* Background Elements */}
      {/* Giant Lock Icon Wireframe (Bottom Right) */}
      <div className="absolute -bottom-12 -right-12 z-0 pointer-events-none opacity-5 mix-blend-screen overflow-hidden">
        {/* Using Lucide Lock as placeholder for material symbol 400px */}
        <Lock strokeWidth={0.5} className="w-[400px] h-[400px] text-white" />
      </div>
      {/* Scanlines overlay */}
      <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>
      {/* Vignette */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(5,5,5,0.8)_100%)]"></div>


      {/* Header / Status Bar Area */}
      <div className="flex items-center justify-between p-6 z-20 relative">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#ccff00] animate-pulse"></div>
          <span className="text-[10px] tracking-[0.2em] text-[#ccff00]/80 font-mono">
            {quiz ? 'Game Found' : 'Enter Code'}
          </span>
        </div>
        <Wifi className="text-[#ccff00]/60 w-5 h-5" />
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 relative flex flex-col justify-center w-full max-w-md md:max-w-3xl lg:max-w-4xl mx-auto px-6 z-10 pb-24">

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute top-4 left-6 z-50 text-white/50 hover:text-[#ccff00] transition-colors"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        {/* Floating Side Label (Game Code) */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 opacity-20 pointer-events-none select-none hidden md:block">
          <h1 className="text-[120px] leading-none font-bold text-vertical font-mono tracking-tighter text-white whitespace-nowrap" style={{ writingMode: 'vertical-rl' }}>
            {quiz ? 'NAME' : 'GAME CODE'}
          </h1>
        </div>

        {/* Central Interaction Area */}
        <div className="w-full space-y-12">

          {/* Terminal Prompt Text */}
          <div className="text-left space-y-2">
            <p className="text-[#ccff00] text-sm font-mono tracking-widest uppercase mb-1">
            </p>
            <h2 className="text-white text-3xl md:text-5xl font-bold leading-tight uppercase tracking-tight font-display">
              {quiz ? 'Enter Name' : 'Enter Code'}
            </h2>
            {quiz && (
              <div className="inline-block px-2 py-1 bg-[#1a1a1a] border border-[#ccff00]/30 text-[#ccff00] text-xs font-mono">
                Playing: {quiz.title}
              </div>
            )}
          </div>

          {/* Input Container */}
          <div className="relative group">
            <label className="sr-only" htmlFor="variable-input">
              {quiz ? 'Enter Name' : 'Enter Game Code'}
            </label>

            {/* Input Wrapper */}
            <div className={clsx(
              "relative flex items-center justify-center backdrop-blur-sm border-[4px] rounded-full h-24 w-full transition-all duration-300",
              error ? "border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "border-electric-purple shadow-[0_0_10px_rgba(176,11,105,0.4),inset_0_0_10px_rgba(176,11,105,0.2)] bg-deep-black/50"
            )}>
              <input
                id="variable-input"
                autoComplete="off"
                className="w-full bg-transparent border-none text-center text-white text-4xl md:text-5xl font-mono tracking-[0.1em] placeholder:text-white/10 focus:ring-0 focus:outline-none h-full pt-2 uppercase"
                type="text"
                inputMode={quiz ? "text" : "numeric"}
                pattern={quiz ? undefined : "[0-9]*"}
                maxLength={quiz ? 15 : 6}
                placeholder={quiz ? "Your Name" : "00 00 00"}
                value={quiz ? name : code}
                onChange={quiz ? handleNameChange : handleCodeChange}
                onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                autoFocus
              />
            </div>

            {/* Helper Text / Error Message */}
            <div className="flex justify-between items-center mt-4 px-4 h-6">
              {error ? (
                <div className="flex items-center gap-2 text-red-500 animate-pulse">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs font-mono font-bold tracking-wider">{error}</span>
                </div>
              ) : (
                <>
                  <span className="text-xs text-white/40 font-mono">
                    {quiz ? 'Max Length: 15' : 'SECURE ENTRY'}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-electric-purple">
                    <Lock className="w-3 h-3" />
                    <span className="font-mono">SECURE</span>
                  </div>
                </>
              )}

            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleAction}
            disabled={loading || (quiz ? !name.trim() : code.length !== 6)}
            className="w-full bg-[#ccff00] hover:bg-[#bbee00] disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-200 h-16 flex items-center justify-center rounded-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] group"
          >
            <span className="text-black text-xl font-bold tracking-[0.1em] group-hover:tracking-[0.15em] transition-all font-display uppercase">
              {loading ? 'Joining...' : (quiz ? 'Join Game' : 'Find Game')}
            </span>
            {!loading && <ArrowRight className="ml-2 text-black font-bold group-hover:translate-x-1 transition-transform w-6 h-6" />}
          </button>

          {/* Back / Cancel */}
          {quiz && (
            <button
              onClick={() => { setQuiz(null); setCode(''); setError(''); }}
              className="w-full text-white/40 hover:text-white text-xs font-mono tracking-widest text-center uppercase mt-4 transition-colors"
            >
              Cancel
            </button>
          )}

        </div>
      </div>
    </div>
  );
}

export default function JoinQuiz() {
  return (
    <Suspense fallback={<div className="h-screen w-full bg-[#050505] flex items-center justify-center text-[#ccff00] font-mono">Loading...</div>}>
      <JoinQuizContent />
    </Suspense>
  );
}
