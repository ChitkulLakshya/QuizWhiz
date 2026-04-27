import Link from 'next/link';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col w-full min-h-screen bg-[#050505] text-white font-display relative overflow-hidden">
            {/* Background Noise & Scanlines */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0 mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E")` }}></div>

            <main className="flex-1 p-4 md:p-8 flex items-center justify-center relative z-10 w-full">
                <div className="w-full max-w-4xl">
                    <div className="mb-8 flex flex-col gap-2">
                        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-[#ccff00] transition-colors font-mono text-xs uppercase tracking-widest mb-4 group">
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            Return Home
                        </Link>
                        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                            <Shield className="w-10 h-10 text-[#ccff00]" />
                            Privacy <span className="text-[#ccff00]">Policy</span>
                        </h1>
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#333] p-8 space-y-6 text-gray-300 font-mono text-sm">
                        <h2 className="text-[#ccff00] text-lg uppercase tracking-widest">1. Information Collection</h2>
                        <p>QuizWhiz may collect and store basic user information, including your Google account email and display name for leaderboard tracking, authentication, and secure session management. We do not sell your personal data.</p>

                        <h2 className="text-[#ccff00] text-lg uppercase tracking-widest mt-8">2. Data Usage</h2>
                        <p>Your email address is only used to establish access rights for quiz creation and administration. We use an automated AI model (Google Gemini) to generate quizzes; the prompts you provide are sent to this model securely.</p>

                        <h2 className="text-[#ccff00] text-lg uppercase tracking-widest mt-8">3. Cookies & Tracking</h2>
                        <p>We use standard session cookies and local storage tokens via Firebase Auth to keep you securely signed in during gameplay. No third-party ad-tracking cookies are active.</p>

                        <div className="mt-12 pt-6 border-t border-[#333] text-xs text-gray-500">
                            Last Updated: March 2026
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
