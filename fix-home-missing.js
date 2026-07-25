const fs = require('fs');
let code = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const missingCode = `
const LobsterEmoji = () => <span style={{fontFamily: '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif', fontStyle:'normal'}}>🦞</span>;

export default function Home() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);

  const handlePlayNow = async () => {
    if (creating) return;
    setCreating(true);
    try {
      const res = await fetch('/api/create-game', { method: 'POST' });`;

code = code.replace(
  ');\n      if (!res.ok) throw new Error(\'Failed to create game\');',
  ');\n' + missingCode + '\n      if (!res.ok) throw new Error(\'Failed to create game\');'
);

fs.writeFileSync('src/pages/Home.jsx', code);
