const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
if (css.includes('@media (min-width: 900px)')) {
  console.log('Scrollbar logic is present.');
} else {
  console.log('Scrollbar logic missing.');
}
