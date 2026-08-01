const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const regex = /<div style=\{\{ display: 'grid'[^>]*>[\s\n]*<div[^>]*>#<\/div>[\s\n]*<div[^>]*>You<\/div>[\s\n]*<div[^>]*>\{agentName\}<\/div>[\s\n]*<\/div>[\s\n]*<\/div><\/div>            <\/div>          <\/div>/m;

code = code.replace(regex, `<div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', paddingBottom: '6px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '4px' }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>#</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>You</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>{agentName}</div>
                    </div>
                    {moveHistoryPairs.map((pair, index) => (
                      <div key={index} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr', gap: '8px', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: '13px', color: 'rgba(242,242,242,0.3)', fontWeight: 600, display: 'flex', alignItems: 'center' }}>{index + 1}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#f2f2f2', display: 'flex', alignItems: 'center' }}>{pair.w}</div>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', color: '#f2f2f2', display: 'flex', alignItems: 'center' }}>{pair.b}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
`);

fs.writeFileSync('src/pages/Game.jsx', code);
