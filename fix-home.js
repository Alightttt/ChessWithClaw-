const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');

// 1. Add LinkIcon to imports
code = code.replace(
  'import { Loader2, ChevronDown, Zap, Shield, Terminal, Copy, Check, Globe, Bot, Activity } from "lucide-react";',
  'import { Loader2, ChevronDown, Zap, Shield, Terminal, Copy, Check, Globe, Bot, Activity, Link as LinkIcon } from "lucide-react";'
);

// 2. Change real-time dot animation
code = code.replace(
  '<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e63946] opacity-60"></span>\n              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>',
  '<span className="animate-subtle-pulse relative inline-flex rounded-full h-2 w-2 bg-[#e63946]"></span>'
);

// 3. Change "No signup. No account. Just you and your agent." -> "No signup. No subscription." and make it bold
code = code.replace(
  /No signup\. No account\. Just you and your agent\./g,
  '<b>No signup. No subscription.</b>'
);

// 4. Quick Start section: change 3 cards to 2 cards, update icons and text.
const chessPiecesIconDef = `
const ChessPiecesIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    {/* Pawn */}
    <path d="M4 20h7" />
    <path d="M5.5 20v-3c0-1.5-1-2-1-3s1-2 1-3c0-1.5-1-2-2-2h4c-1 0-2 .5-2 2 0 1 1 2 1 3s-1 1.5-1 3v3" />
    <circle cx="7.5" cy="7" r="1.5" />
    {/* Rook */}
    <path d="M14 20h7" />
    <path d="M15 20v-4c0-2 1-3 1-5V8h-1V5h2v2h1.5V5h2v2h1.5V5h2v3h-1v3c0 2 1 3 1 5v4" />
  </svg>
);
`;

if (!code.includes('ChessPiecesIcon = ')) {
  code = code.replace('const LobsterEmoji = () =>', chessPiecesIconDef + '\nconst LobsterEmoji = () =>');
}

// Change grid-cols-3 to grid-cols-2
code = code.replace('<div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">', '<div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">');

// Update Terminal -> LinkIcon
code = code.replace('<Terminal size={20} className="text-[#e63946]" />', '<LinkIcon size={20} className="text-[#e63946]" />');

// Remove Card 2
const card2Start = '{/* Card 2: Create Game */}';
const card2End = '          {/* Card 3: Invite */}';
const card2Content = code.substring(code.indexOf(card2Start), code.indexOf(card2End));
code = code.replace(card2Content, '');

// Update Card 3 (now Card 2)
code = code.replace('Step 03', 'Step 02');
code = code.replace('<Bot size={20} className="text-[#e63946]" />', '<ChessPiecesIcon size={20} className="text-[#e63946]" />');
code = code.replace('Paste the invite prompt into your agent&apos;s chat, and the game begins immediately.', 'Create match, send the invite message to your agent, that\'s it.');

fs.writeFileSync('src/pages/Home.jsx', code);
