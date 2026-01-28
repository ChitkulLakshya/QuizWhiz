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
import { Copy, Check, Share2 } from 'lucide-react';
import QRCode from 'react-qr-code';

interface ShareModalProps {
    quizId: string;
    quizCode: string;
    isOpen: boolean;
    onClose: () => void;
}

export function ShareModal({ quizId, quizCode, isOpen, onClose }: ShareModalProps) {
    const [copied, setCopied] = useState(false);

    // Use window.location.origin to support any environment
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
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-bold flex items-center justify-center gap-2">
                        <Share2 className="w-6 h-6 text-indigo-600" />
                        Invite Friends
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Share this link or code to invite players to your game.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-6 py-4">
                    <div className="p-4 bg-white rounded-xl shadow-sm border">
                        <QRCode value={shareUrl} size={180} />
                    </div>

                    <div className="w-full space-y-2">
                        <div className="text-center mb-4">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Join Code</p>
                            <p className="text-4xl font-black text-slate-800 tracking-widest">{quizCode}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="grid flex-1 gap-2">
                                <Button
                                    variant="outline"
                                    className="w-full justify-between px-4 h-12 text-lg bg-slate-50"
                                    onClick={handleCopy}
                                >
                                    <span className="truncate max-w-[200px] text-muted-foreground text-sm font-normal">
                                        {shareUrl}
                                    </span>
                                    {copied ? (
                                        <span className="flex items-center text-green-600 font-bold text-sm">
                                            <Check className="mr-2 h-4 w-4" /> Copied!
                                        </span>
                                    ) : (
                                        <span className="flex items-center text-indigo-600 font-bold text-sm">
                                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
