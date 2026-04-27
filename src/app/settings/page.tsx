'use client';

import { useState, useEffect } from 'react';
import { Settings, User, Shield, Monitor, Volume2, LogOut, Headphones, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { auth } from '@/firebase';
import { deleteUser, signOut, updateProfile } from 'firebase/auth';
import { sendOtp, sendSupportEmail } from '@/app/actions/auth-actions';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
export default function SettingsPage() {
    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 pb-24">
            <div className="w-full max-w-md md:max-w-5xl mx-auto space-y-8 md:space-y-0 md:grid md:grid-cols-12 md:gap-12">

                {/* Header - Spans full width on mobile, left col on desktop */}
                <div className="md:col-span-12 flex items-center gap-4 mb-8">
                    <div className="p-3 bg-[#ccff00]/10 border border-[#ccff00]/20">
                        <Settings className="w-6 h-6 text-[#ccff00]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter">Settings</h1>
                        <p className="text-xs text-gray-500 font-mono">USER_ID: GUEST_01</p>
                    </div>
                </div>

                {/* Left Column (Desktop) */}
                <div className="md:col-span-7 space-y-8">
                    {/* Section: Profile */}
                    <UserProfileSection />

                    {/* Section: Preferences */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Preferences</h2>
                        <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Volume2 className="w-4 h-4 text-gray-400" />
                                    <Label htmlFor="sfx" className="uppercase text-xs font-bold">Sound Effects</Label>
                                </div>
                                <Switch id="sfx" defaultChecked />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-4 h-4 text-gray-400" />
                                    <Label htmlFor="haptics" className="uppercase text-xs font-bold">Haptic Feedback</Label>
                                </div>
                                <Switch id="haptics" defaultChecked />
                            </div>
                        </div>
                    </div>

                    {/* Section: Customer Service */}
                    <CustomerServiceSection />
                </div>

                {/* Right Column (Desktop) */}
                <div className="md:col-span-5 space-y-8">
                    {/* Section: Application Download */}
                    <DownloadSection />

                    {/* Section: System */}
                    <div className="space-y-4">
                        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">App Settings</h2>
                        <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-2">
                            <Button variant="ghost" className="w-full justify-start text-red-500 hover:text-red-400 hover:bg-red-500/10 uppercase text-xs font-bold tracking-wider h-12">
                                <LogOut className="w-4 h-4 mr-3" />
                                Disconnect Session
                            </Button>

                            <DeleteAccountSection />
                            <div className="pt-2 border-t border-[#222] text-center">
                                <p className="text-[10px] text-gray-700 font-mono">VERSION: 2.1.0_PROD</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

function UserProfileSection() {
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            if (user) {
                setEditName(user.displayName || user.email?.split('@')[0] || '');
            }
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!currentUser || !editName.trim()) return;
        setIsSaving(true);
        try {
            await updateProfile(currentUser, { displayName: editName.trim() });
            setCurrentUser({ ...currentUser, displayName: editName.trim() } as any);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    }

    const displayName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Guest User';
    const email = currentUser?.email || 'Sync Disabled';

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">UserProfile</h2>
            <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#222] flex items-center justify-center">
                            <User className="w-5 h-5 text-gray-400" />
                        </div>
                        {isEditing ? (
                            <div className="flex flex-col gap-2">
                                <Input
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="h-8 text-sm bg-black text-white border-[#333]"
                                    placeholder="Display Name"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div>
                                <p className="font-bold uppercase text-sm">{displayName}</p>
                                <p className="text-xs text-gray-600">{email}</p>
                            </div>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving} className="h-8 text-[10px] uppercase text-gray-400 hover:text-white">
                                Cancel
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleSave} disabled={isSaving || !editName.trim()} className="h-8 text-[10px] uppercase border-[#333] hover:border-[#ccff00] hover:text-[#ccff00]">
                                {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : null}
                                Save
                            </Button>
                        </div>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={!currentUser} className="h-8 text-[10px] uppercase border-[#333] hover:border-[#ccff00] hover:text-[#ccff00]">
                            Edit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomerServiceSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState('general');
    const [agreeToEmail, setAgreeToEmail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [currentUser, setCurrentUser] = useState(auth.currentUser);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
        });
        return () => unsubscribe();
    }, []);

    const isLoggedIn = !!currentUser;

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'bug', label: 'Bug Report' },
        { value: 'feature', label: 'Feature Request' },
        { value: 'account', label: 'Account Issue' },
        { value: 'other', label: 'Other' },
    ];

    const handleButtonClick = () => {
        if (!isLoggedIn) {
            router.push('/login?redirect=/settings');
            return;
        }
        setIsOpen(true);
    };

    const handleSubmit = async () => {
        if (!currentUser || !currentUser.email) {
            setError('You must be logged in to contact support.');
            return;
        }
        if (!subject.trim() || !message.trim()) {
            setError('Please fill in all fields.');
            return;
        }
        if (!agreeToEmail) {
            setError('Please agree to be contacted via email.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await sendSupportEmail({
                name: currentUser.displayName || currentUser.email.split('@')[0],
                email: currentUser.email,
                subject: subject.trim(),
                message: message.trim(),
                category,
            });

            if (result.success) {
                setSuccess(true);
            } else {
                setError(result.error || 'Failed to send message.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setSubject('');
            setMessage('');
            setCategory('general');
            setAgreeToEmail(false);
            setError('');
            setSuccess(false);
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Customer Service</h2>
            <div className="bg-[#0a0a0a] border border-[#222] p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#ccff00]/10 flex items-center justify-center border border-[#ccff00]/20">
                        <Headphones className="w-5 h-5 text-[#ccff00]" />
                    </div>
                    <div>
                        <p className="font-bold uppercase text-sm">Need Help?</p>
                        <p className="text-xs text-gray-500">Report issues or ask questions</p>
                    </div>
                </div>

                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <Button
                        className="w-full bg-[#ccff00] text-black hover:bg-[#b8e600] font-bold uppercase text-xs tracking-widest h-11"
                        onClick={handleButtonClick}
                    >
                        <Send className="w-4 h-4 mr-2" />
                        {isLoggedIn ? 'Contact Support' : 'Login to Contact Support'}
                    </Button>
                    <DialogContent className="bg-[#09090b] border-[#27272a] text-white sm:max-w-md max-h-[90vh] overflow-y-auto">
                        {success ? (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-[#ccff00]" />
                                        Message Sent
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Your support request has been submitted successfully. Our team will review it shortly.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-6 text-center">
                                    <div className="w-16 h-16 mx-auto bg-[#ccff00]/10 rounded-full flex items-center justify-center border border-[#ccff00]/30 mb-4">
                                        <CheckCircle2 className="w-8 h-8 text-[#ccff00]" />
                                    </div>
                                    <p className="text-sm text-gray-400">We typically respond within 24-48 hours.</p>
                                </div>
                                <DialogFooter>
                                    <Button
                                        onClick={() => setIsOpen(false)}
                                        className="w-full bg-[#ccff00] text-black hover:bg-[#b8e600] font-bold uppercase tracking-wider"
                                    >
                                        Done
                                    </Button>
                                </DialogFooter>
                            </>
                        ) : (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                                        <Headphones className="w-5 h-5 text-[#ccff00]" />
                                        Contact Support
                                    </DialogTitle>
                                    <DialogDescription className="text-gray-400">
                                        Describe your issue and we&apos;ll get back to you via email.
                                    </DialogDescription>
                                </DialogHeader>

                                {error && (
                                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Error</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-4 py-2">
                                    {/* Category Select */}
                                    <div className="space-y-2">
                                        <Label htmlFor="category" className="text-xs uppercase font-bold text-gray-500">Category</Label>
                                        <select
                                            id="category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            className="w-full h-10 px-3 bg-[#111] border border-[#333] text-white text-sm font-mono rounded-md focus:outline-none focus:border-[#ccff00] appearance-none cursor-pointer"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.value} value={cat.value} className="bg-[#111]">
                                                    {cat.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Subject */}
                                    <div className="space-y-2">
                                        <Label htmlFor="support-subject" className="text-xs uppercase font-bold text-gray-500">Subject</Label>
                                        <Input
                                            id="support-subject"
                                            placeholder="Brief description of your issue"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="bg-[#111] border-[#333] text-white font-mono"
                                            maxLength={100}
                                        />
                                    </div>

                                    {/* Message */}
                                    <div className="space-y-2">
                                        <Label htmlFor="support-message" className="text-xs uppercase font-bold text-gray-500">Message</Label>
                                        <Textarea
                                            id="support-message"
                                            placeholder="Describe your issue in detail..."
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            className="bg-[#111] border-[#333] text-white font-mono min-h-[120px] resize-none"
                                            maxLength={1000}
                                        />
                                        <p className="text-[10px] text-gray-600 text-right font-mono">{message.length}/1000</p>
                                    </div>



                                    {/* Email Consent Checkbox */}
                                    <div className="flex items-start space-x-3 p-3 bg-[#0a0a0a] border border-[#222] rounded-md">
                                        <Checkbox
                                            id="agree-email"
                                            checked={agreeToEmail}
                                            onCheckedChange={(checked) => setAgreeToEmail(checked === true)}
                                            className="mt-0.5 border-[#444] data-[state=checked]:bg-[#ccff00] data-[state=checked]:border-[#ccff00] data-[state=checked]:text-black"
                                        />
                                        <Label htmlFor="agree-email" className="text-xs text-gray-400 leading-relaxed cursor-pointer">
                                            I agree to be contacted via email regarding this support request. QuizWhiz may use my email to respond to this inquiry.
                                        </Label>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2 sm:gap-0">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setIsOpen(false)}
                                        disabled={isLoading}
                                        className="text-gray-400 hover:text-white"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        disabled={isLoading || !agreeToEmail || !subject.trim() || !message.trim()}
                                        className="bg-[#ccff00] text-black hover:bg-[#b8e600] font-bold uppercase tracking-wider"
                                    >
                                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                                        Send Message
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

function DownloadSection() {
    return (
        <div className="hidden md:block space-y-4">
            <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-gray-500 mb-2">Get the Desktop App</h2>
            <div className="bg-[#0a0a0a] border border-[#222] p-6 text-center space-y-6">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center border border-[#333]">
                        <Monitor className="w-8 h-8 text-[#ccff00]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-bold uppercase tracking-tight text-white">
                        QuizWhiz for Windows
                    </h3>
                    <p className="text-sm text-gray-500 font-mono">
                        Experience better performance and offline capabilities.
                    </p>
                </div>

                <div className="grid gap-3">
                    <Button asChild className="w-full bg-[#0078D7] hover:bg-[#0063b1] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(0,120,215,0.3)]">
                        <a href="/downloads/coming-soon">
                            Download for Windows (.EXE)
                        </a>
                    </Button>
                    <Button asChild className="w-full bg-[#333] hover:bg-[#444] text-white font-bold h-12 uppercase tracking-widest border border-[#555]">
                        <a href="/downloads/coming-soon">
                            Download for macOS (.DMG)
                        </a>
                    </Button>
                    <Button asChild className="w-full bg-[#E95420] hover:bg-[#c74418] text-white font-bold h-12 uppercase tracking-widest shadow-[0_0_20px_rgba(233,84,32,0.3)]">
                        <a href="/downloads/coming-soon">
                            Download for Linux (.AppImage)
                        </a>
                    </Button>
                    <p className="text-[10px] text-gray-600 font-mono uppercase">
                        Current Version: 1.0.0
                    </p>
                </div>
            </div>
        </div>
    );
}

function DeleteAccountSection() {
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<'confirm' | 'otp'>('confirm');
    const [isLoading, setIsLoading] = useState(false);
    const [otp, setOtp] = useState('');
    const [inputOtp, setInputOtp] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSendOtp = async () => {
        setIsLoading(true);
        setError('');
        try {
            const user = auth.currentUser;
            if (!user || !user.email) {
                setError('No user logged in or email missing.');
                setIsLoading(false);
                return;
            }

            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setOtp(generatedOtp);

            const result = await sendOtp(user.email, generatedOtp);
            if (result.success) {
                setStep('otp');
            } else {
                setError(result.error || 'Failed to send OTP.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (inputOtp !== otp) {
            setError('Invalid OTP. Please try again.');
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const user = auth.currentUser;
            if (user) {
                await deleteUser(user);
                await signOut(auth);
                router.push('/');
            }
        } catch (err: any) {
            console.error("Delete error:", err);
            if (err.code === 'auth/requires-recent-login') {
                setError('Security timeout. Please log in again to delete your account.');
            } else {
                setError(err.message || 'Failed to delete account.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setStep('confirm');
            setOtp('');
            setInputOtp('');
            setError('');
            setIsLoading(false);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-red-500/70 hover:text-red-500 hover:bg-red-500/10 uppercase text-xs font-bold tracking-wider h-12 border-t border-[#222]">
                    <Shield className="w-4 h-4 mr-3" />
                    Delete Account
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-[#27272a] text-white sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                        Delete Account
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/50 text-red-500">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {step === 'confirm' ? (
                    <div className="space-y-4 py-4">
                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                            <p className="text-sm text-red-200">
                                To confirm deletion, we will send a One-Time Password (OTP) to your registered email address.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="otp" className="text-xs uppercase font-bold text-gray-500">Enter Verification Code</Label>
                            <Input
                                id="otp"
                                placeholder="000000"
                                value={inputOtp}
                                onChange={(e) => setInputOtp(e.target.value)}
                                className="bg-[#111] border-[#333] text-white font-mono text-center text-2xl tracking-[0.5em] h-14"
                                maxLength={6}
                            />
                            <p className="text-xs text-gray-500">
                                Sent to {auth.currentUser?.email}
                            </p>
                        </div>
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setIsOpen(false)} disabled={isLoading} className="text-gray-400 hover:text-white">
                        Cancel
                    </Button>
                    {step === 'confirm' ? (
                        <Button
                            variant="destructive"
                            onClick={handleSendOtp}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Send OTP
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isLoading || inputOtp.length !== 6}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-wider w-full sm:w-auto"
                        >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Confirm Delete
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
