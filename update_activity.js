const fs = require('fs');
let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf8');

const newSvg = `
const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 100 200" className={\`h-[260px] sm:h-[340px] md:h-[440px] lg:h-[500px] w-auto text-[#f2f2f2] opacity-[0.25] \${className || ''}\`} style={{ ...style, transform: left ? 'none' : 'scaleX(-1)' }}>
    <g fill="currentColor">
      <path d="M 50,190 Q 20,100 50,10 C 50,10 40,30 45,50 C 45,50 35,70 40,90 C 40,90 30,110 35,130 C 35,130 25,150 30,170" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 45,155 Q 15,155 10,135 Q 25,130 40,145" />
      <path d="M 40,125 Q 10,125 5,105 Q 20,100 35,115" />
      <path d="M 37,95 Q 5,95 0,75 Q 15,70 32,85" />
      <path d="M 35,65 Q 10,65 5,45 Q 20,40 32,55" />
      <path d="M 42,35 Q 25,25 25,10 Q 40,15 45,30" />
      <path d="M 48,135 Q 75,135 80,115 Q 65,110 52,125" />
      <path d="M 45,105 Q 75,105 80,85 Q 65,80 48,95" />
      <path d="M 42,75 Q 70,75 75,55 Q 60,50 45,65" />
      <path d="M 45,45 Q 65,40 70,20 Q 55,25 45,40" />
      
      <circle cx="32" cy="142" r="3.5" />
      <circle cx="56" cy="115" r="3.5" />
      <circle cx="28" cy="110" r="3.5" />
      <circle cx="52" cy="85" r="3.5" />
      <circle cx="26" cy="80" r="3.5" />
    </g>
  </svg>
);
`;

content = content.replace(/const OliveBranch =[\s\S]*?\}\);\n/m, newSvg);
fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
