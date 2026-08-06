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
  <svg viewBox="0 0 100 200" className={`h-[260px] sm:h-[340px] md:h-[440px] lg:h-[500px] w-auto text-[#f2f2f2] opacity-[0.25] ${className || ''}`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M31.3 194.2c-4-4.8-6.1-11-7.8-17-3-11.4-4-23.3-4.5-35-.6-14-1.2-28.7 1.8-42.3 2-9 5.3-17.7 9.8-25.5 4.1-7.2 9.5-13.6 15.6-19.1 5.9-5.3 12.8-9.3 20-12.7 6.3-3 13.5-5.3 19.9-8.4 2.1-1 4.3-1.6 6.5-2.5 1.5-.6 3.1-1 4.5-1.7-1.1-.4-2.2-.7-3.4-1.1-6-2-12.3-3.1-18.6-3.8-10.4-1.1-20.9-.3-31 .7-7.2.7-14.7.7-21.7 2.3-4.1.9-8.3 1.9-12.2 3.5C8 32.5 4.5 35 1.8 38.3c-.6.8-1.5 2-2 3 .5-1 1.4-1.9 2-2.7 3-4.1 6.8-7.5 11.2-10 4.6-2.6 10-3.9 15.3-5 5.8-1.1 11.7-1.7 17.6-2.4 9-.9 18.2-1.3 27.2-.6 6 .4 11.9 1.4 17.6 3 4.2 1.2 8.3 2.7 12 5.1-4.2.9-8.2 2.6-12.2 4.1-8.5 3.1-16.7 7-24.5 11.5-6.6 3.8-12.8 8.4-18.2 13.9-6.8 6.9-12.2 15-16.1 23.9-4.8 11.1-7 23.2-8.3 35.3-1.2 11.1-.4 22.4.6 33.5.8 8.6 3 16.9 6.8 24.6 2.5 5.3 5.4 10.3 8.3 15.4.6 1.1 1.3 2 1.9 3 1.6 2.3 3.6 4.3 6 5.8 2.6 1.6 5.4 3 8.4 4.1-1.3-1.2-2.8-2.2-4.1-3.6z" />
    <path fill="currentColor" d="M37 132c-3.1 7.2-5.4 14.8-6.1 22.5-.2 2.5 0 5 1.1 7.2.5 1 1.4 1.8 2.3 2.4 4 2.8 9.3 2 13.2-1.1 3-2.3 5-5.7 7.2-8.7 3.9-5.4 7.5-11 11-16.7 4.1-6.7 8.2-13.6 11.6-20.7 2.2-4.5 4.1-9 5.8-13.7 1-2.9 2.1-5.9 2.1-9 0-3-1.2-5.7-3.3-7.5-1.5-1.3-3.6-1.7-5.5-2.1-5.4-1.1-11-.6-16.3 1.1-8.3 2.6-15.6 7.6-21.7 13.9-4.3 4.4-8 9.4-10.9 15-.3.6-.3 1.4-.5 2.1l0-.1c2-3.8 4.3-7.6 7-11 4.5-5.9 10-11 16-15 4-2.7 8.4-5 13-6.6 4.6-1.5 9.7-2.1 14.2-.3 1.7.6 3.6 1.6 4.6 3.2 1 1.6 1 3.5.7 5.2-1 6.5-3.6 12.7-6.5 18.6-4.5 9-10.2 17.5-15.8 25.7-4 5.9-8.4 11.5-13.1 16.8-2.6 2.8-5.6 5.5-9 7.4-1.9 1-4.2 1.8-6.3 1.3-1.8-.4-3.3-1.6-4-3.4-.9-2.3-.9-4.8-.5-7.1.9-5.7 3.3-11.2 5.8-16.4.7-1.5 1.5-3.1 2.3-4.6l-1.9.9z" />
    <path fill="currentColor" d="M30 67.5c-1.3 7-2 14.1-1.3 21.2.1 1.7.5 3.4 1.5 4.8 1.1 1.5 2.8 2.3 4.6 2.8 6.4 1.7 13.2.1 18.6-3.8 5-3.5 8.9-8.4 12.3-13.5 6-8.9 11-18.4 14.4-28.7 1.2-3.7 2.4-7.4 3-11.3.4-2.5.5-5 .1-7.5-.4-2.2-1.4-4.2-3.2-5.4-1.5-.9-3.2-1.3-4.9-1.6-6-.9-12.2.3-17.7 2.8-8.2 3.8-15.4 9.6-21.2 16.4-4 4.8-7.5 10.2-9.9 16-.4.9-.7 1.8-1 2.7l.1-.2c1.7-4.4 3.9-8.7 6.6-12.6 4.2-6.3 9.4-12 15.2-16.7 4-3.3 8.3-6 13.1-7.8 4.6-1.7 9.8-2.3 14.5-1.1 2.2.6 4.3 1.6 5.6 3.4.9 1.3 1 2.9 1 4.4-.1 6-1.5 11.9-3.5 17.5-3.7 10.5-8.7 20.3-14.4 29.5-3.9 6.2-8.3 12-13.3 17.2-2.7 2.8-5.8 5.4-9.6 6.9-2 .8-4.2 1.3-6.2.7-1.6-.4-3.1-1.4-3.8-2.9-.8-2-.9-4.3-.8-6.4.4-5 1.5-10 3-14.8.7-2.3 1.5-4.5 2.4-6.7l-1.5.8z" />
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
            className="font-black text-[80px] sm:text-[140px] md:text-[200px] lg:text-[260px] tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f0f0f0] to-[#b0b0b0] drop-shadow-2xl overflow-visible px-4"
            style={{ lineHeight: 1, fontFamily: "'Inter', sans-serif" }}
          >
            <NumberCounter count={count} />
          </div>
          <div className="mt-0 sm:mt-1 opacity-80">
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
