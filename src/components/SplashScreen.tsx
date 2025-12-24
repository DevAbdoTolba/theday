import React, { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import Image from 'next/image';

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export default function SplashScreen({ onComplete, duration = 2000 }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, duration - 600);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [duration, onComplete]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #151a2c 0%, #0d1117 100%)',
        overflow: 'hidden',
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'scale(1.1)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Logo with bounce */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          animation: 'logoBounce 1.5s ease-in-out infinite',
          '@keyframes logoBounce': {
            '0%, 100%': { transform: 'translateY(0) scale(1)' },
            '50%': { transform: 'translateY(-12px) scale(1.03)' },
          },
        }}
      >
        <Image
          src="/icon-512x512.png"
          alt="TheDay"
          width={120}
          height={120}
          style={{
            filter: 'drop-shadow(0 0 40px rgba(25,118,210,0.6))',
          }}
          priority
        />
      </Box>

      {/* Pulsing ring */}
      <Box
        sx={{
          position: 'absolute',
          width: 160,
          height: 160,
          border: '2px solid rgba(25,118,210,0.3)',
          borderRadius: '50%',
          animation: 'ringPulse 1.5s ease-out infinite',
          '@keyframes ringPulse': {
            '0%': { transform: 'scale(0.8)', opacity: 1 },
            '100%': { transform: 'scale(2)', opacity: 0 },
          },
        }}
      />
    </Box>
  );
}
