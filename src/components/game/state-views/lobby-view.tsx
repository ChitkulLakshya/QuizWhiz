'use client';

import { Participant, Quiz } from '@/types/quiz';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import QRCode from 'react-qr-code';
import { Activity, Users, Zap, User as UserIcon, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';

interface LobbyViewProps {
    quiz: Quiz;
    participants: Participant[];
    currentParticipant: Participant | null;
    joinUrl: string;
    isHost: boolean;
    onJoin: (name: string) => void;
}

export function LobbyView({ quiz, participants, currentParticipant, joinUrl, isHost, onJoin }: LobbyViewProps) {

    return (
        <div className="flex flex-col items-center min-h-[calc(100vh-80px)] w-full max-w-md mx-auto bg-black p-6 font-display text-white relative overflow-hidden pt-16 md:pt-6">

            {/* Back Button */}
            <button
                onClick={() => window.location.href = '/'}
                className="absolute top-4 left-4 z-50 text-white/50 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Bg Grid */}
            <div className="absolute inset-0 pointer-events-none opacity-10" style={{
                backgroundImage: 'linear-gradient(#444 1px, transparent 1px), linear-gradient(90deg, #444 1px, transparent 1px)',
                backgroundSize: '20px 20px',
            }}></div>

            <div className="text-center space-y-4 relative z-10 w-full mb-8">
                <Badge variant="outline" className="text-xs px-2 py-1 border-[#ccff00]/40 text-[#ccff00] font-mono tracking-widest uppercase mb-4">
                    SECURE_CHANNEL: {quiz.code}
                </Badge>

                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase leading-none font-archivo">
                    {quiz.title}
                </h1>

                <div className="flex justify-center items-center gap-4 text-xs font-mono text-gray-500">
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>PLAYERS: {participants.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span>STATUS: WAITING</span>
                    </div>
                </div>
            </div>

            {/* Join Form / Status */}
            {!currentParticipant ? (
                <div className="w-full relative z-10">
                    <div className="bg-[#111] border border-[#333] p-4 relative overflow-hidden group hover:border-[#ccff00]/50 transition-colors">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00]"></div>
                        <h3 className="text-[#ccff00] font-mono text-xs mb-2 tracking-widest">Identify Yourself</h3>
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const form = e.target as HTMLFormElement;
                            onJoin((form.elements.namedItem('name') as HTMLInputElement).value);
                        }} className="flex gap-2">
                            <input
                                name="name"
                                className="flex-1 bg-black border-b-2 border-[#333] focus:border-[#ccff00] text-white font-bold p-2 outline-none rounded-none placeholder:text-gray-700 uppercase"
                                placeholder="OPERATOR NAME"
                                autoFocus
                                defaultValue={isHost ? "Host" : ""}
                                autoComplete="off"
                            />
                            <button type="submit" className="bg-[#ccff00] text-black font-bold px-4 uppercase text-sm hover:bg-[#bbee00]">
                                Connect
                            </button>
                        </form>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-[#1a1a1a]/50 border border-[#ccff00]/20 p-6 text-center animate-pulse relative z-10">
                    <Zap className="w-8 h-8 text-[#ccff00] mx-auto mb-2" />
                    <p className="text-xl font-bold text-white font-archivo">UPLINK ESTABLISHED</p>
                    <p className="text-xs text-gray-500 font-mono mt-1">WAITING FOR HOST COMMAND...</p>
                </div>
            )}

            {/* Participants Grid (Matrix Style) */}
            <div className="w-full flex-1 mt-8 relative z-10">
                <h4 className="text-xs font-mono text-gray-600 mb-4 border-b border-gray-800 pb-2">CONNECTED_AGENTS_CACHE</h4>
                <div className="grid grid-cols-2 gap-2 max-h-[30vh] overflow-y-auto pr-2 custom-scrollbar">
                    {participants.map(p => (
                        <div key={p.id} className="bg-[#0a0a0a] border border-[#222] p-2 flex items-center gap-2 group hover:border-[#ccff00]/30 transition-all">
                            <div className="w-2 h-2 bg-[#ccff00] rounded-full opacity-50 group-hover:opacity-100"></div>
                            <span className="font-mono text-xs text-gray-300 truncate">{p.name} {p.id === currentParticipant?.id && '(YOU)'}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QR Code */}
            <div className="mt-auto pt-8 pb-4 relative z-10">
                <div className="bg-white p-2 rounded-sm opacity-90 hover:opacity-100 transition-opacity">
                    <QRCode value={joinUrl} size={100} />
                </div>
            </div>

        </div>
    );
}
