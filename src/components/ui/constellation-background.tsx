'use client';

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number; // velocity x
    vy: number; // velocity y
    size: number;
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
        const particleCount = 80;
        const connectionDistance = 150;
        const interactionDistance = 200;

        // Resize handler
        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Initialize particles
        const initParticles = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5, // Slow random movement
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2 + 1, // Size between 1 and 3
                });
            }
        };

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach((particle, i) => {
                // Movement
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Mouse interaction (Magnetic attraction)
                const dx = mouseRef.current.x - particle.x;
                const dy = mouseRef.current.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < interactionDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (interactionDistance - distance) / interactionDistance;
                    const attractionStrength = 0.05;

                    particle.vx += forceDirectionX * force * attractionStrength;
                    particle.vy += forceDirectionY * force * attractionStrength;
                }

                // Friction to prevent particles from speeding up infinitely from mouse interaction
                particle.vx *= 0.99;
                particle.vy *= 0.99;

                // Wall collision (bounce)
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Draw Particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, 0.3)`; // White/Gray dots
                ctx.fill();

                // Draw Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = particle.x - p2.x;
                    const dy2 = particle.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(204, 255, 0, ${1 - dist2 / connectionDistance})`; // Neon Lime #ccff00 fading
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        // Event Listeners
        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);

        // Initial setup
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ background: 'transparent' }} // Ensure canvas is transparent
        />
    );
};
