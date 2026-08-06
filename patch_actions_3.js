const fs = require('fs');
let file = fs.readFileSync('api/actions.js', 'utf8');
const searchString = "} else if (action === 'send_reengagement_push') {";
const getVapidString = "} else if (action === 'get_vapid_key') {";
const startIdx = file.indexOf(searchString);
const endIdx = file.indexOf(getVapidString);
if (startIdx !== -1 && endIdx !== -1) {
  file = file.slice(0, startIdx) + "} else if (action === 'send_reengagement_push') { return res.status(200).json({ success: true, dummy: true });\n    " + file.slice(endIdx);
  fs.writeFileSync('api/actions.js', file);
  console.log('Successfully sliced out send_reengagement_push logic');
} else {
  console.log('Failed to find start or end index', startIdx, endIdx);
}
