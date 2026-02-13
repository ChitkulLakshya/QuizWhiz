'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Terminal, Cpu, Zap, AlertTriangle } from 'lucide-react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';
import { createQuiz } from '@/lib/firebase-service';
import clsx from 'clsx';

export default function CreateQuiz() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user || !user.email) {
        console.log('⛔ Access Denied: No Active Session');
        router.push('/login');
        return;
      }
      console.log('✅ Logged in as:', user.email);
      setUserEmail(user.email);
      setCheckingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Error: Title Required');
      return;
    }

    if (!userEmail) {
      alert('Error: Please log in again.');
      router.push('/login');
      return;
    }

    setLoading(true);

    try {
      const quizId = await createQuiz(title, description, userEmail, auth.currentUser?.uid || "");
      console.log('✅ Quiz Created:', quizId);
      router.push(`/admin/quiz/${quizId}/edit`);
    } catch (error) {
      console.error('🔥 Creation Failed:', error);
      alert('Error: Failed to create quiz');
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#ccff00] font-mono">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Cpu className="w-12 h-12" />
          <span className="tracking-widest">Verifying Access...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden">

      {/* Background Noise & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      <main className="flex-1 p-4 md:p-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-2xl">

          {/* Header & Back Nav */}
          <div className="mb-8 flex flex-col gap-2">
            <Link href="/admin" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#ccff00] transition-colors font-mono text-xs uppercase tracking-widest mb-4 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>

            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              Create <span className="text-[#ccff00]">Quiz</span>
            </h1>
            <div className="flex items-center gap-2 text-gray-500 font-mono text-xs">
              <span className="w-2 h-2 bg-[#ccff00] rounded-full animate-pulse"></span>
              Admin: {userEmail?.split('@')[0]}
            </div>
          </div>

          {/* Terminal Input Frame */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ccff00] to-[#050505] opacity-20 blur group-hover:opacity-40 transition-opacity"></div>
            <div className="relative bg-[#0a0a0a] border border-[#333] p-1">

              {/* Visual Header of Panel */}
              <div className="h-6 bg-[#111] flex items-center justify-between px-3 border-b border-[#333]">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
                <span className="text-[10px] font-mono text-gray-600 uppercase"></span>
              </div>

              <div className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-8">

                  {/* Title Input */}
                  <div className="space-y-2 group/input">
                    <label htmlFor="title" className="flex items-center gap-2 text-xs font-mono text-[#ccff00] uppercase tracking-widest">
                      <Terminal className="w-3 h-3" />
                      Quiz Title
                    </label>
                    <div className="relative">
                      <input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter quiz title..."
                        className="w-full bg-[#050505] border border-[#333] p-4 text-white font-mono placeholder:text-gray-800 focus:border-[#ccff00] focus:outline-none focus:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all uppercase"
                        required
                        disabled={loading}
                        autoFocus
                      />
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-[#ccff00] opacity-50"></div>
                    </div>
                  </div>

                  {/* Description Input */}
                  <div className="space-y-2 group/input">
                    <label htmlFor="description" className="flex items-center gap-2 text-xs font-mono text-gray-500 uppercase tracking-widest group-focus-within/input:text-[#ccff00] transition-colors">
                      <Cpu className="w-3 h-3" />
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Optional description..."
                      rows={4}
                      className="w-full bg-[#050505] border border-[#333] p-4 text-white font-mono placeholder:text-gray-800 focus:border-[#ccff00] focus:outline-none focus:shadow-[0_0_15px_rgba(204,255,0,0.1)] transition-all uppercase resize-none"
                      disabled={loading}
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={loading || !title.trim()}
                    className="w-full h-14 bg-[#ccff00] relative group/btn overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-500"></div>

                    <div className="flex items-center justify-center gap-3 relative z-10 text-black font-black uppercase tracking-widest group-hover/btn:tracking-[0.3em] transition-all">
                      {loading ? (
                        <>
                          <Zap className="w-4 h-4 animate-spin" />
                          <span>Creating...</span>
                        </>
                      ) : (
                        <>
                          <span>Create</span>
                          <Terminal className="w-4 h-4" />
                        </>
                      )}
                    </div>
                  </button>

                </form>
              </div>
            </div>

            {/* Decorative Footprint */}
            <div className="mt-2 flex justify-between text-[10px] font-mono text-gray-700 uppercase">
              <span>Secure</span>
              <span>PING: 14ms</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
