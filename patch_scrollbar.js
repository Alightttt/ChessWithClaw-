const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
const oldCss = `/* Global scrollbar hiding */
* {
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}
*::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
  height: 0 !important;
}`;

const newCss = `/* Global scrollbar rules */
@media (max-width: 899px) {
  /* Hide scrollbar completely on mobile */
  * {
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
  *::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
    height: 0 !important;
  }
}

@media (min-width: 900px) {
  /* Custom thin scrollbar for desktop */
  * {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
  }
  *::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }
  *::-webkit-scrollbar-track {
    background: transparent !important;
  }
  *::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-radius: 10px !important;
  }
  *::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.25) !important;
  }
}`;

css = css.replace(oldCss, newCss);
fs.writeFileSync('src/index.css', css);
