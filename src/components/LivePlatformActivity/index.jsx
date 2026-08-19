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
    className={`h-[280px] sm:h-[380px] md:h-[480px] lg:h-[540px] w-auto text-[#f2f2f2] opacity-[0.35] hover:opacity-[0.5] transition-opacity duration-300 pointer-events-none select-none ${className || ''}`} 
    style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}
    aria-hidden="true"
  >
    <defs>
      {/* Botanical lanceolate olive leaf definition */}
      <g id="award-olive-leaf">
        <path 
          d="M 0 0 C -4.5 -7, -7 -17, 0 -27 C 7 -17, 4.5 -7, 0 0 Z" 
          fill="currentColor" 
        />
        <path 
          d="M 0 -1 L 0 -22" 
          stroke="rgba(0,0,0,0.25)" 
          strokeWidth="0.75" 
          strokeLinecap="round"
        />
      </g>
      <g id="award-olive-berry">
        <circle cx="0" cy="0" r="2.2" fill="currentColor" opacity="0.85" />
      </g>
    </defs>

    {/* Gracefully curving central laurel bough stem */}
    <path 
      d="M 72 352 C 18 252, 14 110, 62 16" 
      stroke="currentColor" 
      strokeWidth="2.8" 
      fill="none" 
      strokeLinecap="round" 
      opacity="0.8"
    />

    {/* Node 0: Base */}
    <g transform="translate(60.0, 325.3)">
      <use href="#award-olive-leaf" transform="rotate(-151.5) scale(0.78)" />
      <use href="#award-olive-leaf" transform="rotate(-81.5) scale(0.72)" />
      <use href="#award-olive-berry" transform="translate(2, -1)" />
    </g>

    {/* Node 1 */}
    <g transform="translate(47.7, 292.6)">
      <use href="#award-olive-leaf" transform="rotate(-147.8) scale(0.88)" />
      <use href="#award-olive-leaf" transform="rotate(-73.8) scale(0.80)" />
      <use href="#award-olive-berry" transform="translate(-2, 1)" />
    </g>

    {/* Node 2 */}
    <g transform="translate(38.4, 258.5)">
      <use href="#award-olive-leaf" transform="rotate(-144.6) scale(0.96)" />
      <use href="#award-olive-leaf" transform="rotate(-67.6) scale(0.88)" />
      <use href="#award-olive-berry" transform="translate(1.5, -2)" />
    </g>

    {/* Node 3 */}
    <g transform="translate(32.2, 223.4)">
      <use href="#award-olive-leaf" transform="rotate(-139.6) scale(1.02)" />
      <use href="#award-olive-leaf" transform="rotate(-61.6) scale(0.94)" />
      <use href="#award-olive-berry" transform="translate(-2, -1)" />
    </g>

    {/* Node 4: Mid-crest peak width */}
    <g transform="translate(29.0, 187.9)">
      <use href="#award-olive-leaf" transform="rotate(-135.7) scale(1.02)" />
      <use href="#award-olive-leaf" transform="rotate(-56.7) scale(0.94)" />
      <use href="#award-olive-berry" transform="translate(2, 0)" />
    </g>

    {/* Node 5 */}
    <g transform="translate(28.9, 152.4)">
      <use href="#award-olive-leaf" transform="rotate(-129.7) scale(0.98)" />
      <use href="#award-olive-leaf" transform="rotate(-52.7) scale(0.90)" />
      <use href="#award-olive-berry" transform="translate(-1.5, 1.5)" />
    </g>

    {/* Node 6 */}
    <g transform="translate(31.8, 117.6)">
      <use href="#award-olive-leaf" transform="rotate(-122.6) scale(0.92)" />
      <use href="#award-olive-leaf" transform="rotate(-48.6) scale(0.84)" />
      <use href="#award-olive-berry" transform="translate(2, -1)" />
    </g>

    {/* Node 7 */}
    <g transform="translate(37.8, 83.8)">
      <use href="#award-olive-leaf" transform="rotate(-115.1) scale(0.85)" />
      <use href="#award-olive-leaf" transform="rotate(-45.1) scale(0.76)" />
      <use href="#award-olive-berry" transform="translate(-1, -2)" />
    </g>

    {/* Node 8 */}
    <g transform="translate(47.0, 51.7)">
      <use href="#award-olive-leaf" transform="rotate(-107.1) scale(0.76)" />
      <use href="#award-olive-leaf" transform="rotate(-41.1) scale(0.68)" />
      <use href="#award-olive-berry" transform="translate(1.5, 0)" />
    </g>

    {/* Node 9: Upper taper */}
    <g transform="translate(56.5, 27.5)">
      <use href="#award-olive-leaf" transform="rotate(-99.8) scale(0.68)" />
      <use href="#award-olive-leaf" transform="rotate(-37.8) scale(0.60)" />
    </g>

    {/* Apex Crown Leaf at tip of branch */}
    <g transform="translate(62, 16)">
      <use href="#award-olive-leaf" transform="rotate(-66) scale(0.75)" />
    </g>
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
