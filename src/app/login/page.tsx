'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase';
import { isAdminEmail, registerAdmin } from '@/lib/auth';
import { sendWelcomeEmailAction, sendOtp, logNewUser } from '@/app/actions/auth-actions';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, Lock, Terminal, AlertTriangle, Fingerprint } from 'lucide-react';
import { Icons } from '@/components/icons';
import clsx from 'clsx';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ User already logged in, redirecting to admin dashboard...');
        router.push('/admin');
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Reset state when switching between login/signup
  useEffect(() => {
    setOtpSent(false);
    setEnteredOtp('');
    setGeneratedOtp('');
    setError('');
  }, [isSignUp]);

  const mapFirebaseError = (error: any) => {
    switch (error.code) {
      case 'auth/invalid-credential': setError('Invalid credentials'); break;
      case 'auth/user-not-found': setError('User not found'); break;
      case 'auth/wrong-password': setError('Incorrect password'); break;
      case 'auth/email-already-in-use': setError('Email already registered'); break;
      case 'auth/weak-password': setError('Password too weak'); break;
      default: setError(error.message || 'Authentication failed');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      if (result.user.email) {
        const emailToCheck = result.user.email.toLowerCase();
        const isAdmin = await isAdminEmail(emailToCheck);
        if (!isAdmin) {
          console.log(`ℹ️ Auto-registering admin: ${emailToCheck}`);
          await registerAdmin(emailToCheck);
          const nameGuess = result.user.displayName || emailToCheck.split('@')[0];
          await logNewUser({ name: nameGuess, email: emailToCheck });
        }
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('❌ Google Login failed:', error);
      // Detailed error for debugging Electron
      alert(`Google Login Failed:\nCode: ${error.code}\nMessage: ${error.message}\nOrigin: ${window.location.origin}`);
      setError(`Login failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    if (!email || !password) {
      setError('Missing fields');
      setLoading(false);
      return;
    }
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      // ELECTRON APP SPECIFIC: Bypass headerless email sending
      const isElectron = typeof window !== 'undefined' && /Electron/i.test(window.navigator.userAgent);

      if (process.env.NEXT_PUBLIC_ELECTRON_BUILD === 'true' || isElectron) {
        // Simulate network delay for realism
        setTimeout(() => {
          alert(`[QUIZWHIZ LOCAL]\nAuthentication Code: ${code}\n\n(This code is generated locally for the standalone app)`);
          setOtpSent(true);
          setLoading(false);
        }, 1000);
        return;
      }

      const output = await sendOtp(email, code);
      if (output.success) {
        setOtpSent(true);
      } else {
        setError('Failed to send code');
      }
    } catch (err) {
      setError('Something went wrong');
    } finally {
      const isElectron = typeof window !== 'undefined' && /Electron/i.test(window.navigator.userAgent);
      if (process.env.NEXT_PUBLIC_ELECTRON_BUILD !== 'true' && !isElectron) {
        setLoading(false);
      }
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // ... registration logic same as before ...
      if (userCredential.user.email) {
        const emailToCheck = userCredential.user.email.toLowerCase();
        await registerAdmin(emailToCheck);
        const nameGuess = emailToCheck.split('@')[0];
        await logNewUser({ name: nameGuess, email: emailToCheck });
        sendWelcomeEmailAction(emailToCheck, nameGuess).catch(console.error);
        router.push('/admin');
      }
    } catch (error: any) {
      mapFirebaseError(error);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      if (result.user.email) {
        const emailToCheck = result.user.email.toLowerCase();
        const isAdmin = await isAdminEmail(emailToCheck);
        if (!isAdmin) await registerAdmin(emailToCheck);
        router.push('/admin');
      }
    } catch (error: any) {
      mapFirebaseError(error);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isSignUp) {
      otpSent ? handleVerifyAndSignup(e) : handleSendOtp(e);
    } else {
      handleLogin(e);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] font-display text-white relative overflow-hidden flex flex-col lg:flex-row">

      {/* Background Noise & Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-10" style={{
        background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2))',
        backgroundSize: '100% 4px'
      }}></div>

      {/* Left Side - Visuals (Desktop) */}
      <div className="hidden lg:flex w-1/2 items-center justify-center relative border-r border-[#222]">
        <div className="absolute inset-0 bg-[#0a0a0a]"></div>
        <div className="relative z-10 flex flex-col items-center gap-6 opacity-60">
          <ShieldCheck className="w-32 h-32 text-[#ccff00] animate-pulse" />
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-mono text-[#ccff00] tracking-[0.3em] uppercase">QuizWhiz</h2>
            <p className="text-xs font-mono text-gray-500">Host Dashboard</p>
          </div>
          <div className="font-mono text-[10px] text-gray-700 mt-12 whitespace-pre">
            {`> Create Quizzes
> Host Live Games
> Track Performance
> Real-time Results`}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">

        {/* Absolute Logo */}
        <div className="absolute top-6 left-6 z-50">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <Icons.logo className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:rotate-6 transition-transform" />
          </Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 w-full max-w-lg mx-auto">

          {/* Header */}
          <div className="w-full text-center space-y-6 mb-12">

            <div className="relative inline-block">
              <span className="absolute -inset-1 bg-[#ccff00]/20 skew-x-12 blur-sm"></span>
              <h1 className="relative text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h1>
            </div>

            <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
              {isSignUp ? (otpSent ? `> Enter code sent to: ${email}` : '> Create a new account') : '> Sign in to your account'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-6">

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 p-4 flex items-center gap-3 text-red-500 text-xs font-mono tracking-widest uppercase animate-pulse">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {!otpSent ? (
              <div className="space-y-4">

                <div className="space-y-1 group">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-focus-within:text-[#ccff00] transition-colors">Email Address</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-white font-mono placeholder:text-gray-800 focus:border-[#ccff00] focus:outline-none focus:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all"
                      placeholder="hello@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                    <div className="absolute right-0 top-0 h-full w-1 bg-[#ccff00] opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                  </div>
                </div>

                <div className="space-y-1 group">
                  <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest group-focus-within:text-[#ccff00] transition-colors">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full bg-[#0a0a0a] border border-[#333] p-4 text-white font-mono placeholder:text-gray-800 focus:border-[#ccff00] focus:outline-none focus:shadow-[0_0_15px_rgba(204,255,0,0.2)] transition-all"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#ccff00]">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right">
                <div className="space-y-1 group">
                  <label className="text-[10px] font-mono text-[#ccff00] uppercase tracking-widest animate-pulse">Enter One-Time Password</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    className="w-full bg-[#0a0a0a] border border-[#ccff00] p-4 text-center text-2xl text-[#ccff00] font-mono tracking-[1em] focus:outline-none focus:shadow-[0_0_30px_rgba(204,255,0,0.3)]"
                    value={enteredOtp}
                    onChange={e => setEnteredOtp(e.target.value)}
                    placeholder="000000"
                  />
                </div>
                <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-mono text-gray-500 hover:text-[#ccff00] underline decoration-dashed underline-offset-4">
                  {`< Back to Email`}
                </button>
              </div>
            )}

            <div className="pt-4 space-y-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full h-14 bg-[#ccff00] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute top-0 right-0 w-4 h-4 bg-black transform rotate-45 translate-x-2 -translate-y-2"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 bg-black transform rotate-45 -translate-x-2 translate-y-2"></div>

                <span className="text-black font-black uppercase tracking-widest group-hover:tracking-[0.3em] transition-all flex items-center gap-2">
                  {loading ? 'Processing...' : (isSignUp ? (otpSent ? 'Verify & Register' : 'Send Verification Code') : 'Login')}
                  {!loading && <Terminal className="w-4 h-4" />}
                </span>
              </button>

              {!otpSent && (
                <>
                  <div className="relative flex items-center justify-center my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#222]"></div></div>
                    <span className="relative bg-[#050505] px-4 text-[10px] font-mono text-gray-600 uppercase">Or Continue With</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full h-12 border border-[#333] hover:border-[#ccff00] hover:bg-[#ccff00]/5 flex items-center justify-center gap-3 transition-all group"
                  >
                    <Fingerprint className="w-4 h-4 text-gray-500 group-hover:text-[#ccff00]" />
                    <span className="text-xs font-mono text-gray-400 group-hover:text-white uppercase tracking-widest">Google Account</span>
                  </button>
                </>
              )}
            </div>

          </form>

          {/* Footer Switch */}
          <div className="mt-8 text-center">
            <p className="text-xs font-mono text-gray-600 uppercase mb-2">
              {isSignUp ? '> Already have an account?' : '> New user?'}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-[#ccff00] font-bold uppercase tracking-wider border-b border-[#ccff00] hover:border-transparent hover:bg-[#ccff00] hover:text-black transition-all px-1"
            >
              {isSignUp ? 'Login to existing account' : 'Register new account'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
