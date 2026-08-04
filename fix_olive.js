const fs = require('fs');
let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf-8');

const oliveRegex = /const OliveBranch = \(\{\s*className,\s*style,\s*left\s*\}\) => \([\s\S]*?<\/svg>\s*\);/;
const laurelWreath = `const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 24 48" className={\`w-12 sm:w-16 h-auto text-[#f2f2f2] opacity-40 \${className || ''}\`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M11 44C6 38 2 28 2 18C2 10 5 4 8 0C7 4 7 8 8 12C5 10 3 9 1 9C3 13 6 15 9 16C6 16 4 15 2 15C4 19 7 21 10 22C7 22 5 21 3 21C5 25 8 27 11 28C8 28 6 27 4 27C6 31 9 33 12 34C11 36 10 38 11 44Z" />
  </svg>
);`;

if(oliveRegex.test(content)) {
  content = content.replace(oliveRegex, laurelWreath);
  fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
  console.log('Replaced olive branch');
} else {
  console.log('Regex did not match');
}
