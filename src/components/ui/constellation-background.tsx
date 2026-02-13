'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number; // velocity x
    vy: number; // velocity y
    size: number;
    opacity: number;
}

export const ConstellationBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -1000, y: -1000 }); // Initialize off-screen

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        let particleCount = 80; // Base count, will be recalculated
        const connectionDistance = 150;
        const interactionDistance = 250; // Increased for smoother feel
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particleCount = Math.floor((canvas.width * canvas.height) / 15000);
            particleCount = Math.min(Math.max(particleCount, 40), 120);
            initParticles();
        };
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3, // Slower, more drift-like
                    vy: (Math.random() - 0.5) * 0.3,
                    size: Math.random() * 2 + 0.5, // 0.5 to 2.5
                    opacity: Math.random() * 0.5 + 0.1, // 0.1 to 0.6
                });
            }
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach((particle, i) => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = Math.pow((interactionDistance - distance) / interactionDistance, 2);
                    const attractionStrength = 0.08;

                    particle.vx += forceDirectionX * force * attractionStrength;
                    particle.vy += forceDirectionY * force * attractionStrength;
                }
                particle.vx *= 0.98; // Slightly more friction
                particle.vy *= 0.98;
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`; // Depth via opacity
                ctx.fill();
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = particle.x - p2.x;
                    const dy2 = particle.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < connectionDistance) {
                        ctx.beginPath();
                        const lineOpacity = (1 - dist2 / connectionDistance) * 0.4 * ((particle.opacity + p2.opacity) / 2);
                        ctx.strokeStyle = `rgba(204, 255, 0, ${lineOpacity})`; // Neon Lime #ccff00
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };
        const handleMouseLeave = () => {
            mouseRef.current = { x: -1000, y: -1000 };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }}
        />
    );
};
