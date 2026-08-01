const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// The closing tags are currently:
/*
            <div style={{ textAlign: 'center', padding: '20px 0 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>
              <span>v0.1.3</span>
              <span>© ChessWithClaw</span>
              <span>@0xalyt</span>
            </div>
          </div>
        </div>
      )}
*/
const toReplace = `            <div style={{ textAlign: 'center', padding: '20px 0 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>
              <span>v0.1.3</span>
              <span>© ChessWithClaw</span>
              <span>@0xalyt</span>
            </div>
          </div>
        </div>
      )}`;

const replacement = `            <div style={{ textAlign: 'center', padding: '20px 0 12px', display: 'flex', justifyContent: 'space-between', fontFamily: "'Inter', sans-serif", fontSize: '11px', color: 'rgba(242,242,242,0.35)' }}>
              <span>v0.1.3</span>
              <span>© ChessWithClaw</span>
              <span>@0xalyt</span>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>`;

code = code.replace(toReplace, replacement);

fs.writeFileSync('src/pages/Game.jsx', code);
