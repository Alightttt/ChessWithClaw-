const fs = require('fs');
let content = fs.readFileSync('src/components/TweetTestimonial.jsx', 'utf-8');

content = content.replace(
  /whileTap={{ scale: 1.05, boxShadow: '0 20px 40px -10px rgba\(0,0,0,0.8\), 0 0 40px rgba\(29, 155, 240, 0.4\)' }}\s*transition={{ duration: 0.2, ease: \[0.16, 1, 0.3, 1\] }}\s*className="w-full bg-\[#000000\] border border-\[#2f3336\] rounded-2xl p-5 md:p-6 text-left cursor-pointer transition-colors duration-200 font-sans relative overflow-hidden group"/s,
  `className="w-full bg-[#000000] border border-[#2f3336] rounded-2xl p-5 md:p-6 text-left cursor-default transition-colors duration-200 font-sans relative overflow-hidden group select-none"`
);

content = content.replace(
  /className="w-full h-full object-cover" \/>/g,
  `className="w-full h-full object-cover pointer-events-none select-none" draggable={false} />`
);

content = content.replace(
  /<span className="text-\[11px\] font-semibold text-\[#1d9bf0\] bg-\[#1d9bf0\]\/10 border border-\[#1d9bf0\]\/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">\s*<span className="w-1.5 h-1.5 rounded-full bg-\[#1d9bf0\] animate-pulse" \/>\s*Featured Post\s*<\/span>/s,
  ``
);

content = content.replace(
  /<span className="text-\[#1d9bf0\] font-medium">@ChessWithClaw<\/span>/g,
  `<span className="text-[#1d9bf0] font-medium">ChessWithClaw</span>`
);

content = content.replace(/♟️🤖/g, "♟️🦞");

fs.writeFileSync('src/components/TweetTestimonial.jsx', content);
