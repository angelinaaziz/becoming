import { useEffect, useRef } from 'react';

interface BackgroundAnimationProps {
  variant?: 'default' | 'glow' | 'particles' | 'hexGrid';
  intensity?: 'low' | 'medium' | 'high';
  color?: string;
}

/**
 * A component that adds beautiful animated background effects
 */
const BackgroundAnimation = ({ 
  variant = 'default',
  intensity = 'medium',
  color = 'rgba(151, 71, 255, 0.3)' // Default to primary purple color
}: BackgroundAnimationProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Particle animation effect
  useEffect(() => {
    if (!canvasRef.current || variant !== 'particles') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Handle resize
    window.addEventListener('resize', setDimensions);
    setDimensions();
    
    // Configure particles based on intensity
    const particleCount = intensity === 'low' ? 25 : intensity === 'medium' ? 50 : 80;
    const alphaBase = intensity === 'low' ? 0.2 : intensity === 'medium' ? 0.3 : 0.4;
    
    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = color;
        this.alpha = Math.random() * alphaBase + 0.1;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }
      
      draw() {
        ctx.globalAlpha = this.alpha;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
    
    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update all particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });
      
      // Draw connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Draw line if particles are close enough
          const maxDistance = intensity === 'low' ? 100 : intensity === 'medium' ? 150 : 200;
          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = color;
            ctx.globalAlpha = (maxDistance - distance) / maxDistance * 0.15;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', setDimensions);
      cancelAnimationFrame(animationId);
    };
  }, [variant, intensity, color]);
  
  // Hex grid animation effect
  useEffect(() => {
    if (!canvasRef.current || variant !== 'hexGrid') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', setDimensions);
    setDimensions();
    
    // Configure hex grid based on intensity
    const hexSize = intensity === 'low' ? 40 : intensity === 'medium' ? 30 : 20;
    const lineWidth = intensity === 'low' ? 0.5 : intensity === 'medium' ? 0.7 : 1;
    
    // Pulse animation settings
    let opacity = 0.1;
    let increasing = true;
    const minOpacity = 0.05;
    const maxOpacity = intensity === 'low' ? 0.15 : intensity === 'medium' ? 0.2 : 0.3;
    const pulseSpeed = 0.001;
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update opacity for pulse effect
      if (increasing) {
        opacity += pulseSpeed;
        if (opacity >= maxOpacity) increasing = false;
      } else {
        opacity -= pulseSpeed;
        if (opacity <= minOpacity) increasing = true;
      }
      
      // Draw hexagon grid
      const hexHeight = hexSize * Math.sqrt(3);
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.globalAlpha = opacity;
      
      for (let row = -1; row < canvas.height / hexHeight + 1; row++) {
        for (let col = -1; col < canvas.width / (hexSize * 3) + 1; col++) {
          const x = col * hexSize * 3 + (row % 2 === 0 ? 0 : hexSize * 1.5);
          const y = row * hexHeight * 0.75;
          
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const xPos = x + hexSize * Math.cos(angle);
            const yPos = y + hexSize * Math.sin(angle);
            
            if (i === 0) ctx.moveTo(xPos, yPos);
            else ctx.lineTo(xPos, yPos);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }
      
      ctx.globalAlpha = 1;
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', setDimensions);
      cancelAnimationFrame(animationId);
    };
  }, [variant, intensity, color]);
  
  // Glow animation effect
  useEffect(() => {
    if (!canvasRef.current || variant !== 'glow') return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', setDimensions);
    setDimensions();
    
    // Configure glow based on intensity
    const glowCount = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : 7;
    const maxSize = intensity === 'low' ? 150 : intensity === 'medium' ? 250 : 350;
    
    // Glow class
    class GlowOrb {
      x: number;
      y: number;
      size: number;
      targetSize: number;
      color: string;
      speedX: number;
      speedY: number;
      
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 50 + 50;
        this.targetSize = Math.random() * 100 + 100;
        this.color = color;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
      }
      
      update() {
        // Move the glow orb
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Bounce off edges
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        
        // Pulse size
        if (this.size < this.targetSize) {
          this.size += 0.2;
        } else {
          this.targetSize = Math.random() * maxSize + 50;
          this.size -= 0.2;
        }
      }
      
      draw() {
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        
        gradient.addColorStop(0, `${this.color.slice(0, -4)}0.2)`);
        gradient.addColorStop(1, `${this.color.slice(0, -4)}0)`);
        
        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create glow orbs
    const orbs: GlowOrb[] = [];
    for (let i = 0; i < glowCount; i++) {
      orbs.push(new GlowOrb());
    }
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update all orbs
      orbs.forEach(orb => {
        orb.update();
        orb.draw();
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', setDimensions);
      cancelAnimationFrame(animationId);
    };
  }, [variant, intensity, color]);
  
  // For default variant, we'll use a simple CSS-based animation
  if (variant === 'default') {
    return (
      <div className="fixed inset-0 -z-20 pointer-events-none overflow-hidden">
        <div 
          className="absolute -top-[40%] -right-[40%] w-[70%] h-[70%] rounded-full blur-3xl"
          style={{ 
            background: `${color}`,
            opacity: intensity === 'low' ? 0.1 : intensity === 'medium' ? 0.15 : 0.2,
            animation: 'pulse 15s ease-in-out infinite'
          }}
        ></div>
        <div 
          className="absolute -bottom-[30%] -left-[30%] w-[60%] h-[60%] rounded-full blur-3xl"
          style={{ 
            background: `${color}`,
            opacity: intensity === 'low' ? 0.08 : intensity === 'medium' ? 0.12 : 0.18,
            animation: 'pulse 20s ease-in-out infinite reverse'
          }}
        ></div>
        
        <style jsx>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
        `}</style>
      </div>
    );
  }
  
  // For canvas-based variants
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 -z-20 pointer-events-none" 
    />
  );
};

export default BackgroundAnimation; 