const fs = require('fs');
let code = fs.readFileSync('src/components/GameCreated.jsx', 'utf8');

// 1. Add hasCopied state
code = code.replace('const [copied, setCopied] = useState(false);', 'const [copied, setCopied] = useState(false);\n  const [hasCopied, setHasCopied] = useState(false);\n  const [bounceCopy, setBounceCopy] = useState(false);\n  const [legalError, setLegalError] = useState(false);');

// 2. setHasCopied in handleCopyInvite
code = code.replace('const handleCopyInvite = () => {', 'const handleCopyInvite = () => {\n    setHasCopied(true);');

// 3. Update handleOpenBoard
const oldOpenBoard = `  const handleOpenBoard = () => {
    if (!legalAccepted) return;
    setBoardOpening(true);
    setTimeout(() => {
      navigate(\`/game/\${gameId}\`);
    }, 500);
  };`;

const newOpenBoard = `  const handleOpenBoard = () => {
    let canEnter = true;
    if (!legalAccepted) {
      setLegalError(true);
      setTimeout(() => setLegalError(false), 2000);
      canEnter = false;
    }
    if (!hasCopied) {
      setBounceCopy(true);
      setTimeout(() => setBounceCopy(false), 500);
      canEnter = false;
    }
    if (!canEnter) return;

    setBoardOpening(true);
    setTimeout(() => {
      navigate(\`/game/\${gameId}\`);
    }, 500);
  };`;

code = code.replace(oldOpenBoard, newOpenBoard);

// 4. Navigate to legal page with state
code = code.replace("navigate('/legal')", "navigate('/legal', { state: { from: location.pathname } })");

// 5. Update UI for the legal text error
// Replace style={{color: '#1d9bf0', cursor: 'pointer', ...}}
// But wait, the red color should be applied to the text "By playing, you agree to our"
// Let's find that span.
code = code.replace(
  "<span style={{color: 'rgba(242,242,242,0.4)'}}>By playing, you agree to our </span>",
  "<span style={{color: legalError ? '#e63946' : 'rgba(242,242,242,0.4)', transition: 'color 0.2s'}}>By playing, you agree to our </span>"
);
code = code.replace(
  "<input type=\"checkbox\"",
  "<input type=\"checkbox\" className={legalError ? 'ring-2 ring-[#e63946]' : ''}"
);

// 6. Make copy button bounce
// We'll add animation dynamically.
code = code.replace(
  "className=\"design-btn-secondary\"",
  "className={`design-btn-secondary ${bounceCopy ? 'bounce-anim' : ''}`}"
);

// Add bounce-anim keyframes in style tag
const bounceKeyframes = `
        @keyframes bounce-anim {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); box-shadow: 0 0 15px rgba(230,57,70,0.5); }
        }
        .bounce-anim {
          animation: bounce-anim 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
`;
code = code.replace('</style>', bounceKeyframes + '</style>');

fs.writeFileSync('src/components/GameCreated.jsx', code);
