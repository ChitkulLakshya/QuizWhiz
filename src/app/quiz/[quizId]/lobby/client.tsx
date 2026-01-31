'use client';

import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { useParams } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Users, PlayCircle, Loader2, Wifi, Radio } from 'lucide-react';
import { mockQuizzes, mockParticipants } from '@/lib/mock-data';
import type { Quiz } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import clsx from 'clsx';

export default function QuizLobby() {
  const params = useParams();
  const quizId = params.quizId as string;
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
      title: "SEQUENCE INITIATED",
      description: "BROADCASTING DATA STREAM..."
    });
  };

  if (!quiz) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#050505] text-[#ccff00]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Radio className="w-12 h-12" />
          <span className="font-mono tracking-widest">SEARCHING FREQUENCY...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      <Header />

      <main className="flex-1 p-4 md:p-8 flex flex-col relative z-10">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-[#333] bg-[#0a0a0a] rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest">System Online</span>
          </div>
          <h1 className="font-black text-4xl md:text-7xl uppercase tracking-tighter text-white">{quiz.title}</h1>
          <p className="text-[#ccff00] font-mono text-sm md:text-lg uppercase tracking-widest">Public Uplink Active</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto w-full items-center">

          {/* QR Code Section */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative group">
              {/* Decorative Frame */}
              <div className="absolute -inset-4 border-2 border-[#ccff00]/30 rounded-lg group-hover:border-[#ccff00] transition-colors duration-500"></div>
              <div className="absolute -inset-4 border-2 border-[#ccff00]/10 rounded-lg scale-105 animate-pulse"></div>

              <div className="bg-white p-4 rounded shadow-[0_0_30px_rgba(204,255,0,0.2)]">
                {joinUrl && (
                  <QRCode
                    value={joinUrl}
                    size={300}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    viewBox={`0 0 256 256`}
                  />
                )}
              </div>
            </div>
            <p className="mt-8 font-mono text-gray-500 uppercase tracking-widest text-xs flex items-center gap-2">
              <Wifi className="w-4 h-4 animate-pulse" /> Scan for Secure Connection
            </p>
          </div>

          {/* Participants & Action */}
          <div className="space-y-8 flex flex-col h-full justify-center">

            <div className="bg-[#0a0a0a] border border-[#333] p-6 relative overflow-hidden min-h-[300px] flex flex-col">
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <Users className="w-24 h-24 text-[#222]" />
              </div>

              <h2 className="text-xl font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
                <div className="w-2 h-6 bg-[#ccff00]"></div>
                Connected Agents ({mockParticipants.length})
              </h2>

              <div className="flex-1 flex flex-wrap content-start gap-3 relative z-10">
                {mockParticipants.map(p => (
                  <div key={p.id} className="bg-[#111] border border-[#333] text-white px-4 py-2 font-mono text-sm uppercase flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ccff00]"></div>
                    {p.name}
                  </div>
                ))}
                <div className="bg-[#111]/50 border border-dashed border-[#333] text-gray-600 px-4 py-2 font-mono text-sm uppercase animate-pulse">
                  Scanning...
                </div>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full h-20 text-xl bg-[#ccff00] hover:bg-white text-black font-black uppercase tracking-widest transition-all rounded-none hover:translate-y-[-4px] hover:shadow-[0_10px_20px_rgba(204,255,0,0.2)]"
              onClick={handleStartQuiz}
            >
              <PlayCircle className="h-8 w-8 mr-4" /> Initialize Sequence
            </Button>

          </div>
        </div>
      </main>
    </div>
  );
}



