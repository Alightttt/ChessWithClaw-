const fs = require('fs');
let content = fs.readFileSync('src/components/LivePlatformActivity/index.jsx', 'utf-8');

// Space top/bottom
content = content.replace(
  /className="w-full max-w-\[1200px\] mx-auto mb-20 md:mb-32 px-4 sm:px-6 font-sans relative overflow-visible py-16 sm:py-24 flex flex-col items-center justify-center text-center"/,
  'className="w-full max-w-[1200px] mx-auto mb-8 md:mb-12 px-4 sm:px-6 font-sans relative overflow-visible py-8 sm:py-12 flex flex-col items-center justify-center text-center"'
);

// Spacing in between numbers
content = content.replace(
  /tracking-tighter/,
  'tracking-tight'
);

// Bigger Olive branch
content = content.replace(
  /h-\[200px\] sm:h-\[260px\] md:h-\[340px\]/,
  'h-[260px] sm:h-[340px] md:h-[440px] lg:h-[500px]'
);

fs.writeFileSync('src/components/LivePlatformActivity/index.jsx', content);
