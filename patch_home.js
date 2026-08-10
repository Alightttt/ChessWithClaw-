const fs = require('fs');

let content = fs.readFileSync('src/pages/Home.jsx', 'utf8');

content = content.replace(
  '<div className="max-w-5xl mx-auto flex flex-col items-center gap-8">',
  '<div className="max-w-5xl mx-auto flex flex-col items-center gap-5">'
);

content = content.replace(
  '<div className="flex flex-row items-center justify-center gap-12 sm:gap-16 w-full">',
  '<div className="flex flex-row items-center justify-center gap-8 sm:gap-10 w-full">'
);

content = content.replace(
  '<XLogo style={{ width: "24px", height: "24px", fill: "currentColor" }} />',
  '<XLogo style={{ width: "26px", height: "26px", fill: "currentColor" }} />'
);

content = content.replace(
  /text-\[15px\] sm:text-\[16px\]/g,
  'text-[16px] sm:text-[17px]'
);

content = content.replace(
  'fontSize: "24px",',
  'fontSize: "27px",'
);

content = content.replace(
  '<div className="font-[\'Inter\'] text-[14px] text-[rgba(242,242,242,0.3)] tracking-wide">',
  '<div className="font-[\'Inter\'] text-[15px] text-[rgba(242,242,242,0.35)] tracking-wide">'
);

fs.writeFileSync('src/pages/Home.jsx', content);
