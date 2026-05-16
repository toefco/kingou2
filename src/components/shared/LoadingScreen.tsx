import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  minDuration?: number;
  onLoadingComplete?: () => void;
}

export default function LoadingScreen({ 
  minDuration = 2000, 
  onLoadingComplete 
}: LoadingScreenProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsComplete(true);
      setOpacity(0);
      setTimeout(() => {
        onLoadingComplete?.();
      }, 800);
    }, minDuration);

    return () => clearTimeout(timer);
  }, [minDuration, onLoadingComplete]);

  if (isComplete) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-800"
      style={{ 
        background: 'linear-gradient(135deg, #03020f 0%, #0a0a1f 50%, #1a0a2f 100%)',
        opacity: opacity 
      }}
    >
      {/* 背景星空动画 */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(80)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 4 + 1}px`,
              height: `${Math.random() * 4 + 1}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 3 + 1}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* 主内容：衡方碑隶书"靜"字 */}
      <div className="relative z-10 flex items-center justify-center">
        <div 
          className="text-gold font-serif animate-pulse"
          style={{
            fontSize: '80vh',
            lineHeight: 1,
            filter: 'drop-shadow(0 0 40px rgba(212, 175, 55, 0.3))',
            opacity: 0.8
          }}
        >
          靜
        </div>
      </div>

      {/* CSS动画 */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { 
            opacity: 0.3; 
            transform: scale(1); 
          }
          50% { 
            opacity: 1; 
            transform: scale(1.3); 
          }
        }
        
        .duration-800 {
          transition-duration: 800ms;
        }
      `}</style>
    </div>
  );
}
