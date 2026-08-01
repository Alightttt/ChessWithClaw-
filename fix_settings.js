const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// Replace the {showSettings && (...)} block with AnimatePresence and motion.div

const oldSettingsBlock = `{showSettings && (
        <div style={{ position: 'fixed', inset: 0, background: '#1c1a19', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto', animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>`;

const newSettingsBlock = `<AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, background: '#1c1a19', zIndex: 200, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}
          >`;

code = code.replace(oldSettingsBlock, newSettingsBlock);

// Replace the closing div of showSettings
const oldSettingsEnd = `            <div style={{ paddingBottom: '40px' }} />
          </div>
        </div>
      )}`;

const newSettingsEnd = `            <div style={{ paddingBottom: '40px' }} />
          </div>
        </motion.div>
      )}
      </AnimatePresence>`;

code = code.replace(oldSettingsEnd, newSettingsEnd);

fs.writeFileSync('src/pages/Game.jsx', code);
