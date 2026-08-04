const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.jsx', 'utf-8');

content = content.replace(
  /const AgentIntegrationIcons = \(\) => \(\s*<div style=\{\{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' \}\}>\s*<div style=\{\{ position: 'relative', width: '28px', height: '28px' \}\}>\s*<img src="https:\/\/jkawzziklwoxfxicbtvf\.supabase\.co\/storage\/v1\/object\/public\/assets\/openclaw\.png" style=\{\{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' \}\} alt="OpenClaw" \/>\s*<\/div>\s*<div style=\{\{ position: 'relative', width: '28px', height: '28px' \}\}>\s*<img src="https:\/\/jkawzziklwoxfxicbtvf\.supabase\.co\/storage\/v1\/object\/public\/assets\/hermes\.png" style=\{\{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' \}\} alt="Hermes" \/>\s*<\/div>\s*<span style=\{\{ color: 'rgba\(242,242,242,0\.4\)', fontSize: '14px', fontWeight: 'bold', display: 'none' \}\}>\+<\/span>\s*<\/div>\s*\);/,
  `const AgentIntegrationIcons = () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', marginBottom: '14px' }}>
      <div style={{ position: 'relative', width: '36px', height: '36px' }}>
        <img src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/openclaw.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="OpenClaw" />
      </div>
      <div style={{ position: 'relative', width: '36px', height: '36px' }}>
        <img src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/hermes.png" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} alt="Hermes" />
      </div>
      <span style={{ color: 'rgba(242,242,242,0.4)', fontSize: '20px', fontWeight: '400', lineHeight: 1, paddingBottom: '6px' }}>+</span>
    </div>
  );`
);

fs.writeFileSync('src/pages/Home.jsx', content);
