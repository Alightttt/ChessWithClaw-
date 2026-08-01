const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

code = code.replace(
  /<\/div><\/div>            <\/div>          <\/div>                    \{\/\* BOTTOM INFO BAR \(Mobile\) \*\/\}/g,
  `</div></div></div></div></div>{/* BOTTOM INFO BAR (Mobile) */}`
);

fs.writeFileSync('src/pages/Game.jsx', code);
