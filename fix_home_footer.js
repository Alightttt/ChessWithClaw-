const fs = require('fs');
let file = fs.readFileSync('src/pages/Home.jsx', 'utf8');

const newFooter = `<footer style={{ borderTop: '1px solid #1a1a1a', padding: '24px 16px', background: '#0a0a0a', overflow: 'hidden' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-5">
          <div className="flex items-center justify-center gap-6 md:gap-8">
            <a 
              href="https://x.com/0xalyt" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[rgba(242,242,242,0.5)] hover:text-white transition-colors flex items-center justify-center"
              style={{ width: '24px', height: '24px' }}
            >
              <XLogo style={{ width: "20px", height: "20px", fill: "currentColor" }} />
            </a>
            
            <a 
              href="https://github.com/Alightttt/ChessWithClaw" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[rgba(242,242,242,0.5)] hover:text-white transition-colors font-['Inter'] text-[15px] font-medium"
              style={{ textDecoration: 'none' }}
            >
              Install
            </a>

            <span 
              onClick={() => navigate('/legal')}
              className="text-[rgba(242,242,242,0.5)] hover:text-white transition-colors font-['Inter'] text-[15px] font-medium cursor-pointer"
            >
              Legal
            </span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <div
              style={{
                fontFamily: "'Inter', sans-serif",
                fontWeight: "500",
                color: "#a0a0a0",
                fontSize: "18px",
                textAlign: "center",
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}
            >
              Have fun with your agent
            </div>

            <div className="font-['Inter'] text-[13px] text-[rgba(242,242,242,0.4)] mt-2">
              © 2026 ChessWithClaw
            </div>
          </div>
        </div>
      </footer>`;

file = file.replace(/<footer[\s\S]*?<\/footer>/, newFooter);
fs.writeFileSync('src/pages/Home.jsx', file);
console.log('Fixed Home footer');
