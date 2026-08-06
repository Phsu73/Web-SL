import { useTheme } from '@mui/material/styles';
import { useMemo, useState, useEffect } from 'react';

const Background = ({ children }) => {
  const theme = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const glowStyle = useMemo(() => ({
    left: `${(mousePosition.x / window.innerWidth) * 100}%`,
    top: `${(mousePosition.y / window.innerHeight) * 100}%`,
  }), [mousePosition]);

  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: theme.palette.background.gradient,
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          zIndex: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, rgba(255, 107, 53, 0.15) 0%, rgba(247, 147, 30, 0) 50%)',
        }}
      >
        {/* Animated Grid */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(255, 107, 53, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 107, 53, 0.08) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            opacity: 0.4,
            transform: 'perspective(900px) rotateX(60deg) translateY(15%)',
            transformOrigin: 'center top',
            animation: 'gridFloat 20s linear infinite',
          }}
        />

        {/* Large Sun-like Orb 1 */}
        <div
          style={{
            position: 'absolute',
            width: '50rem',
            height: '50rem',
            borderRadius: '50%',
            top: '-12rem',
            left: '-12rem',
            filter: 'blur(80px)',
            animation: 'sunPulse 8s ease-in-out infinite',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 200, 50, 0.8) 0%, rgba(255, 107, 53, 0.5) 30%, rgba(247, 147, 30, 0.2) 60%, transparent 80%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '10%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 255, 200, 0.6) 0%, rgba(255, 150, 50, 0.4) 40%, transparent 70%)',
              animation: 'sunRotate 20s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '20%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 100, 30, 0.3) 0%, transparent 60%)',
              animation: 'sunPulse 4s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Large Sun-like Orb 2 */}
        <div
          style={{
            position: 'absolute',
            width: '40rem',
            height: '40rem',
            borderRadius: '50%',
            bottom: '-10rem',
            right: '-8rem',
            filter: 'blur(90px)',
            animation: 'sunPulse 10s ease-in-out infinite reverse',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 180, 80, 0.7) 0%, rgba(247, 147, 30, 0.4) 35%, rgba(255, 107, 53, 0.15) 65%, transparent 85%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '15%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 220, 150, 0.5) 0%, rgba(255, 130, 60, 0.3) 45%, transparent 75%)',
              animation: 'sunRotate 25s linear infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '25%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 80, 20, 0.25) 0%, transparent 55%)',
              animation: 'sunPulse 5s ease-in-out infinite',
            }}
          />
        </div>

        {/* Medium Floating Sun Orbs */}
        <div
          style={{
            position: 'absolute',
            width: '14rem',
            height: '14rem',
            borderRadius: '50%',
            left: '15%',
            top: '25%',
            animation: 'floatOrb 10s ease-in-out infinite',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 180, 80, 0.6) 0%, rgba(255, 107, 53, 0.3) 50%, transparent 80%)',
              filter: 'blur(20px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '20%',
              borderRadius: '50%',
              border: '2px solid rgba(255, 200, 100, 0.4)',
              boxShadow: '0 0 30px rgba(255, 150, 50, 0.3), inset 0 0 20px rgba(255, 200, 100, 0.2)',
              animation: 'sunGlow 3s ease-in-out infinite',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            width: '16rem',
            height: '16rem',
            borderRadius: '50%',
            right: '12%',
            bottom: '20%',
            animation: 'floatOrb 12s ease-in-out infinite reverse',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 200, 100, 0.5) 0%, rgba(247, 147, 30, 0.25) 55%, transparent 85%)',
              filter: 'blur(25px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '25%',
              borderRadius: '50%',
              border: '2px solid rgba(255, 220, 150, 0.35)',
              boxShadow: '0 0 35px rgba(255, 180, 80, 0.25), inset 0 0 25px rgba(255, 220, 150, 0.15)',
              animation: 'sunGlow 4s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Small Accent Sun Particles */}
        <div
          style={{
            position: 'absolute',
            width: '7rem',
            height: '7rem',
            borderRadius: '50%',
            left: '25%',
            bottom: '35%',
            animation: 'floatOrb 8s ease-in-out infinite',
            animationDelay: '2s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 220, 150, 0.7) 0%, rgba(255, 150, 50, 0.4) 40%, transparent 75%)',
              filter: 'blur(8px)',
              animation: 'particlePulse 2s ease-in-out infinite',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            width: '9rem',
            height: '9rem',
            borderRadius: '50%',
            right: '20%',
            top: '30%',
            animation: 'floatOrb 11s ease-in-out infinite reverse',
            animationDelay: '3s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 240, 180, 0.6) 0%, rgba(247, 147, 30, 0.35) 45%, transparent 80%)',
              filter: 'blur(10px)',
              animation: 'particlePulse 2.5s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Additional Small Particles */}
        <div
          style={{
            position: 'absolute',
            width: '4rem',
            height: '4rem',
            borderRadius: '50%',
            left: '40%',
            top: '15%',
            animation: 'floatOrb 6s ease-in-out infinite',
            animationDelay: '1s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 200, 100, 0.5) 0%, transparent 70%)',
              filter: 'blur(5px)',
              animation: 'particlePulse 1.5s ease-in-out infinite',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            width: '5rem',
            height: '5rem',
            borderRadius: '50%',
            right: '30%',
            bottom: '40%',
            animation: 'floatOrb 9s ease-in-out infinite reverse',
            animationDelay: '4s',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255, 180, 80, 0.45) 0%, transparent 65%)',
              filter: 'blur(6px)',
              animation: 'particlePulse 1.8s ease-in-out infinite reverse',
            }}
          />
        </div>

        {/* Floating Triangles */}
        <div
          style={{
            position: 'absolute',
            width: '0',
            height: '0',
            borderLeft: '30px solid transparent',
            borderRight: '30px solid transparent',
            borderBottom: '52px solid rgba(255, 200, 100, 0.15)',
            left: '10%',
            top: '30%',
            animation: 'floatShape 15s ease-in-out infinite',
            filter: 'blur(2px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '0',
            height: '0',
            borderLeft: '20px solid transparent',
            borderRight: '20px solid transparent',
            borderBottom: '35px solid rgba(255, 150, 50, 0.12)',
            right: '15%',
            top: '45%',
            animation: 'floatShape 18s ease-in-out infinite reverse',
            filter: 'blur(1px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '0',
            height: '0',
            borderLeft: '25px solid transparent',
            borderRight: '25px solid transparent',
            borderBottom: '43px solid rgba(247, 147, 30, 0.1)',
            left: '25%',
            bottom: '25%',
            animation: 'floatShape 20s ease-in-out infinite',
            animationDelay: '2s',
            filter: 'blur(1.5px)',
          }}
        />

        {/* Floating Hexagons */}
        <div
          style={{
            position: 'absolute',
            width: '60px',
            height: '35px',
            backgroundColor: 'rgba(255, 180, 80, 0.1)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            right: '20%',
            top: '20%',
            animation: 'floatShape 22s ease-in-out infinite reverse',
            filter: 'blur(1px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '45px',
            height: '26px',
            backgroundColor: 'rgba(255, 220, 150, 0.12)',
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
            left: '15%',
            bottom: '30%',
            animation: 'floatShape 17s ease-in-out infinite',
            animationDelay: '3s',
            filter: 'blur(0.5px)',
          }}
        />

        {/* Noise Texture Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            pointerEvents: 'none',
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Light Sweep Lines */}
        <div
          style={{
            position: 'absolute',
            width: '25rem',
            height: '0.15rem',
            background: 'linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.6), transparent)',
            top: '35%',
            left: '8%',
            transform: 'rotate(-15deg)',
            opacity: 0.6,
            filter: 'blur(0.5px)',
            animation: 'sweep 10s linear infinite',
          }}
        />

        <div
          style={{
            position: 'absolute',
            width: '20rem',
            height: '0.15rem',
            background: 'linear-gradient(90deg, transparent, rgba(247, 147, 30, 0.5), transparent)',
            bottom: '25%',
            right: '6%',
            transform: 'rotate(12deg)',
            opacity: 0.5,
            filter: 'blur(0.5px)',
            animation: 'sweep 13s linear infinite reverse',
          }}
        />

        {/* Mouse Follow Glow */}
        <div
          style={{
            position: 'absolute',
            width: '25rem',
            height: '25rem',
            borderRadius: '50%',
            border: '2px solid rgba(255, 107, 53, 0.15)',
            transform: 'translate(-50%, -50%)',
            left: glowStyle.left,
            top: glowStyle.top,
            opacity: 0.4,
            pointerEvents: 'none',
            transition: 'left 0.1s ease, top 0.1s ease',
            boxShadow: '0 0 120px rgba(255, 107, 53, 0.2), inset 0 0 60px rgba(255, 200, 100, 0.1)',
            background: 'radial-gradient(circle, rgba(255, 200, 100, 0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      <div style={{ position: 'relative', zIndex: 2 }}>{children}</div>
    </div>
  );
};

export default Background;
