const fs = require('fs');
let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf-8');

// Replace NumberCounter return with the new structure
content = content.replace(
  /<div ref={ref} className="relative inline-block">.*?<\/div>/s,
  `<div ref={ref} className="relative inline-block w-full text-center overflow-visible">
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
    </div>`
);

// Add OliveBranch component
const oliveBranch = `
const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 100 200" className={\`w-8 sm:w-12 h-auto text-white opacity-20 \${className}\`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M12.8,198.5c-0.2-1.9-0.2-3.8-0.1-5.7c0.8-13.8,4.1-27.2,8.6-40.4c1.2-3.7,2.6-7.3,4.1-10.9c0.7-1.5,1.2-3,1.9-4.5c0.3-0.7,0.6-1.4,1-2.1l0.6-1.1c2-3.9,4.2-7.8,6.5-11.5c4-6.4,8.5-12.5,13.6-18.1c3.2-3.5,6.6-6.9,10.2-10.1c3.2-2.8,6.6-5.5,10.1-8c4.3-3.1,8.9-5.9,13.7-8.3c10-5,21.1-8.5,32.2-10.3c1.6-0.3,3.3-0.5,4.9-0.7c0.1,0,0.2-0.1,0.2-0.2c-0.3-0.8-0.7-1.6-1.1-2.4c-1-2-2.1-3.9-3.3-5.8c-2.4-3.7-5.1-7.2-8-10.6c-4.4-5.2-9.4-9.9-14.8-14c-1.3-1-2.7-1.9-4.1-2.8c-0.9-0.6-1.8-1.2-2.8-1.8c-1.1-0.7-2.3-1.3-3.5-1.9c-7.9-4.2-16.5-7-25.5-8.3c-2.6-0.4-5.2-0.6-7.9-0.7C46.8,13.4,45,13.5,43.2,13.8C42,14,40.8,14.3,39.6,14.6c-0.3-0.4-0.6-0.8-0.9-1.2C38,12.2,37,11,36,9.8C35.1,8.7,34,7.6,33,6.6c-2.2-2.1-4.7-3.9-7.3-5.5c-0.4-0.2-0.8-0.5-1.1-0.7C24.4,0.3,24.3,0.3,24.1,0.3c-0.1,0-0.1,0.1-0.1,0.2c0.2,1,0.4,2.1,0.5,3.1C24.8,4.7,25,5.8,25.3,6.8c0.6,1.9,1.3,3.8,2,5.7c1.4,3.5,3,6.9,5,10.2C33.7,25,35.2,27,37,28.8c0.8,0.9,1.7,1.7,2.6,2.5c-2,0-4,0.3-6.1,0.7c-4.6,0.9-9.1,2.5-13.3,4.9C15.8,39.3,12.3,42.4,9.4,46c-1,1.3-1.9,2.6-2.8,4c-1.9,2.8-3.4,5.9-4.6,9.1c-1.6,4.3-2.6,8.7-3.2,13.3C-1.8,77.7-2,83,-1.7,88.2c0.2,2.8,0.7,5.5,1.2,8.3c1,5,2.4,9.9,4.2,14.7c0.2,0.6,0.5,1.1,0.7,1.7c0.3,0.7,0.7,1.4,1,2c3.2,6.5,7,12.7,11.5,18.4c0.6,0.8,1.2,1.6,1.9,2.4c1.1,1.3,2.2,2.5,3.4,3.7c3.3,3.3,6.9,6.3,10.7,9c1.9,1.4,3.9,2.7,6,3.9c1,0.6,2.1,1.2,3.1,1.7c2.1,1,4.2,2,6.4,2.8c0.4,0.1,0.7,0.3,1.1,0.4c0,0.1,0,0.1,0,0.2c-0.3,0.8-0.6,1.6-1,2.4c-1.8,4.6-3.7,9.1-5.7,13.6c-1.6,3.5-3.3,7-5.1,10.5c-0.9,1.7-1.8,3.5-2.7,5.2c-1,2-2,3.9-3.1,5.9c-2.3,4.2-4.8,8.2-7.5,12c-2.9,4.2-6.1,8.2-9.6,12c-0.5,0.6-1,1.1-1.5,1.7c-0.5,0.5-0.9,1.1-1.4,1.6L12.8,198.5z" />
  </svg>
);
`;

content = content.replace('export default function LivePlatformActivity', oliveBranch + '\nexport default function LivePlatformActivity');

// Replace section content
const newSection = `<section ref={elementRef} className="w-full max-w-[1200px] mx-auto mb-20 md:mb-32 px-4 sm:px-6 font-sans relative overflow-visible py-16 sm:py-24 flex flex-col items-center justify-center text-center">
      {/* Ambient red blurred glow behind the number */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e63946]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative z-10 flex items-center justify-center gap-4 sm:gap-10 w-full overflow-visible">
        <OliveBranch left />
        <div className="flex flex-col items-center min-w-0 max-w-full overflow-visible">
          <div
            className="font-black text-6xl sm:text-[100px] md:text-[180px] lg:text-[220px] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-[#f0f0f0] to-[#b0b0b0] drop-shadow-2xl overflow-visible px-4"
            style={{ lineHeight: 1, fontFamily: "'Inter', sans-serif" }}
          >
            <NumberCounter count={count} />
          </div>
          <div className="mt-4 sm:mt-8 px-4 py-2 rounded-full border border-[#e63946]/10 text-[#e63946] opacity-80 shadow-sm backdrop-blur-sm">
            <span className="text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-[#ff5766]">
              Global Matches Played
            </span>
          </div>
        </div>
        <OliveBranch />
      </div>
    </section>`;

content = content.replace(/<section ref=\{elementRef\}.*?<\/section>/s, newSection);

fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
