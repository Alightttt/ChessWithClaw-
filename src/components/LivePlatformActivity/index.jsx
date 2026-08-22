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
  <svg
    viewBox="0 0 110 370"
    className={`h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] w-auto text-[#E8C547] drop-shadow-[0_2px_18px_rgba(232,197,71,0.22)] pointer-events-none select-none ${className || ''}`}
    style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}
    aria-hidden="true"
  >
    <defs>
      <g id="laurel-leaf">
        <path d="M 0 0 C -3.6 -5.2, -5.2 -11, 0 -17.5 C 5.2 -11, 3.6 -5.2, 0 0 Z" fill="currentColor" />
        <path d="M 0 -1.2 L 0 -15.5" stroke="rgba(0,0,0,0.16)" strokeWidth="0.55" strokeLinecap="round" />
      </g>
    </defs>
    <path d="M 68 350 C 20 268, 15 140, 60 18" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" opacity="0.92" />
    <g transform="translate(60.5,322)"><use href="#laurel-leaf" transform="rotate(-148) scale(0.88)" /><use href="#laurel-leaf" transform="rotate(-78) scale(0.82)" /></g>
    <g transform="translate(50.2,296)"><use href="#laurel-leaf" transform="rotate(-146) scale(0.94)" /><use href="#laurel-leaf" transform="rotate(-72) scale(0.88)" /></g>
    <g transform="translate(42.1,270)"><use href="#laurel-leaf" transform="rotate(-144) scale(1.00)" /><use href="#laurel-leaf" transform="rotate(-68) scale(0.94)" /></g>
    <g transform="translate(36.0,244)"><use href="#laurel-leaf" transform="rotate(-141) scale(1.04)" /><use href="#laurel-leaf" transform="rotate(-64) scale(0.97)" /></g>
    <g transform="translate(31.5,218)"><use href="#laurel-leaf" transform="rotate(-138) scale(1.06)" /><use href="#laurel-leaf" transform="rotate(-60) scale(1.00)" /></g>
    <g transform="translate(29.0,192)"><use href="#laurel-leaf" transform="rotate(-136) scale(1.06)" /><use href="#laurel-leaf" transform="rotate(-56) scale(1.00)" /></g>
    <g transform="translate(28.2,166)"><use href="#laurel-leaf" transform="rotate(-132) scale(1.04)" /><use href="#laurel-leaf" transform="rotate(-53) scale(0.98)" /></g>
    <g transform="translate(28.8,140)"><use href="#laurel-leaf" transform="rotate(-128) scale(1.00)" /><use href="#laurel-leaf" transform="rotate(-50) scale(0.94)" /></g>
    <g transform="translate(31.0,114)"><use href="#laurel-leaf" transform="rotate(-124) scale(0.96)" /><use href="#laurel-leaf" transform="rotate(-46) scale(0.90)" /></g>
    <g transform="translate(35.4,88)"><use href="#laurel-leaf" transform="rotate(-119) scale(0.92)" /><use href="#laurel-leaf" transform="rotate(-42) scale(0.86)" /></g>
    <g transform="translate(42.2,62)"><use href="#laurel-leaf" transform="rotate(-112) scale(0.86)" /><use href="#laurel-leaf" transform="rotate(-38) scale(0.80)" /></g>
    <g transform="translate(50.8,38)"><use href="#laurel-leaf" transform="rotate(-105) scale(0.78)" /><use href="#laurel-leaf" transform="rotate(-34) scale(0.72)" /></g>
    <g transform="translate(60,16)"><use href="#laurel-leaf" transform="rotate(-68) scale(0.74)" /></g>
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
