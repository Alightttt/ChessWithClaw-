const fs = require('fs');
let content = fs.readFileSync('src/pages/Game.jsx', 'utf-8');

const targetPill = `<div 
                  style={{
                    background: '#111111',
                    border: \`1.5px solid \${presenceColor}\`,
                    borderRadius: '9999px',
                    padding: '4px 10px',
                    color: '#f2f2f2',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    maxWidth: '90px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    outline: 'none'
                  }}
                >`;

const replacementPill = `<div 
                  style={{
                    background: 'transparent',
                    border: \`2px solid \${presenceColor}\`,
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    color: presenceColor,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    maxWidth: '100px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    outline: 'none'
                  }}
                >`;

content = content.replace(targetPill, replacementPill);
fs.writeFileSync('src/pages/Game.jsx', content);
console.log('Done pill');
