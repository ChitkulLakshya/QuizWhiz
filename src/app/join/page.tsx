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
    const autoJoin = async () => {
      if (codeFromUrl && codeFromUrl.length === 6 && !quiz && !loading && !error) {
        setLoading(true);
        try {
          const foundQuiz = await getQuizByCode(codeFromUrl);
          if (foundQuiz) {
            if (foundQuiz.status !== 'lobby') {
              setError('Session Ended');
            } else {
              setQuiz(foundQuiz);
            }
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
    };
    autoJoin();
  }, [codeFromUrl, quiz, loading, error]);


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
      <div className="flex items-center justify-between px-6 py-4 z-20 relative bg-black/40 backdrop-blur-md border-b border-[#ccff00]/10">
        <div className="flex items-center gap-2">
          <div className={clsx("h-2 w-2 rounded-full animate-pulse", quiz ? "bg-[#ccff00]" : "bg-electric-purple")} />
          <span className={clsx("text-[10px] tracking-[0.2em] font-mono", quiz ? "text-[#ccff00]/80" : "text-electric-purple/80")}>
            {quiz ? `ESTABLISHED: ${quiz.title.toUpperCase()}` : 'WAITING FOR UPLINK...'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Wifi className="text-[#ccff00]/40 w-4 h-4" />
        </div>
      </div>

      {/* Main Content Wrapper */}
      <div className="flex-1 relative flex flex-col justify-center w-full max-w-sm mx-auto px-6 z-10 -mt-12">

        {/* Back Button */}
        <button
          onClick={() => router.push('/')}
          className="absolute -top-12 left-6 z-50 text-white/30 hover:text-[#ccff00] transition-colors flex items-center gap-2 text-[10px] font-mono tracking-widest uppercase"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit</span>
        </button>

        {/* Central Interaction Area */}
        <div className="w-full space-y-8">

          {/* Terminal Prompt Text */}
          <div className="text-left space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-[1px] w-8 bg-[#ccff00]/40" />
              <span className="text-[#ccff00] text-[10px] font-mono tracking-[0.3em] uppercase">
                {quiz ? 'Identity Verification' : 'Protocol Entry'}
              </span>
            </div>
            <h2 className="text-white text-4xl font-black leading-none uppercase tracking-tight font-display">
              {quiz ? 'Join' : 'Enter'} <br />
              <span className="text-outline-white text-[#050505] drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]">
                {quiz ? 'Session' : 'Uplink'}
              </span>
            </h2>
          </div>

          {/* Input Container */}
          <div className="relative group">
            <label className="sr-only" htmlFor="variable-input">
              {quiz ? 'Enter Name' : 'Enter Game Code'}
            </label>

            {/* Input Wrapper */}
            <div className={clsx(
              "relative flex items-center justify-center backdrop-blur-xl border-[2px] rounded-xl h-20 w-full transition-all duration-500 overflow-hidden",
              error 
                ? "border-red-500/50 bg-red-500/5" 
                : "border-white/10 bg-white/5 hover:border-[#ccff00]/40 group-focus-within:border-[#ccff00]/60"
            )}>
              {/* Animated corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#ccff00] opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#ccff00] opacity-0 group-focus-within:opacity-100 transition-opacity" />

              <input
                id="variable-input"
                autoComplete="off"
                className="w-full bg-transparent border-none text-center text-white text-3xl font-mono tracking-[0.15em] placeholder:text-white/5 focus:ring-0 focus:outline-none h-full pt-1 uppercase"
                type="text"
                inputMode={quiz ? "text" : "numeric"}
                pattern={quiz ? undefined : "[0-9]*"}
                maxLength={quiz ? 15 : 6}
                placeholder={quiz ? "IDENTITY" : "000000"}
                value={quiz ? name : code}
                onChange={quiz ? handleNameChange : handleCodeChange}
                onKeyDown={(e) => e.key === 'Enter' && handleAction()}
                autoFocus
              />
              
              {/* Background Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(204,255,0,0.05)_0%,transparent_100%)] pointer-events-none" />
            </div>

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 text-red-500 font-mono text-[10px] uppercase tracking-wider justify-center"
              >
                <AlertTriangle className="w-3 h-3" />
                {error}
              </motion.div>
            )}

          {/* Action Button */}
          <button
            onClick={handleAction}
            disabled={loading || (quiz ? !name.trim() : code.length !== 6)}
            className={clsx(
              "w-full h-14 relative flex items-center justify-center transition-all duration-300 active:scale-[0.98] group overflow-hidden mt-8",
              quiz 
                ? "bg-[#ccff00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]" 
                : "bg-white/10 hover:bg-white/20 border border-white/10"
            )}
          >
            {/* Button Inner Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />
            
            <span className={clsx(
              "text-sm font-bold tracking-[0.2em] transition-all uppercase font-mono",
              quiz ? "text-black" : "text-white/60 group-hover:text-white"
            )}>
              {loading ? 'Processing...' : (quiz ? 'Secure Entry' : 'Verify Uplink')}
            </span>
            {!loading && <ArrowRight className={clsx("ml-3 w-4 h-4 transition-transform group-hover:translate-x-1", quiz ? "text-black" : "text-white/40")} />}
          </button>

          {/* Back / Cancel */}
          {quiz && !loading && (
            <button
              onClick={() => { setQuiz(null); setCode(''); setError(''); }}
              className="w-full text-white/20 hover:text-red-500/60 text-[10px] font-mono tracking-[0.3em] text-center uppercase transition-colors mt-4"
            >
              Abort Protocol
            </button>
          )}
        </div>
      </div>
    </div>

    <style jsx global>{`
      @keyframes shimmer {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      .text-outline-white {
        -webkit-text-stroke: 1px rgba(255,255,255,0.2);
      }
    `}</style>
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
