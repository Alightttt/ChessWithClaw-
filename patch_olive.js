const fs = require('fs');

let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf8');

const oldComponent = `const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 100 200" className={\`h-[300px] sm:h-[390px] md:h-[505px] lg:h-[575px] w-auto text-[#f2f2f2] opacity-[0.25] \${className || ''}\`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
    <path fill="currentColor" d="M 45 190 Q 75 120 90 20 Q 80 120 50 190 Z M 53.3 169.4 Q 72.0 176.4 40.5 142.3 Q 62.6 172.9 53.3 169.4 Z M 53.3 169.4 Q 34.5 162.4 80.8 157.4 Q 43.9 165.9 53.3 169.4 Z M 60.9 147.6 Q 79.9 153.8 47.0 121.0 Q 70.4 150.7 60.9 147.6 Z M 60.9 147.6 Q 41.9 141.3 87.9 134.4 Q 51.4 144.4 60.9 147.6 Z M 68.0 124.5 Q 87.2 130.0 53.0 98.5 Q 77.6 127.2 68.0 124.5 Z M 68.0 124.5 Q 48.7 119.0 94.4 110.3 Q 58.3 121.8 68.0 124.5 Z M 74.4 100.2 Q 93.8 105.0 58.5 74.8 Q 84.1 102.6 74.4 100.2 Z M 74.4 100.2 Q 55.0 95.4 100.3 85.0 Q 64.7 97.8 74.4 100.2 Z M 80.2 74.7 Q 99.8 78.8 63.5 49.8 Q 90.0 76.8 80.2 74.7 Z M 80.2 74.7 Q 60.6 70.6 105.6 58.7 Q 70.4 72.6 80.2 74.7 Z M 85.4 48.0 Q 105.1 51.5 67.9 23.6 Q 95.3 49.7 85.4 48.0 Z M 85.4 48.0 Q 65.7 44.4 110.3 31.2 Q 75.6 46.2 85.4 48.0 Z" />
  </svg>
);`;

const newComponent = `const OliveBranch = ({ className, style, left }) => (
  <svg viewBox="0 0 100 310" className={\`h-[300px] sm:h-[390px] md:h-[505px] lg:h-[575px] w-auto text-[#f2f2f2] opacity-[0.25] \${className || ''}\`} style={{ ...style, transform: left ? 'scaleX(-1)' : 'none' }}>
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
);`;

if (!content.includes(oldComponent)) {
  console.log("Could not find the old component exactly. Attempting a regex replace...");
  content = content.replace(/const OliveBranch[\s\S]*?<\/svg>\n\);/, newComponent);
} else {
  content = content.replace(oldComponent, newComponent);
}

fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
