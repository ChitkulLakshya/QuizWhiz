import { useCallback, useEffect, useRef, useState } from 'react';

export function useGameSounds() {
    const [isMuted, setIsMuted] = useState(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    // Initialize AudioContext lazily
    const getAudioContext = useCallback(() => {
        if (!audioContextRef.current) {
            // @ts-ignore - Handle webkit prefix for Safari if needed, though modern browsers use AudioContext
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                audioContextRef.current = new AudioContextClass();
            }
        }
        // Resume if suspended (browser policy)
        if (audioContextRef.current?.state === 'suspended') {
            audioContextRef.current.resume();
        }
        return audioContextRef.current;
    }, []);

    const playTone = useCallback((
        freq: number | number[],
        type: OscillatorType,
        duration: number,
        time: number = 0
    ) => {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;

        // Handle slides or static frequency
        if (Array.isArray(freq)) {
            osc.frequency.setValueAtTime(freq[0], ctx.currentTime + time);
            if (freq[1]) {
                osc.frequency.linearRampToValueAtTime(freq[1], ctx.currentTime + time + duration);
            }
        } else {
            osc.frequency.setValueAtTime(freq, ctx.currentTime + time);
        }

        // Envelope
        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + time + (duration * 0.1));
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + duration);
    }, [getAudioContext]);

    const playCorrect = useCallback(() => {
        if (isMuted) return;
        // High ping: 880Hz -> 1760Hz (A5 -> A6) in 0.3s
        playTone([880, 1760], 'sine', 0.3);
    }, [isMuted, playTone]);

    const playWrong = useCallback(() => {
        if (isMuted) return;
        // Low buzzer: 150Hz -> 100Hz in 0.4s
        playTone([150, 100], 'sawtooth', 0.4);
    }, [isMuted, playTone]);

    const playTick = useCallback(() => {
        if (isMuted) return;
        // Short woodblock: 800Hz, triangle, 0.1s
        // To make it more percussive, we can modulate freq fast too, but simple is fine
        playTone(800, 'triangle', 0.1); // "Tick"
    }, [isMuted, playTone]);

    const playResults = useCallback(() => {
        if (isMuted) return;
        // Major chord arpeggio: C5 (523), E5 (659), G5 (783), C6 (1046)
        const now = 0;
        const gap = 0.15;
        playTone(523.25, 'sine', 0.4, now);
        playTone(659.25, 'sine', 0.4, now + gap);
        playTone(783.99, 'sine', 0.4, now + gap * 2);
        playTone(1046.50, 'sine', 0.8, now + gap * 3);
    }, [isMuted, playTone]);

    // Alias playCountdown to playTick for consistency with previous interface
    const playCountdown = playTick;

    const toggleMute = useCallback(() => {
        setIsMuted(prev => !prev);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    return {
        playCorrect,
        playWrong,
        playCountdown,
        playTick,
        playResults,
        isMuted,
        toggleMute
    };
}
