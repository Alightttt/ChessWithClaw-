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
    viewBox="0 0 130 390"
    className={`h-[260px] sm:h-[360px] md:h-[460px] lg:h-[520px] w-auto text-[#FACC15] drop-shadow-[0_2px_20px_rgba(250,204,21,0.35)] pointer-events-none select-none ${className || ''}`}
    style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}
    aria-hidden="true"
  >
    <defs>
      <g id="laurel-leaf">
        <path d="M 0 0 C -7.2 -6.5, -8.8 -14.2, 0 -22.5 C 8.8 -14.2, 7.2 -6.5, 0 0 Z" fill="currentColor" />
        <path d="M 0 -1 L 0 -19.5" stroke="rgba(0,0,0,0.14)" strokeWidth="0.7" strokeLinecap="round" />
      </g>
    </defs>
    <path d="M 76 368 C 2 282, -2 138, 66 8" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.98" />
    <g transform="translate(66.2,342)"><use href="#laurel-leaf" transform="rotate(-152) scale(1.10)" /><use href="#laurel-leaf" transform="rotate(-82) scale(1.02)" /></g>
    <g transform="translate(49.8,318)"><use href="#laurel-leaf" transform="rotate(-150) scale(1.22)" /><use href="#laurel-leaf" transform="rotate(-76) scale(1.14)" /></g>
    <g transform="translate(37.4,294)"><use href="#laurel-leaf" transform="rotate(-148) scale(1.32)" /><use href="#laurel-leaf" transform="rotate(-72) scale(1.24)" /></g>
    <g transform="translate(27.6,269)"><use href="#laurel-leaf" transform="rotate(-145) scale(1.38)" /><use href="#laurel-leaf" transform="rotate(-68) scale(1.30)" /></g>
    <g transform="translate(20.4,244)"><use href="#laurel-leaf" transform="rotate(-142) scale(1.42)" /><use href="#laurel-leaf" transform="rotate(-64) scale(1.34)" /></g>
    <g transform="translate(15.8,218)"><use href="#laurel-leaf" transform="rotate(-139) scale(1.42)" /><use href="#laurel-leaf" transform="rotate(-60) scale(1.34)" /></g>
    <g transform="translate(13.4,192)"><use href="#laurel-leaf" transform="rotate(-136) scale(1.40)" /><use href="#laurel-leaf" transform="rotate(-56) scale(1.32)" /></g>
    <g transform="translate(12.8,166)"><use href="#laurel-leaf" transform="rotate(-132) scale(1.36)" /><use href="#laurel-leaf" transform="rotate(-52) scale(1.28)" /></g>
    <g transform="translate(14.2,140)"><use href="#laurel-leaf" transform="rotate(-128) scale(1.32)" /><use href="#laurel-leaf" transform="rotate(-48) scale(1.24)" /></g>
    <g transform="translate(17.8,114)"><use href="#laurel-leaf" transform="rotate(-123) scale(1.26)" /><use href="#laurel-leaf" transform="rotate(-44) scale(1.18)" /></g>
    <g transform="translate(24.2,88)"><use href="#laurel-leaf" transform="rotate(-118) scale(1.18)" /><use href="#laurel-leaf" transform="rotate(-40) scale(1.10)" /></g>
    <g transform="translate(33.0,62)"><use href="#laurel-leaf" transform="rotate(-112) scale(1.08)" /><use href="#laurel-leaf" transform="rotate(-36) scale(1.00)" /></g>
    <g transform="translate(44.2,38)"><use href="#laurel-leaf" transform="rotate(-106) scale(0.98)" /><use href="#laurel-leaf" transform="rotate(-32) scale(0.90)" /></g>
    <g transform="translate(58.2,14)"><use href="#laurel-leaf" transform="rotate(-70) scale(0.88)" /></g>
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
