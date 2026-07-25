const fs = require('fs');
let code = fs.readFileSync('src/components/GameCreated.jsx', 'utf8');

// Insert image before <h1>
const imageCode = `          <img 
            src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/invite-image.png" 
            alt="Invite Agent" 
            draggable={false}
            style={{ 
              width: '100%', 
              maxWidth: '280px', 
              height: 'auto', 
              marginBottom: '24px', 
              objectFit: 'contain'
            }} 
          />
          <h1`;

code = code.replace('          <h1', imageCode);

// Update button
code = code.replace(`            className={legalAccepted ? "design-btn-primary" : "design-btn-disabled"}
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '56px',
              fontSize: '16px',
              cursor: boardOpening ? 'not-allowed' : 'pointer'
            }}`, `            className="design-btn-primary"
            style={{
              width: '100%',
              maxWidth: '360px',
              height: '56px',
              fontSize: '16px',
              cursor: boardOpening ? 'not-allowed' : 'pointer',
              opacity: legalAccepted ? 1 : 0.6,
              filter: legalAccepted ? 'none' : 'brightness(0.7)',
              transition: 'all 0.2s ease'
            }}`);

fs.writeFileSync('src/components/GameCreated.jsx', code);
