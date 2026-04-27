'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Users, Brain, ArrowRight, Trophy, Gamepad2, Pencil, Share2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstellationBackground } from '@/components/ui/constellation-background';
import { BentoFeatures } from '@/components/ui/bento-features';
import { InfiniteMarquee } from '@/components/ui/infinite-marquee';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered',
    description: 'Generate quizzes on any topic using advanced AI'
  },
  {
    icon: Users,
    title: 'Real-Time',
    description: 'Compete with friends in live multiplayer sessions'
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Track scores and crown the ultimate champion'
  }
];

const steps = [
  { num: '01', title: 'Create', desc: 'Pick a topic or let AI generate one', icon: Pencil },
  { num: '02', title: 'Share', desc: 'Invite players with a simple code', icon: Share2 },
  { num: '03', title: 'Play', desc: 'Answer fast to climb the leaderboard', icon: Play }
];

const categories = ['General Knowledge', 'Movies', 'Sports', 'Geography', 'Video Games', 'History', 'Science'];

import { Search, Trophy as TrophyIcon, User, Grid, Home, Layout, Settings as SettingsIcon } from 'lucide-react';

const mobileCategories = [
  { id: 'bird', icon: '🐦', label: 'Bird', color: 'bg-orange-500/20 text-orange-500' },
  { id: 'marine', icon: '🐬', label: 'Marine', color: 'bg-purple-500/20 text-purple-500' },
  { id: 'wild', icon: '🦁', label: 'Wild', color: 'bg-blue-500/20 text-blue-500' },
  { id: 'nature', icon: '🌿', label: 'Nature', color: 'bg-green-500/20 text-green-500' },
];

const featuredQuizzes = [
  {
    id: 'marine-marvels',
    title: 'Marine Marvels Quiz Challenge',
    questions: 20,
    time: '15 Min',
    image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=400&auto=format&fit=crop',
    color: 'from-purple-100 to-purple-300'
  }
];

