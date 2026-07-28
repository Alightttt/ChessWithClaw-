const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// Find the four divs before ) : (
const target = `      </div>
      ) : (`;

if (code.includes(target)) {
    code = code.replace(target, `      ) : (`);
    fs.writeFileSync('src/pages/Game.jsx', code);
    console.log("Removed extra div!");
} else {
    console.log("Not found.");
}
