import React from 'react';
import { motion } from 'framer-motion';

const TOTAL_QUESTIONS = 5;
const RADIUS = 150;

const StarProgressBar = ({ stars }) => {
  const containerStyle = {
    position: 'relative',
    width: '400px',
    height: '800px',
    margin: '24px auto',
    overflow: 'hidden',

  };

  const backgroundStyle = {
    position: 'absolute',
    width: '300px',
    height: '300px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0,
  };

  const manyStarsStyle = {
    position: 'absolute',
    width: '800px',
    height: '800px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 0.5,
    opacity: 0.8,
    pointerEvents: 'none',
  };

  return (
    <div style={containerStyle}>
      {/* Glowing background with blinking stars */}
      <motion.img
        src="/starsback.svg"
        alt="Many Stars"
        style={manyStarsStyle}
        animate={{
          opacity: [0.1, 0.8, 0.1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Circular background */}
      <img
        src="/round.svg"
        alt="Circle"
        style={backgroundStyle}
      />

      {/* Only render active stars */}
      {Array.from({ length: stars }).map((_, index) => {
        const angle = (360 / TOTAL_QUESTIONS) * index - 90;
        const radians = (angle * Math.PI) / 180;
        const x = Math.cos(radians) * RADIUS - 15;
        const y = Math.sin(radians) * RADIUS - 15;

        const starSrc = `/${index + 1}.svg`;

        const starStyle = {
          position: 'absolute',
          left: `calc(50% + ${x}px)`,
          top: `calc(50% + ${y}px)`,
          transform: 'translate(-50%, -50%)',
          transformOrigin: 'center center',
          width: '32px',
          height: '32px',
          zIndex: 1,
        };

        return (
          <motion.img
            key={index}
            src={starSrc}
            alt={`Star ${index + 1}`}
            style={starStyle}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 2,
              delay: 0.05 * index,
            }}
          />
        );
      })}
    </div>
  );
};

export default StarProgressBar;
