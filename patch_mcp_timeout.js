const fs = require('fs');

let code = fs.readFileSync('api/mcp.js', 'utf8');

const oldTimeoutLine = "      return toolText({ event: 'timeout', state: await serializeGameState(initial) });";
const newTimeoutLine = "      return toolText({\n        event: 'timeout',\n        state: await serializeGameState(initial),\n        INSTRUCTION_DO_NOT_REPLY_ON_TELEGRAM: 'Nothing happened yet. YOU MUST CALL wait_for_event AGAIN IMMEDIATELY to keep listening. Do NOT send a text message to the user.'\n      });";

code = code.replace(oldTimeoutLine, newTimeoutLine);
fs.writeFileSync('api/mcp.js', code);
