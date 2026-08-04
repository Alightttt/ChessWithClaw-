const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.jsx', 'utf-8');

const xLogoDef = `const XLogo = ({ style, className = "w-4 h-4 fill-current text-[#a0a0a0] hover:text-white transition-colors" }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" style={style} className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
`;

if (!content.includes('const XLogo =')) {
  content = content.replace('export default function Home', xLogoDef + '\nexport default function Home');
}

content = content.replace(/<Twitter size=\{14\} \/>/g, '<XLogo style={{ width: "14px", height: "14px", fill: "currentColor" }} />');

fs.writeFileSync('src/pages/Home.jsx', content);
console.log('Home.jsx updated successfully');
