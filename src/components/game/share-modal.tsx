'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Check, Share2, Terminal } from 'lucide-react';
import QRCode from 'react-qr-code';
import clsx from 'clsx';

interface ShareModalProps {
    quizId: string;
    quizCode: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ quizId, quizCode, isOpen, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false);
    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/play/${quizId}`
        : '';

    const handleCopy = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md bg-[#050505] border-2 border-[#ccff00] text-white p-0 overflow-hidden shadow-[0_0_50px_rgba(204,255,0,0.15)]">

                {/* Visual Header Strip */}
                <div className="h-2 w-full bg-repeating-linear-gradient-45 from-[#ccff00] to-[#ccff00] from-[0px] to-[10px] via-transparent via-[10px] via-[20px] opacity-20"></div>

                <div className="p-6">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-center font-black uppercase tracking-widest text-[#ccff00] flex items-center justify-center gap-2 text-xl font-display">
                            <Share2 className="w-5 h-5 animate-pulse" />
                            <span>Share Quiz</span>
                        </DialogTitle>
                        <DialogDescription className="text-center font-mono text-xs text-gray-500 uppercase tracking-wide">
                            Share this code to invite players
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center space-y-8">

                        {/* QR Code Container */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-[#ccff00]/30 blur-sm group-hover:bg-[#ccff00]/50 transition-all"></div>
                            <div className="relative p-2 bg-white border-4 border-[#ccff00] shadow-[0_0_15px_rgba(204,255,0,0.3)]">
                                <div className="absolute top-0 left-0 w-2 h-2 bg-black"></div>
                                <div className="absolute top-0 right-0 w-2 h-2 bg-black"></div>
                                <div className="absolute bottom-0 left-0 w-2 h-2 bg-black"></div>
                                <div className="absolute bottom-0 right-0 w-2 h-2 bg-black"></div>
                                <QRCode value={shareUrl} size={160} />
                            </div>
                        </div>

                        <div className="w-full space-y-6">

                            {/* Code Display */}
                            <div className="text-center relative">
                                <div className="absolute inset-x-0 top-1/2 h-px bg-[#333] -z-10"></div>
                                <span className="bg-[#050505] px-2 text-[10px] text-gray-500 font-mono uppercase tracking-widest">Game Code</span>
                            </div>

                            <div className="bg-[#111] border border-[#333] p-4 text-center relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-[#ccff00] opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                <p className="text-4xl font-black text-white tracking-[0.2em] font-mono group-hover:text-[#ccff00] transition-colors glitch-text">
                                    {quizCode}
                                </p>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleCopy}
                                className={clsx(
                                    "group w-full h-14 relative flex items-center justify-center font-bold uppercase tracking-widest transition-all",
                                    copied ? "bg-[#ccff00] text-black" : "bg-transparent border border-[#ccff00] text-[#ccff00] hover:bg-[#ccff00]/10"
                                )}
                            >
                                <div className="absolute top-0 right-0 w-0 h-0 border-t-[8px] border-r-[8px] border-t-transparent border-r-current opacity-50"></div>
                                <div className="absolute bottom-0 left-0 w-0 h-0 border-b-[8px] border-l-[8px] border-b-current border-l-transparent opacity-50"></div>

                                <div className="flex items-center gap-2 relative z-10">
                                    {copied ? <Check className="w-4 h-4" /> : <Terminal className="w-4 h-4" />}
                                    <span className="font-mono text-sm">{copied ? 'Copied!' : 'Copy Link'}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Decor */}
                <div className="bg-[#111] py-2 px-4 flex justify-between items-center border-t border-[#222]">
                    <span className="text-[10px] text-gray-600 font-mono uppercase">Secure Share</span>
                    <div className="flex gap-1">
                        <div className="w-1 h-1 bg-[#ccff00] rounded-full animate-ping"></div>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                        <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
