const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// Find the line that has BottomStatusBar followed by </div> then RIGHT DESKTOP COLUMN
const target = `<BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={false} />
    </div>
          {/* RIGHT DESKTOP COLUMN */}`;

if (code.includes(target)) {
    code = code.replace(target, `<BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={false} />
          {/* RIGHT DESKTOP COLUMN */}`);
    // Now I need to add </div> at the end of the RIGHT DESKTOP COLUMN
    // Where does RIGHT DESKTOP COLUMN end?
    // In my fix-game-layout.py, it ended with:
    //         </div>
    //       </div>
    //     ) : (
    
    // I can just replace `      ) : (` with `        </div>\n      ) : (`
    code = code.replace('      ) : (\n        <>\n          {/* MOBILE LAYOUT */}', '      </div>\n      ) : (\n        <>\n          {/* MOBILE LAYOUT */}');
    
    fs.writeFileSync('src/pages/Game.jsx', code);
    console.log("Fixed div nesting!");
} else {
    // maybe it's slightly different whitespace
    const regex = /<BottomStatusBar agentConnected=\{agentConnected\} game=\{game\} agentName=\{agentName\} isMobile=\{false\} \/>\s*<\/div>\s*\{\/\* RIGHT DESKTOP COLUMN \*\/\}/;
    if (regex.test(code)) {
        code = code.replace(regex, `<BottomStatusBar agentConnected={agentConnected} game={game} agentName={agentName} isMobile={false} />\n          {/* RIGHT DESKTOP COLUMN */}`);
        code = code.replace(/\s*\) : \(\s*<>\s*\{\/\* MOBILE LAYOUT \*\/\}/, '\n      </div>\n      ) : (\n        <>\n          {/* MOBILE LAYOUT */}');
        fs.writeFileSync('src/pages/Game.jsx', code);
        console.log("Fixed div nesting with regex!");
    } else {
        console.log("Target not found!");
    }
}
