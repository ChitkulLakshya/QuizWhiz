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

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Smooth spring for parallax
  const springY1 = useSpring(y1, { stiffness: 100, damping: 30 });
  const springY2 = useSpring(y2, { stiffness: 100, damping: 30 });
  const gridY = useTransform(scrollY, [0, 500], [0, 50]);

  useEffect(() => {
    setMounted(true);
  }, []);



  // Animation variants
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-primary-foreground">

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      {/* ══════════════════════════════════════════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden"
      >
        {/* Parallax background elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating orbs */}
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

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center max-w-5xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-2.5 mb-10 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(var(--primary),0.15)] hover:shadow-[0_0_25px_rgba(var(--primary),0.25)] transition-all duration-300">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Real-Time Quiz Platform</span>
          </motion.div>

          {/* Main headline - Optimized for LCP (No entrance animation) */}
          <div className="mb-10 relative">
            <div className="absolute inset-0 bg-primary/20 blur-[100px] pointer-events-none opacity-50" />
            <h1 className="relative text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-[-0.08em] leading-[0.85] z-10">
              <span className="block text-white drop-shadow-xl">Challenge</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-white to-primary drop-shadow-[0_0_35px_rgba(var(--primary),0.5)] animate-text-shimmer bg-[length:200%_auto]">Your Brain</span>
            </h1>
          </div>

          {/* Subheadline */}
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed">
            Create AI-powered quizzes, compete in real-time, and prove you're the smartest in the room.
          </motion.p>

          {/* CTA buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 justify-center items-center">
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

      {/* ══════════════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════════════════════ */}
      <BentoFeatures />

      {/* ══════════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════════ */}
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
            {/* Circuit Line - Desktop */}
            <div className="hidden md:block absolute top-[40px] left-[16%] right-[16%] h-[2px] bg-white/5">
              {/* Start Dot */}
              <div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
              {/* End Dot */}
              <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 rounded-full bg-border" />
              {/* Shimmer */}
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

                {/* Background Number - Adjusted layout */}
                <span className="absolute -top-16 left-1/2 -translate-x-1/2 text-[140px] font-black text-white/[0.03] select-none pointer-events-none leading-none z-0">
                  {step.num}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          CATEGORIES PREVIEW
      ══════════════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════════════
          CATEGORIES PREVIEW
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-24 relative z-10 border-y border-white/5 bg-white/[0.02]">
        <div className="mb-12 text-center">
          <span className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">Limitless Possibilities</span>
        </div>
        <InfiniteMarquee items={categories} speed={40} />
        <div className="mt-8">
          <InfiniteMarquee items={[...categories].reverse()} direction="right" speed={50} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      {/* ══════════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-40 px-6 relative overflow-hidden">
        {/* Glow effect */}
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

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm font-medium text-muted-foreground">© 2025 QuizWhiz. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>

      {/* Navigation */}
    </div>
  );
}
