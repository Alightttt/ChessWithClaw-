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
  <svg viewBox="0 0 100 310" className={`h-[300px] sm:h-[390px] md:h-[505px] lg:h-[575px] w-auto text-[#f2f2f2] opacity-[0.25] ${className || ''}`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path d="M 55 295 Q 10 150 60 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4"/>
    <ellipse cx="52.4" cy="273.3" rx="6.2" ry="16.2" transform="rotate(94.4 52.4 273.3)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="45.2" cy="240.9" rx="5.9" ry="15.4" transform="rotate(151.8 45.2 240.9)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="42.1" cy="209.5" rx="5.6" ry="14.6" transform="rotate(76.4 42.1 209.5)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="42.4" cy="178.9" rx="5.3" ry="13.9" transform="rotate(163.6 42.4 178.9)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="45.9" cy="149.3" rx="5.0" ry="13.1" transform="rotate(58.4 45.9 149.3)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="52.4" cy="120.6" rx="4.7" ry="12.3" transform="rotate(175.4 52.4 120.6)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="61.5" cy="92.7" rx="4.4" ry="11.6" transform="rotate(40.4 61.5 92.7)" fill="currentColor" opacity="0.55"/>
    <ellipse cx="72.9" cy="65.8" rx="4.1" ry="10.8" transform="rotate(187.2 72.9 65.8)" fill="currentColor" opacity="0.55"/>
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
