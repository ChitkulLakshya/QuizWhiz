'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Zap, Users, Brain, ArrowRight, Trophy, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstellationBackground } from '@/components/ui/constellation-background';
import MobileNav from '@/components/mobile-nav';

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
  { num: '01', title: 'Create', desc: 'Pick a topic or let AI generate one' },
  { num: '02', title: 'Share', desc: 'Invite players with a simple code' },
  { num: '03', title: 'Play', desc: 'Answer fast to climb the leaderboard' }
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
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 px-4 py-2 mb-8 rounded-full backdrop-blur-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Real-Time Quiz Platform</span>
          </motion.div>

          {/* Main headline - Optimized for LCP (No entrance animation) */}
          <div className="mb-8">
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase tracking-tighter leading-[0.85]">
              <span className="block text-foreground drop-shadow-2xl">Challenge</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]">Your Brain</span>
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
              className="h-16 px-10 text-base shadow-[0_0_30px_-5px_hsl(var(--primary)/0.4)] hover:shadow-[0_0_40px_-5px_hsl(var(--primary)/0.6)] hover:scale-105 transition-all duration-300"
            >
              Play Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.push('/host/create')}
              className="h-16 px-10 text-base backdrop-blur-sm bg-background/50 hover:bg-background/80 hover:scale-105 transition-all duration-300"
            >
              Create Quiz
            </Button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{ opacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/60">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4 block font-bold">Why QuizWhiz</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              Next-Gen Trivia
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-10 bg-card/40 backdrop-blur-md border border-border hover:border-primary/50 transition-all duration-500 rounded-2xl hover:shadow-[0_0_30px_-5px_rgba(0,0,0,0.5)]"
              >
                <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-8 group-hover:bg-primary/20 transition-all duration-500 group-hover:scale-110">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-wide mb-4 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          HOW IT WORKS
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 bg-secondary/20 relative overflow-hidden backdrop-blur-sm inset-shadow-lg">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4 block font-bold">How It Works</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              Three Simple Steps
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="relative p-8 border-l-2 border-primary/20 hover:border-primary transition-colors duration-300 pl-10"
              >
                <span className="text-7xl font-black text-primary/5 absolute -top-4 left-4 select-none pointer-events-none">{step.num}</span>
                <h3 className="text-3xl font-bold uppercase tracking-wide mb-4 relative z-10">{step.title}</h3>
                <p className="text-muted-foreground relative z-10 text-lg">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          CATEGORIES PREVIEW
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-sm font-mono uppercase tracking-[0.3em] text-primary mb-4 block font-bold">Categories</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter">
              Endless Topics
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide py-4"
          >
            {[...categories, ...categories].map((cat, i) => (
              <motion.div
                whileHover={{ scale: 1.05, borderColor: 'hsl(var(--primary))' }}
                key={`${cat}-${i}`}
                className="flex-shrink-0 px-8 py-5 bg-card border border-border transition-all cursor-pointer rounded-lg shadow-sm"
              >
                <span className="text-base font-bold uppercase tracking-wider whitespace-nowrap">{cat}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════════
          FINAL CTA
      ══════════════════════════════════════════════════════════════════════════ */}
      <section className="py-40 px-6 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[800px] h-[800px] rounded-full bg-primary/5 blur-[200px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          <Gamepad2 className="w-20 h-20 text-primary mx-auto mb-8 animate-pulse" />
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">
            Ready to Play?
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Join thousands of players challenging their knowledge every day.
          </p>
          <Button
            onClick={() => router.push('/play')}
            size="lg"
            className="h-20 px-16 text-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_50px_rgba(var(--primary),0.3)] hover:shadow-[0_0_80px_rgba(var(--primary),0.5)] transition-all duration-300 scale-100 hover:scale-105"
          >
            Start Playing
            <Zap className="ml-3 w-6 h-6 fill-current" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/40 bg-background/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <span className="text-sm text-muted-foreground font-mono">© 2025 QUIZWHIZ</span>
          <div className="flex gap-8">
            <Link href="/play" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Play</Link>
            <Link href="/host/create" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Create</Link>
            <Link href="/join" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Join</Link>
          </div>
        </div>
      </footer>

      {/* Mobile Nav */}
      <MobileNav />
    </div>
  );
}
