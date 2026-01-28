'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/firebase';
import { isAdminEmail, registerAdmin } from '@/lib/auth';
import { Icons } from '@/components/icons';
import { sendOtp } from '@/app/actions/auth-actions';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
// import { PlaceHolderImages } from '@/lib/placeholder-images';

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

  // Redirect if already logged in (admin status already verified during login)
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
      case 'auth/invalid-credential':
        setError('Invalid email or password.');
        break;
      case 'auth/user-not-found':
        setError('No account found with this email.');
        break;
      case 'auth/wrong-password':
        setError('Incorrect password.');
        break;
      case 'auth/email-already-in-use':
        setError('Email is already in use. Please sign in instead.');
        break;
      case 'auth/weak-password':
        setError('Password is too weak. Please use a stronger password.');
        break;
      case 'auth/too-many-requests':
        setError('Too many failed attempts. Please try again later.');
        break;
      case 'auth/operation-not-allowed':
        setError('Email/Password Sign-In is not enabled in the Firebase Console.');
        break;
      default:
        setError(error.message || 'Authentication failed. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user.email) {
        const emailToCheck = user.email.toLowerCase();
        const isAdmin = await isAdminEmail(emailToCheck);

        if (!isAdmin) {
          console.log(`ℹ️ User ${emailToCheck} not in admins collection. Auto-registering...`);
          await registerAdmin(emailToCheck);
        }

        console.log('✅ Admin verification passed. Redirecting...');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('❌ Google Login failed:', error);
      if (error.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled in the Firebase Console. Please enable it in Authentication > Sign-in method.');
      } else {
        setError(error.message || 'Google Login failed.');
      }
      setLoading(false);
    }
  };

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      // Generate 6-digit OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);

      console.log('📧 Sending OTP to:', email);
      const output = await sendOtp(email, code);

      if (output.success) {
        setOtpSent(true);
        console.log('✅ OTP sent successfully');
      } else {
        setError('Failed to send verification email. Please try again.');
        console.error('❌ OTP send failed:', output.error);
      }
    } catch (err) {
      console.error('❌ Error in handleSendOtp:', err);
      setError('An error occurred while sending OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (enteredOtp !== generatedOtp) {
      setError('Invalid OTP. Please try again.');
      setLoading(false);
      return;
    }

    try {
      console.log('🔐 OTP Verified. Creating account...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Registration successful for:', user.email);

      if (user.email) {
        const emailToCheck = user.email.toLowerCase();
        // Register as admin
        await registerAdmin(emailToCheck);

        console.log('✅ Admin registered. Redirecting...');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      mapFirebaseError(error);
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Auth successful for:', user.email);

      if (user.email) {
        const emailToCheck = user.email.toLowerCase();
        const isAdmin = await isAdminEmail(emailToCheck);
        if (!isAdmin) {
          console.log(`ℹ️ User ${emailToCheck} not in admins collection. Auto-registering...`);
          await registerAdmin(emailToCheck);
        }
        console.log('✅ Admin verification passed. Redirecting...');
        router.push('/admin');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      mapFirebaseError(error);
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    if (isSignUp) {
      if (otpSent) {
        handleVerifyAndSignup(e);
      } else {
        handleSendOtp(e);
      }
    } else {
      handleLogin(e);
    }
  };

  const illustrationImage = '/login-illustration.png'; // Requires image in public folder

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Side - Illustration */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-[#FDFCF6] relative overflow-hidden">
        <div className="w-full h-full p-12 xl:p-20 flex items-center justify-center">
          <img
            src={illustrationImage}
            alt="QuizWhiz Login Illustration"
            className="object-contain w-full h-full max-h-[85vh] mix-blend-multiply drop-shadow-sm transform hover:scale-[1.02] transition-transform duration-500"
          />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">

          {/* Header Section */}
          <div className="text-center flex flex-col items-center">
            <Link href="/" className="mb-6 inline-flex items-center gap-2">
              <Icons.logo className="h-8 w-8 text-slate-800" />
              <span className="font-headline text-2xl font-bold text-slate-900">QuizWhiz</span>
            </Link>
            <h1 className="text-4xl font-body font-bold tracking-tight text-slate-900 mb-2">
              {isSignUp ? 'Get Started' : 'Welcome Back!'}
            </h1>
            <p className="text-slate-500">
              {isSignUp
                ? (otpSent ? `Enter the OTP sent to ${email}` : 'Create your account to start hosting quizzes')
                : 'Login to continue creating and taking quizzes.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-900 font-medium">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      disabled={loading}
                      autoComplete="email"
                      className="rounded-lg border-slate-200 px-4 py-5 focus:border-[#4ADE80] focus:ring-[#4ADE80] transition-all duration-200"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-900 font-medium">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={isSignUp ? "Create a password" : "********"}
                        required
                        disabled={loading}
                        autoComplete={isSignUp ? "new-password" : "current-password"}
                        className="rounded-lg border-slate-200 px-4 py-5 pr-20 focus:border-[#4ADE80] focus:ring-[#4ADE80] transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors flex items-center gap-1.5 text-sm font-medium px-2 py-1"
                      >
                        {showPassword ? (
                          <>
                            <EyeOff className="h-4 w-4" /> Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4" /> Show
                          </>
                        )}
                      </button>
                    </div>
                    {!isSignUp && (
                      <div className="flex justify-end pt-1">
                        <button type="button" className="text-sm font-medium text-slate-900 hover:underline">
                          Forgot Password?
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-right-4">
                  <Label htmlFor="otp" className="text-slate-900 font-medium">Verification Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="123456"
                    required
                    disabled={loading}
                    maxLength={6}
                    className="text-center text-lg tracking-widest rounded-lg border-slate-200 px-4 py-5 focus:border-[#4ADE80] focus:ring-[#4ADE80] transition-all duration-200"
                  />
                  <div className="text-center mt-2">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-sm text-[#4b9e65] hover:underline font-medium"
                    >
                      Back to edit details
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full rounded-full bg-[#83D698] hover:bg-[#6FCF97] py-6 text-base font-bold text-slate-900 shadow-sm hover:shadow-md transition-all duration-200"
              disabled={loading || (!otpSent && (!email || !password))}
            >
              {loading ? 'Processing...' : (
                isSignUp ? (otpSent ? 'Verify & Create Account' : 'Send Verification Code') : 'Login'
              )}
            </Button>

            {!otpSent && (
              <>
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-4 text-slate-500 font-medium">Or</span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-full border-slate-200 py-6 text-slate-700 hover:bg-slate-50 font-bold gap-2"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Sign in with Google
                </Button>
              </>
            )}

            <div className="text-center text-sm pt-2">
              {isSignUp ? (
                <p className="text-slate-500">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(false)}
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Login
                  </button>
                </p>
              ) : (
                <p className="text-slate-500">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(true)}
                    className="font-bold text-slate-900 hover:underline"
                  >
                    Sign Up
                  </button>
                </p>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
