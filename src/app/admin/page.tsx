'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, PlayCircle, Clock, BarChartHorizontal, Trash2, Power, Terminal, ShieldAlert, Activity, Search } from 'lucide-react';
import { getQuizzes, deleteQuiz } from '@/lib/firebase-service';
import { Quiz } from '@/types/quiz';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/firebase';
import clsx from 'clsx';

export default function AdminDashboard() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        loadQuizzes(user.uid);
      } else {
        setQuizzes([]);
        setLoading(false);
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const loadQuizzes = async (userId: string) => {
    try {
      const quizData = await getQuizzes(userId);
      setQuizzes(quizData);
    } catch (error) {
      console.error('Error loading quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to delete this? This action cannot be undone.')) return;

    try {
      await deleteQuiz(quizId);
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('PURGE FAILED');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] font-display text-white relative overflow-hidden flex flex-col pb-20 md:pb-0">

      {/* Background Noise & Scanlines */}
      <div className="fixed inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Command Deck Header */}
      <header className="sticky top-0 z-50 bg-[#050505]/90 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#ccff00] flex items-center justify-center text-black rounded-sm shadow-[0_0_10px_rgba(204,255,0,0.5)]">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-tighter text-white leading-none">Admin Dashboard</h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00] animate-pulse"></div>
                <span className="text-[10px] font-mono text-[#ccff00] tracking-widest uppercase">Online</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Admin User</span>
              <span className="text-xs text-white font-mono">{user?.email?.split('@')[0]}</span>
            </div>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-400 hover:bg-red-500/10 font-mono uppercase text-xs tracking-wider gap-2"
            >
              <Power className="w-4 h-4" />
              <span className="hidden sm:inline">Log Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 relative z-10">

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
          <div className="relative w-full sm:w-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-600" />
            </div>
            <input
              type="text"
              placeholder="Search Quizzes..."
              className="w-full sm:w-64 bg-[#0a0a0a] border border-[#333] pl-10 pr-4 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#ccff00] focus:shadow-[0_0_10px_rgba(204,255,0,0.2)] transition-all uppercase placeholder:text-gray-700"
            />
          </div>

          <Link href="/admin/create" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto group relative h-10 px-6 bg-[#ccff00] flex items-center justify-center gap-2 overflow-hidden">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <PlusCircle className="w-4 h-4 text-black relative z-10" />
              <span className="text-black font-bold uppercase tracking-widest text-xs relative z-10">CREATE QUIZ</span>
            </button>
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-6 opacity-80">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-16 h-16 border-4 border-[#ccff00]/30 rounded-full animate-ping"></div>
              <div className="absolute w-12 h-12 border-2 border-[#ccff00] rounded-full animate-spin border-t-transparent"></div>
              <Terminal className="w-6 h-6 text-[#ccff00]" />
            </div>
            <p className="text-[#ccff00] font-mono text-xs animate-pulse uppercase tracking-[0.2em]">Loading...</p>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="border border-dashed border-[#333] bg-[#0a0a0a] rounded-lg p-12 text-center flex flex-col items-center gap-4">
            <ShieldAlert className="w-12 h-12 text-gray-600" />
            <div className="space-y-1">
              <h3 className="text-white font-bold uppercase tracking-wider">No Quizzes Found</h3>
              <p className="text-gray-500 font-mono text-xs">No active quizzes found.</p>
            </div>
            <Link href="/admin/create">
              <Button variant="outline" className="border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00] hover:text-black font-mono uppercase text-xs">
                Create First Quiz
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="group relative bg-[#0a0a0a] border border-[#333] hover:border-[#ccff00] transition-colors duration-300 overflow-hidden"
              >
                {/* Corner Accents */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#ccff00] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <CardContent className="p-6 space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="bg-[#111] px-2 py-1 border border-[#333] text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                        Code: {quiz.code}
                      </div>
                      <div className={clsx(
                        "w-2 h-2 rounded-full",
                        (quiz.status === 'lobby' || quiz.status === 'active') ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-yellow-500"
                      )}></div>
                    </div>
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white group-hover:text-[#ccff00] transition-colors truncate">
                      {quiz.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-[#222] pt-4">
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-600 font-mono uppercase block">Created</span>
                      <div className="flex items-center gap-1.5 text-xs text-gray-300">
                        <Clock className="w-3 h-3 text-[#ccff00]" />
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] text-gray-600 font-mono uppercase block">State</span>
                      <span className="text-xs text-gray-300 uppercase">{quiz.status}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2">
                    <div className="flex gap-2">
                      <Link href={`/admin/quiz/${quiz.id}/edit`}>
                        <button className="h-8 px-3 border border-[#333] hover:border-white hover:bg-white hover:text-black text-xs font-mono uppercase transition-colors">
                          Edit
                        </button>
                      </Link>
                      <Link href={`/admin/quiz/${quiz.id}/leaderboard`}>
                        <button className="h-8 px-3 border border-[#333] hover:border-blue-400 hover:text-blue-400 text-xs font-mono uppercase transition-colors flex items-center gap-1">
                          <BarChartHorizontal className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>

                    <div className="flex gap-2">
                      <Link href={`/admin/quiz/${quiz.id}/control`}>
                        <button className="h-8 px-3 bg-[#ccff00] text-black hover:bg-[#bbee00] text-xs font-bold uppercase overflow-hidden flex items-center gap-1">
                          <PlayCircle className="w-3 h-3" />
                          Clear
                        </button>
                      </Link>
                      <button
                        onClick={(e) => handleDelete(quiz.id, e)}
                        className="h-8 w-8 flex items-center justify-center border border-red-900/30 text-red-900 hover:bg-red-900 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
