const fs = require('fs');

let lines = fs.readFileSync('api/actions.js', 'utf8').split('\n');

// Replace lines from "} else if (action === 'send_reengagement_push') {" to the next "} else if (action === 'get_vapid_key') {" or similar
let startIdx = -1;
let endIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("} else if (action === 'send_reengagement_push') {")) {
    startIdx = i;
  }
  // The block ends at line 219 which is "} " before "if (action === 'resign') {"
  if (startIdx !== -1 && i > startIdx && lines[i].includes("if (action === 'resign') {")) {
    endIdx = i;
    break;
  }
}

if (startIdx !== -1 && endIdx !== -1) {
  lines.splice(startIdx, endIdx - startIdx, "} else if (action === 'send_reengagement_push') { return res.status(200).json({ success: true, dummy: true }); }");
  fs.writeFileSync('api/actions.js', lines.join('\n'));
  console.log('Successfully patched actions.js');
} else {
  console.log('Could not find indices', startIdx, endIdx);
}
