const fs = require('fs');
let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf-8');

// Remove the red blur
content = content.replace(
  /<div className="absolute top-1\/2 left-1\/2 -translate-x-1\/2 -translate-y-1\/2 w-\[600px\] h-\[600px\] bg-\[#e63946\]\/10 rounded-full blur-\[140px\] pointer-events-none" \/>/,
  ''
);

// Update Laurel/Olive wreath SVG to a more classic achievement style
const laurelWreath = `const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 24 48" className={\`w-8 sm:w-12 h-auto text-white opacity-40 \${className}\`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M11 44C6 38 2 28 2 18C2 10 5 4 8 0C7 4 7 8 8 12C5 10 3 9 1 9C3 13 6 15 9 16C6 16 4 15 2 15C4 19 7 21 10 22C7 22 5 21 3 21C5 25 8 27 11 28C8 28 6 27 4 27C6 31 9 33 12 34C11 36 10 38 11 44Z" />
  </svg>
);`;
content = content.replace(/const OliveBranch = \(\{.*?\}\);/s, laurelWreath);

// Update text style
content = content.replace(
  /<div className="mt-4 sm:mt-8 px-4 py-2 rounded-full border border-\[#e63946\]\/10 text-\[#e63946\] opacity-80 shadow-sm backdrop-blur-sm">\s*<span className="text-sm sm:text-base font-bold tracking-\[0\.2em\] uppercase text-\[#ff5766\]">\s*Global Matches Played\s*<\/span>\s*<\/div>/,
  `<div className="mt-2 sm:mt-4 opacity-80">
            <span className="text-xs sm:text-sm font-semibold tracking-[0.1em] uppercase text-white whitespace-nowrap">
              Global Matches Played
            </span>
          </div>`
);

fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
