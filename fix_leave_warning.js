const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const modalCode = `      <AnimatePresence>
        {showLeaveWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{ background: '#1c1a19', border: '1px solid #2a2a2a', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '90%', textAlign: 'center', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(230,57,70,0.1)', color: '#e63946', padding: '12px', borderRadius: '50%' }}>
                  <AlertTriangle size={32} />
                </div>
              </div>
              <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: '20px', fontWeight: 800, color: '#f2f2f2', marginBottom: '8px' }}>Really want to exit game room?</h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(242,242,242,0.6)', marginBottom: '24px' }}>
                You might not be able to return to this game if you haven't saved the link.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button onClick={() => setShowLeaveWarning(false)} style={{ flex: 1, background: '#2a2a2a', border: 'none', padding: '12px', borderRadius: '8px', color: '#f2f2f2', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}>
                  Cancel
                </button>
                <button onClick={() => navigate('/')} style={{ flex: 1, background: '#e63946', border: 'none', padding: '12px', borderRadius: '8px', color: '#fff', fontWeight: 600, fontFamily: "'Inter', sans-serif", cursor: 'pointer', transition: 'background 0.2s' }}>
                  Leave
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSettings && (`;

code = code.replace(/<AnimatePresence>[\s\n]*\{showSettings && \(/, modalCode);
fs.writeFileSync('src/pages/Game.jsx', code);
