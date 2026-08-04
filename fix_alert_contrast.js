const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

content = content.replace(
  /<div style=\{\{\s*width: '20px',\s*height: '20px',\s*background: '#fbbf24',\s*borderRadius: '50%',\s*display: 'flex',\s*alignItems: 'center',\s*justifyContent: 'center',\s*flexShrink: 0\s*\}\}>\s*<span style=\{\{ color: '#1a1a1a', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 \}\}>!<\/span>\s*<\/div>\s*<span style=\{\{ color: '#fbbf24', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1\.2 \}\}>\s*Invite your Agent first\s*<\/span>/s,
  `<div style={{
                    width: '20px',
                    height: '20px',
                    background: '#e63946',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ color: '#ffffff', fontSize: '13px', fontWeight: 'bold', lineHeight: 1 }}>!</span>
                  </div>
                  <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                    Invite your Agent first
                  </span>`
);

fs.writeFileSync('src/pages/Game.jsx', content);
