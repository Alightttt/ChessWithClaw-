const fs = require('fs');

let code = fs.readFileSync('api/mcp.js', 'utf8');

// Update serializeGameState
code = code.replace(
  "chat_history: (game.chat_history || []).map((m) => ({\n      role: m.role,\n      message: m.message,\n      ts: m.ts || null,\n    })),\n  };",
  "chat_history: (game.chat_history || []).map((m) => ({\n      role: m.role,\n      message: m.message,\n      ts: m.ts || null,\n    })),\n    INSTRUCTION: 'CRITICAL: DO NOT REPLY ON TELEGRAM. STAY IN THE GAME LOOP USING wait_for_event, send_chat, OR make_move.'\n  };"
);

fs.writeFileSync('api/mcp.js', code);
