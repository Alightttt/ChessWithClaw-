const fs = require('fs');
let content = fs.readFileSync('src/pages/Home.jsx', 'utf-8');

// AgentIntegrationIcons
content = content.replace(
  /<img src="https:\/\/api.dicebear.com\/9.x\/bottts\/svg\?seed=lobster&backgroundColor=e63946"/,
  '<img src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/openclaw.png"'
);
content = content.replace(
  /<img src="https:\/\/avatars.githubusercontent.com\/u\/129657448\?s=200&v=4"/,
  '<img src="https://jkawzziklwoxfxicbtvf.supabase.co/storage/v1/object/public/assets/hermes.png"'
);
content = content.replace(
  /<span style={{ color: 'rgba\(242,242,242,0.4\)', fontSize: '14px', fontWeight: 'bold' }}>\+<\/span>/,
  '<span style={{ color: \'rgba(242,242,242,0.4)\', fontSize: \'14px\', fontWeight: \'bold\', display: \'none\' }}>+</span>'
);

// Challenge Mine Now -> remove arrow
content = content.replace(/'Challenge Mine Now →'/g, "'Challenge Mine Now'");

// x.com footer link
content = content.replace(
  /className="x-link-lovable"\s*>\s*x\.com\s*<\/a>/s,
  `className="x-link-lovable"
            >
              <Twitter size={14} />
            </a>`
);
content = content.replace(
  /x\.com\/0xalyt<\/a>/,
  `<Twitter size={14} /></a>`
);

// Have fun with your agent
content = content.replace(
  /fontFamily: "'Poppins', sans-serif",\s*fontWeight: "700",\s*fontStyle: "italic",\s*color: "#f2f2f2",\s*letterSpacing: "-0.02em",\s*fontSize: "clamp\(18px, 6vw, 64px\)",\s*textAlign: "left",\s*whiteSpace: "nowrap",\s*lineHeight: 1\s*}}\s*>\s*Have fun with your agent/s,
  `fontFamily: "'Inter', sans-serif",
              fontWeight: "400",
              color: "#a0a0a0",
              fontSize: "14px",
              textAlign: "left",
              lineHeight: 1
            }}
          >
            Have fun with your agent`
);

fs.writeFileSync('src/pages/Home.jsx', content);
