const fs = require('fs');
let code = fs.readFileSync('src/pages/Game.jsx', 'utf8');

const regex = /<span>@0xalyt<\/span>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*<\/div>[\s\n]*\)\}/m;
code = code.replace(regex, `<span>@0xalyt</span>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>`);

fs.writeFileSync('src/pages/Game.jsx', code);