function MobileDashboard({ router }: { router: any }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 pb-20 overflow-hidden">
      {/* Mobile Top Nav */}
      <header className="px-6 pt-12 pb-6 flex justify-between items-center bg-white/50 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center overflow-hidden">
            <User className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-400 text-sm font-medium">It's Quiz Time!</p>
        </div>
        <button className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-slate-100">
          <Grid className="w-5 h-5 text-slate-900" />
        </button>
      </header>

      <main className="flex-1 px-6 pt-4 overflow-y-auto scrollbar-hide">
        <h1 className="text-4xl font-black tracking-tight mb-8 leading-tight">
          Pick a Card and<br />Roll the Dice
        </h1>

        {/* Categories Scroller */}
        <div className="flex gap-3 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6">
          {mobileCategories.map(cat => (
            <button
              key={cat.id}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 shadow-sm whitespace-nowrap bg-white hover:bg-slate-50 transition-colors font-bold text-sm`}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Featured Quiz Card */}
        <div className="relative mt-4 group">
          <div className="absolute inset-0 bg-purple-500/20 blur-3xl transform -rotate-6 scale-90 -z-10 group-hover:scale-100 transition-transform duration-500" />
          <motion.div 
            whileTap={{ scale: 0.98 }}
            className={`w-full aspect-[4/5] rounded-[3rem] bg-gradient-to-br ${featuredQuizzes[0].color} p-8 relative overflow-hidden shadow-2xl shadow-purple-500/20 flex flex-col items-center justify-end text-center`}
          >
            {/* Dolphin-like illustration container */}
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/30 rounded-full blur-2xl animate-pulse" />
            <img 
              src={featuredQuizzes[0].image} 
              alt="Quiz" 
              className="absolute top-10 left-1/2 -translate-x-1/2 w-56 h-56 object-contain drop-shadow-2xl hover:scale-110 transition-transform duration-500"
            />

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl w-full border border-white shadow-xl relative z-10">
              <h3 className="text-xl font-bold mb-1">{featuredQuizzes[0].title}</h3>
              <p className="text-slate-500 text-xs font-medium mb-4 uppercase tracking-widest">
                {featuredQuizzes[0].questions} Que | {featuredQuizzes[0].time}
              </p>
              <Button 
                onClick={() => router.push('/play/' + featuredQuizzes[0].id)}
                className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xs tracking-tighter hover:scale-105 transition-transform"
              >
                Play Now
              </Button>
            </div>
          </motion.div>
        </div>

        <div className="mt-12 mb-8">
           <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-300 transform -rotate-1">Let the Quiz Games Begin</h2>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-6 left-6 right-6 h-20 bg-slate-900 rounded-[2.5rem] shadow-2xl flex items-center justify-around px-4 border border-white/10 backdrop-blur-sm z-50">
        <button className="p-4 bg-primary rounded-full text-black">
          <Home className="w-6 h-6" />
        </button>
        <button className="p-4 text-slate-400 hover:text-white transition-colors">
          <Search className="w-6 h-6" />
        </button>
        <button className="p-4 text-slate-400 hover:text-white transition-colors" onClick={() => router.push('/quiz/leaderboard')}>
          <TrophyIcon className="w-6 h-6" />
        </button>
        <button className="p-4 text-slate-400 hover:text-white transition-colors">
          <SettingsIcon className="w-6 h-6" />
        </button>
      </nav>
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const gridY = useTransform(scrollY, [0, 500], [0, 50]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  } as any;

  if (!mounted) return null;

  if (isMobile) return <MobileDashboard router={router} />;

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Original Desktop Landing Content */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            style={{ y: springY1 }}
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px]"
          />
          <motion.div
            style={{ y: springY2 }}
            className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[120px]"
          />
        </div>

        <ConstellationBackground />

        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 mb-10 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(var(--primary),0.15)] hover:shadow-[0_0_25px_rgba(var(--primary),0.25)] transition-all duration-300">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Real-Time Quiz Platform</span>
          </motion.div>

          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] pointer-events-none opacity-50" />
            <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-[-0.08em] leading-[0.85] z-10">
              <span className="block text-white drop-shadow-xl">Challenge</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary drop-shadow-[0_0_35px_rgba(var(--primary),0.5)] animate-text-shimmer bg-[length:200%_auto]">Your Brain</span>
            </h1>
          </div>

          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Create AI-powered quizzes, compete in real-time, and prove you're the smartest in the room.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:row gap-6 justify-center items-center">
            <Button
              onClick={() => router.push('/play')}
              size="lg"
              className="h-16 px-12 text-lg font-bold bg-primary text-black hover:bg-white hover:text-black shadow-[0_0_50px_-10px_rgba(var(--primary),0.6)] hover:shadow-[0_0_70px_-5px_rgba(255,255,255,0.5)] hover:scale-105 transition-all duration-300 border-0 ring-0 outline-none"
            >
              Play Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/host/create')}
              className="h-16 px-10 text-base backdrop-blur-sm bg-background/50 hover:bg-white hover:text-black hover:scale-105 transition-all duration-300"
            >
              Create Quiz
            </Button>
          </motion.div>
        </motion.div>
      </section>

      <BentoFeatures />

      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4 block font-bold">How It Works</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              The Flow
            </h2>
          </motion.div>

          <div className="relative grid md:grid-cols-3 gap-12">
            <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-[2px] bg-white/5">
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-50 animate-shimmer-slide" />
            </div>

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 rounded-full border border-primary/30 bg-background/80 backdrop-blur-sm flex items-center justify-center relative z-10 mb-8 group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all duration-300">
                  <step.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="text-3xl font-bold uppercase tracking-wide mb-4 relative z-10">{step.title}</h3>
                <p className="text-muted-foreground relative z-10 text-lg max-w-xs leading-relaxed">{step.desc}</p>
                <span className="absolute -top-16 left-1/2 -translate-x-1/2 text-[140px] font-black text-white/[0.03] select-none pointer-events-none leading-none z-0">
                  {step.num}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="mb-12 text-center">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Limitless Possibilities</span>
        </div>
        <InfiniteMarquee items={categories} speed={40} />
        <div className="mt-8">
          <InfiniteMarquee items={[...categories].reverse()} direction="right" speed={50} />
        </div>
      </section>

      <section className="py-40 px-6 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
          <div className="w-[400px] h-[400px] rounded-full bg-primary/10 blur-[100px] animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-5xl mx-auto"
        >
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter mb-12 leading-[0.8]">
            Ready to<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">Dominate?</span>
          </h2>

          <Button
            onClick={() => router.push('/play')}
            size="lg"
            className="h-24 px-20 text-2xl font-black uppercase tracking-widest bg-primary text-black hover:bg-white hover:text-black shadow-[0_0_60px_-10px_rgba(var(--primary),0.5)] hover:shadow-[0_0_100px_-10px_rgba(255,255,255,0.5)] hover:scale-[1.02] transition-all duration-500 rounded-full"
          >
            Start Playing
          </Button>
        </motion.div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm font-medium text-muted-foreground">© 2026 QuizWhiz. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms</Link>
            <Link href="/settings" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
