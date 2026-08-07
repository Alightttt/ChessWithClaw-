import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { useLiveActivity } from '../../hooks/useLiveActivity';
import { Activity } from 'lucide-react';

const NumberCounter = ({ count }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(count);
      setIsFinished(true);
      return;
    }

    let startTimestamp = null;
    const duration = 2000;
    const initialValue = 0;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      setDisplayValue(Math.floor(easeProgress * (count - initialValue) + initialValue));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setDisplayValue(count);
        setIsFinished(true);
      }
    };
    window.requestAnimationFrame(step);
  }, [count, isInView]);

  return (
    <div ref={ref} className="relative inline-block w-full text-center overflow-visible">
      {/* Radial glow flash behind the number */}
      <motion.div
        className="absolute inset-0 m-auto w-[150%] h-[150%] rounded-full pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle, rgba(230,57,70,0.5) 0%, rgba(230,57,70,0) 70%)',
        }}
        initial={{ opacity: 0 }}
        animate={isFinished ? { opacity: [0, 0.4, 0] } : { opacity: 0 }}
        transition={isFinished ? {
          duration: 0.4,
          times: [0, 0.3, 1],
          ease: "easeOut"
        } : undefined}
      />
      <motion.span
        className="relative z-10 tabular-nums drop-shadow-[0_0_40px_rgba(230,57,70,0.3)] inline-block w-full text-center"
        animate={isFinished ? { scale: [1, 1.08, 1] } : { scale: 1 }}
        transition={isFinished ? {
          duration: 0.4,
          ease: [0.34, 1.56, 0.64, 1],
        } : undefined}
      >
        {displayValue.toLocaleString()}
      </motion.span>
    </div>
  );
};


const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 100 200" className={`h-[300px] sm:h-[390px] md:h-[505px] lg:h-[575px] w-auto text-[#f2f2f2] opacity-[0.25] ${className || ''}`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M 45 190 Q 75 120 90 20 Q 80 120 50 190 Z M 53.3 169.4 Q 72.0 176.4 40.5 142.3 Q 62.6 172.9 53.3 169.4 Z M 53.3 169.4 Q 34.5 162.4 80.8 157.4 Q 43.9 165.9 53.3 169.4 Z M 60.9 147.6 Q 79.9 153.8 47.0 121.0 Q 70.4 150.7 60.9 147.6 Z M 60.9 147.6 Q 41.9 141.3 87.9 134.4 Q 51.4 144.4 60.9 147.6 Z M 68.0 124.5 Q 87.2 130.0 53.0 98.5 Q 77.6 127.2 68.0 124.5 Z M 68.0 124.5 Q 48.7 119.0 94.4 110.3 Q 58.3 121.8 68.0 124.5 Z M 74.4 100.2 Q 93.8 105.0 58.5 74.8 Q 84.1 102.6 74.4 100.2 Z M 74.4 100.2 Q 55.0 95.4 100.3 85.0 Q 64.7 97.8 74.4 100.2 Z M 80.2 74.7 Q 99.8 78.8 63.5 49.8 Q 90.0 76.8 80.2 74.7 Z M 80.2 74.7 Q 60.6 70.6 105.6 58.7 Q 70.4 72.6 80.2 74.7 Z M 85.4 48.0 Q 105.1 51.5 67.9 23.6 Q 95.3 49.7 85.4 48.0 Z M 85.4 48.0 Q 65.7 44.4 110.3 31.2 Q 75.6 46.2 85.4 48.0 Z" />
  </svg>
);

export default function LivePlatformActivity() {
  const { count, elementRef } = useLiveActivity();

  return (
    <section ref={elementRef} className="w-full max-w-[1200px] mx-auto mb-8 md:mb-12 px-4 sm:px-6 font-sans relative overflow-visible py-8 sm:py-12 flex flex-col items-center justify-center text-center">
      {/* Ambient red blurred glow behind the number */}
      

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="relative z-10 flex items-center justify-center gap-6 sm:gap-12 w-full overflow-visible">
        <OliveBranch left />
        <div className="flex flex-col items-center min-w-0 max-w-full overflow-visible">
          <div
            className="font-black text-[92px] sm:text-[160px] md:text-[220px] lg:text-[290px] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f0f0f0] to-[#b0b0b0] drop-shadow-2xl overflow-visible px-4"
            style={{ lineHeight: 1, fontFamily: "'Inter', sans-serif" }}
          >
            <NumberCounter count={count} />
          </div>
          <div className="-mt-1 sm:-mt-0.5 opacity-80">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase text-white whitespace-nowrap">
              Global Matches Played
            </span>
          </div>
        </div>
        <OliveBranch />
      </div>
    </section>
  );
}
