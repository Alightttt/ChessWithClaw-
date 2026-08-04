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
  <svg viewBox="0 0 24 48" className={`w-12 sm:w-16 h-auto text-[#f2f2f2] opacity-40 ${className || ''}`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M11 44C6 38 2 28 2 18C2 10 5 4 8 0C7 4 7 8 8 12C5 10 3 9 1 9C3 13 6 15 9 16C6 16 4 15 2 15C4 19 7 21 10 22C7 22 5 21 3 21C5 25 8 27 11 28C8 28 6 27 4 27C6 31 9 33 12 34C11 36 10 38 11 44Z" />
  </svg>
);

export default function LivePlatformActivity() {
  const { count, elementRef } = useLiveActivity();

  return (
    <section ref={elementRef} className="w-full max-w-[1200px] mx-auto mb-20 md:mb-32 px-4 sm:px-6 font-sans relative overflow-visible py-16 sm:py-24 flex flex-col items-center justify-center text-center">
      {/* Ambient red blurred glow behind the number */}
      

      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-10 w-full overflow-visible">
        <OliveBranch left />
        <div className="flex flex-col items-center min-w-0 max-w-full overflow-visible">
          <div
            className="font-black text-6xl sm:text-[100px] md:text-[180px] lg:text-[220px] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f0f0f0] to-[#b0b0b0] drop-shadow-2xl overflow-visible px-4"
            style={{ lineHeight: 1, fontFamily: "'Inter', sans-serif" }}
          >
            <NumberCounter count={count} />
          </div>
          <div className="mt-2 sm:mt-4 opacity-80">
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
