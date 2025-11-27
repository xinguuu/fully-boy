'use client';

import { useEffect, useRef, useCallback } from 'react';

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: 'rect' | 'circle';
}

const COLORS = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#FCBAD3', // Pink
  '#6366F1', // Primary (Indigo)
  '#10B981', // Success (Green)
  '#F59E0B', // Warning (Amber)
];

export function Confetti({ isActive, duration = 5000, particleCount = 150 }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const createParticle = useCallback(
    (canvasWidth: number): Particle => ({
      x: Math.random() * canvasWidth,
      y: -20,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    }),
    []
  );

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    if (!startTimeRef.current) {
      startTimeRef.current = now;
    }

    const elapsed = now - startTimeRef.current;
    const shouldAddParticles = elapsed < duration * 0.6;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (shouldAddParticles && particlesRef.current.length < particleCount) {
      const particlesToAdd = Math.min(5, particleCount - particlesRef.current.length);
      for (let i = 0; i < particlesToAdd; i++) {
        particlesRef.current.push(createParticle(canvas.width));
      }
    }

    particlesRef.current = particlesRef.current.filter((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.1;
      particle.vx *= 0.99;
      particle.rotation += particle.rotationSpeed;

      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.fillStyle = particle.color;

      if (particle.shape === 'rect') {
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      return particle.y < canvas.height + 50;
    });

    if (elapsed < duration || particlesRef.current.length > 0) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      startTimeRef.current = null;
    }
  }, [duration, particleCount, createParticle]);

  useEffect(() => {
    if (!isActive) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      particlesRef.current = [];
      startTimeRef.current = null;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    particlesRef.current = [];
    startTimeRef.current = null;
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, animate]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    />
  );
}
