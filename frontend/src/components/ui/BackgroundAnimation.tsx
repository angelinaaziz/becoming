import React, { useEffect, useRef } from 'react';

interface BackgroundAnimationProps {
  variant?: 'default' | 'cosmic' | 'minimal' | 'matrix' | 'particles' | 'hexGrid' | 'glow';
  density?: 'low' | 'medium' | 'high';
  speed?: 'slow' | 'medium' | 'fast';
  color?: string;
  interactive?: boolean;
  intensity?: 'low' | 'medium' | 'high'; // Added to maintain compatibility with Layout usage
}

/**
 * A component that adds beautiful animated background effects
 */
const BackgroundAnimation: React.FC<BackgroundAnimationProps> = ({
  variant = 'default',
  density = 'medium',
  speed = 'medium',
  color = 'rgba(151, 71, 255, 0.6)',
  interactive = true,
  intensity
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Convert props to actual values
  const particleDensity = {
    low: 30,
    medium: 60,
    high: 100
  }[intensity || density]; // Use intensity if provided, fall back to density
  
  const animationSpeed = {
    slow: 0.5,
    medium: 1,
    fast: 2
  }[speed];
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size
    const setCanvasSize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    // Initial setup
    setCanvasSize();
    window.addEventListener('resize', setCanvasSize);
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }
    
    // Create particles
    const particles: any[] = [];
    const createParticles = () => {
      particles.length = 0;
      const count = Math.min(particleDensity, 150); // Cap at 150 for performance
      
      for (let i = 0; i < count; i++) {
        const particle: any = {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * animationSpeed,
          speedY: (Math.random() - 0.5) * animationSpeed,
          opacity: Math.random() * 0.5 + 0.2
        };
        
        // Additional properties for cosmic variant
        if (variant === 'cosmic') {
          particle.glow = Math.random() > 0.7;
          particle.pulseSpeed = Math.random() * 0.03 + 0.01;
          particle.pulseDirection = 1;
          particle.pulseOpacity = particle.opacity;
        }
        
        // Matrix variant properties
        if (variant === 'matrix') {
          particle.length = Math.floor(Math.random() * 15) + 5;
          particle.speed = (Math.random() * 2 + 1) * animationSpeed;
          particle.value = String.fromCharCode(Math.floor(Math.random() * 90) + 33);
          particle.switchInterval = Math.floor(Math.random() * 50) + 10;
          particle.switchCounter = 0;
        }
        
        // Particles variant specifics (similar to default but with different behavior)
        if (variant === 'particles') {
          particle.size = Math.random() * 3 + 0.5;
          particle.speedX = (Math.random() - 0.5) * animationSpeed * 0.7;
          particle.speedY = (Math.random() - 0.5) * animationSpeed * 0.7;
        }
        
        // HexGrid variant specifics
        if (variant === 'hexGrid') {
          particle.size = Math.random() * 2 + 0.5;
          particle.speedX = (Math.random() - 0.5) * animationSpeed * 0.3;
          particle.speedY = (Math.random() - 0.5) * animationSpeed * 0.3;
          particle.isHex = Math.random() > 0.7;
        }
        
        // Glow variant specifics
        if (variant === 'glow') {
          particle.size = Math.random() * 4 + 1;
          particle.glow = true;
          particle.pulseSpeed = Math.random() * 0.02 + 0.005;
          particle.pulseDirection = 1;
          particle.pulseOpacity = particle.opacity;
        }
        
        particles.push(particle);
      }
    };
    
    createParticles();
    
    // Draw methods for different variants
    const drawMethods: Record<string, () => void> = {
      default: () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'rgba(10, 10, 20, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const p of particles) {
          // Update position
          p.x += p.speedX;
          p.y += p.speedY;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Connect to nearby particles
          ctx.strokeStyle = color;
          particles.forEach(p2 => {
            const dx = p.x - p2.x;
            const dy = p.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Only connect if close enough
            if (distance < 100) {
              ctx.beginPath();
              ctx.globalAlpha = (1 - distance / 100) * Math.min(p.opacity, p2.opacity);
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          });
          
          // Draw particle
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Mouse interaction
          if (interactive) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
              const force = (120 - distance) / 500;
              p.speedX += force * (p.x > mouseX ? 1 : -1);
              p.speedY += force * (p.y > mouseY ? 1 : -1);
              
              // Limit speed
              const maxSpeed = 2 * animationSpeed;
              const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
              if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
              }
            }
          }
        }
      },
      
      cosmic: () => {
        // Create a fading cosmic background
        ctx.fillStyle = 'rgba(5, 5, 15, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add a subtle gradient backdrop
        const gradientBg = ctx.createRadialGradient(
          canvas.width / 2, 
          canvas.height / 2, 
          0, 
          canvas.width / 2, 
          canvas.height / 2, 
          canvas.width * 0.8
        );
        gradientBg.addColorStop(0, 'rgba(60, 20, 90, 0.1)');
        gradientBg.addColorStop(0.5, 'rgba(20, 10, 50, 0.05)');
        gradientBg.addColorStop(1, 'rgba(5, 5, 15, 0)');
        
        ctx.fillStyle = gradientBg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw cosmic dust and stars
        for (const p of particles) {
          // Update position with slight drift
          p.x += p.speedX;
          p.y += p.speedY;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Pulsing effect for cosmic particles
          if (p.glow) {
            p.pulseOpacity += p.pulseDirection * p.pulseSpeed;
            if (p.pulseOpacity > 0.8 || p.pulseOpacity < 0.2) {
              p.pulseDirection *= -1;
            }
            p.opacity = p.pulseOpacity;
          }
          
          // Draw glow for some particles
          if (p.glow) {
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
            gradient.addColorStop(0, `rgba(151, 71, 255, ${p.opacity * 1.2})`);
            gradient.addColorStop(0.5, `rgba(151, 71, 255, ${p.opacity * 0.5})`);
            gradient.addColorStop(1, 'rgba(151, 71, 255, 0)');
            
            ctx.beginPath();
            ctx.fillStyle = gradient;
            ctx.arc(p.x, p.y, p.size * 6, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // Draw the particle
          ctx.beginPath();
          ctx.globalAlpha = p.opacity;
          ctx.fillStyle = p.glow ? '#ffffff' : color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Connect nearby particles with cosmic threads
          if (Math.random() > 0.99) { // Occasional connection for performance
            const nearbyParticles = particles.filter(p2 => {
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              return Math.sqrt(dx * dx + dy * dy) < 200;
            }).slice(0, 3); // Limit connections
            
            nearbyParticles.forEach(p2 => {
              const gradient = ctx.createLinearGradient(p.x, p.y, p2.x, p2.y);
              gradient.addColorStop(0, `rgba(151, 71, 255, ${p.opacity * 0.7})`);
              gradient.addColorStop(1, `rgba(168, 85, 247, ${p2.opacity * 0.7})`);
              
              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 0.5;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            });
          }
          
          // Mouse interaction (cosmic attraction)
          if (interactive) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
              // Draw connection to mouse
              const gradient = ctx.createLinearGradient(p.x, p.y, mouseX, mouseY);
              gradient.addColorStop(0, `rgba(151, 71, 255, ${p.opacity * 0.8})`);
              gradient.addColorStop(1, 'rgba(151, 71, 255, 0)');
              
              ctx.beginPath();
              ctx.strokeStyle = gradient;
              ctx.lineWidth = 0.6;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(mouseX, mouseY);
              ctx.stroke();
              
              // Gentle attraction to mouse
              const force = (200 - distance) / 8000;
              p.speedX += force * (mouseX - p.x);
              p.speedY += force * (mouseY - p.y);
              
              // Random jitter
              p.speedX += (Math.random() - 0.5) * 0.01;
              p.speedY += (Math.random() - 0.5) * 0.01;
              
              // Limit speed
              const maxSpeed = 1 * animationSpeed;
              const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
              if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
              }
            }
          }
        }
        
        // Draw occasional lens flares
        if (Math.random() > 0.99) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 100 + 50;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
          gradient.addColorStop(0.5, 'rgba(151, 71, 255, 0.02)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      
      minimal: () => {
        // Subtle, minimal animation
        ctx.fillStyle = 'rgba(10, 10, 20, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const p of particles) {
          // Slower movement
          p.x += p.speedX * 0.5;
          p.y += p.speedY * 0.5;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Draw just a few connections
          if (Math.random() > 0.995) {
            const nearestParticle = particles.reduce((nearest, p2) => {
              if (p === p2) return nearest;
              
              const dx = p.x - p2.x;
              const dy = p.y - p2.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (!nearest || distance < nearest.distance) {
                return { particle: p2, distance };
              }
              return nearest;
            }, null);
            
            if (nearestParticle && nearestParticle.distance < 100) {
              ctx.beginPath();
              ctx.globalAlpha = 0.1;
              ctx.strokeStyle = color;
              ctx.lineWidth = 0.3;
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(nearestParticle.particle.x, nearestParticle.particle.y);
              ctx.stroke();
            }
          }
          
          // Draw tiny dots
          ctx.beginPath();
          ctx.globalAlpha = p.opacity * 0.6;
          ctx.fillStyle = color;
          ctx.arc(p.x, p.y, p.size * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      
      matrix: () => {
        // Matrix-style rain effect
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const p of particles) {
          // Only move vertically for matrix effect
          p.y += p.speed;
          
          // Reset when reaching bottom
          if (p.y > canvas.height) {
            p.y = 0;
            p.x = Math.random() * canvas.width;
          }
          
          // Occasionally change character
          p.switchCounter++;
          if (p.switchCounter >= p.switchInterval) {
            p.value = String.fromCharCode(Math.floor(Math.random() * 90) + 33);
            p.switchCounter = 0;
          }
          
          // Draw the character stream
          for (let i = 0; i < p.length; i++) {
            // Calculate opacity based on position in the stream
            const streamOpacity = (p.length - i) / p.length * p.opacity;
            
            // Head of the stream is brighter
            const isHead = i === 0;
            const displayValue = Math.random() > 0.9 ? 
              String.fromCharCode(Math.floor(Math.random() * 90) + 33) : p.value;
            
            ctx.fillStyle = isHead ? '#ffffff' : color;
            ctx.globalAlpha = isHead ? 1 : streamOpacity;
            ctx.font = `${p.size * 10}px monospace`;
            ctx.fillText(displayValue, p.x, p.y - i * 15);
          }
        }
      },
      
      // New variant for the particles effect (lighter than default)
      particles: () => {
        ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (const p of particles) {
          // Update position with slower movement
          p.x += p.speedX;
          p.y += p.speedY;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Draw particle with slight glow
          ctx.beginPath();
          ctx.globalAlpha = p.opacity * 0.8;
          ctx.fillStyle = color;
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          
          // Mouse attraction (subtle)
          if (interactive) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 100) {
              const force = (100 - distance) / 8000;
              p.speedX += force * (mouseX - p.x);
              p.speedY += force * (mouseY - p.y);
              
              // Limit speed
              const maxSpeed = 0.8 * animationSpeed;
              const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
              if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
              }
            }
          }
        }
      },
      
      // Hexagon grid pattern variant
      hexGrid: () => {
        ctx.fillStyle = 'rgba(10, 10, 20, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Create hexagon grid lines
        const hexSize = 50;
        const rows = Math.ceil(canvas.height / (hexSize * 1.5));
        const cols = Math.ceil(canvas.width / (hexSize * Math.sqrt(3)));
        
        ctx.strokeStyle = 'rgba(151, 71, 255, 0.1)';
        ctx.lineWidth = 0.5;
        
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * hexSize * Math.sqrt(3);
            const y = row * hexSize * 1.5;
            const offset = (row % 2) * (hexSize * Math.sqrt(3) / 2);
            
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const xPos = x + offset + hexSize * Math.cos(angle);
              const yPos = y + hexSize * Math.sin(angle);
              
              if (i === 0) {
                ctx.moveTo(xPos, yPos);
              } else {
                ctx.lineTo(xPos, yPos);
              }
            }
            ctx.closePath();
            ctx.stroke();
          }
        }
        
        // Draw floating particles over the grid
        for (const p of particles) {
          p.x += p.speedX * 0.3;
          p.y += p.speedY * 0.3;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Draw either small dots or tiny hexagons
          if (p.isHex) {
            ctx.beginPath();
            ctx.globalAlpha = p.opacity * 0.5;
            ctx.strokeStyle = color;
            ctx.lineWidth = 0.5;
            
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3;
              const xPos = p.x + p.size * 2 * Math.cos(angle);
              const yPos = p.y + p.size * 2 * Math.sin(angle);
              
              if (i === 0) {
                ctx.moveTo(xPos, yPos);
              } else {
                ctx.lineTo(xPos, yPos);
              }
            }
            ctx.closePath();
            ctx.stroke();
          } else {
            ctx.beginPath();
            ctx.globalAlpha = p.opacity * 0.6;
            ctx.fillStyle = color;
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      },
      
      // Glow effect variant
      glow: () => {
        // Create a dark background with subtle fade
        ctx.fillStyle = 'rgba(10, 10, 30, 0.2)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw glowing particles
        for (const p of particles) {
          // Update position with gentle motion
          p.x += p.speedX * 0.4;
          p.y += p.speedY * 0.4;
          
          // Wrap around edges
          if (p.x < 0) p.x = canvas.width;
          if (p.x > canvas.width) p.x = 0;
          if (p.y < 0) p.y = canvas.height;
          if (p.y > canvas.height) p.y = 0;
          
          // Pulsing effect
          p.pulseOpacity += p.pulseDirection * p.pulseSpeed;
          if (p.pulseOpacity > 0.7 || p.pulseOpacity < 0.2) {
            p.pulseDirection *= -1;
          }
          p.opacity = p.pulseOpacity;
          
          // Draw glow
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 8);
          gradient.addColorStop(0, `rgba(151, 71, 255, ${p.opacity * 0.8})`);
          gradient.addColorStop(0.5, `rgba(151, 71, 255, ${p.opacity * 0.3})`);
          gradient.addColorStop(1, 'rgba(151, 71, 255, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(p.x, p.y, p.size * 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Draw the particle core
          ctx.beginPath();
          ctx.globalAlpha = p.opacity + 0.2;
          ctx.fillStyle = '#ffffff';
          ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Mouse interaction (attraction effect)
          if (interactive) {
            const dx = p.x - mouseX;
            const dy = p.y - mouseY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
              // Stronger glow near mouse
              const mouseGradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 12);
              mouseGradient.addColorStop(0, `rgba(151, 71, 255, ${p.opacity * 1.5})`);
              mouseGradient.addColorStop(0.5, `rgba(151, 71, 255, ${p.opacity * 0.5})`);
              mouseGradient.addColorStop(1, 'rgba(151, 71, 255, 0)');
              
              ctx.beginPath();
              ctx.fillStyle = mouseGradient;
              ctx.arc(p.x, p.y, p.size * 12, 0, Math.PI * 2);
              ctx.fill();
              
              // Gentle attraction to mouse
              const force = (150 - distance) / 10000;
              p.speedX += force * (mouseX - p.x);
              p.speedY += force * (mouseY - p.y);
              
              // Limit speed
              const maxSpeed = 0.7 * animationSpeed;
              const currentSpeed = Math.sqrt(p.speedX * p.speedX + p.speedY * p.speedY);
              if (currentSpeed > maxSpeed) {
                p.speedX = (p.speedX / currentSpeed) * maxSpeed;
                p.speedY = (p.speedY / currentSpeed) * maxSpeed;
              }
            }
          }
        }
        
        // Occasional large ambient glow
        if (Math.random() > 0.995) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 200 + 100;
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
          gradient.addColorStop(0, 'rgba(151, 71, 255, 0.05)');
          gradient.addColorStop(0.5, 'rgba(151, 71, 255, 0.02)');
          gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.fillStyle = gradient;
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    
    // Fallback to default if variant doesn't exist
    const getDrawMethod = (variant: string) => {
      return drawMethods[variant] || drawMethods.default;
    };
    
    // Animation loop
    let animationFrame: number;
    
    const animate = () => {
      getDrawMethod(variant)();
      animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', setCanvasSize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [variant, density, speed, color, interactive, particleDensity, animationSpeed]);
  
  return (
    <canvas 
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ pointerEvents: 'none' }}
    />
  );
};

export default BackgroundAnimation; 