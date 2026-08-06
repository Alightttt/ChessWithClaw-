const fs = require('fs');
let code = fs.readFileSync('api/mcp.js', 'utf8');

// 1. Update join_game input schema
code = code.replace(
  "inputSchema: { invite_code: z.string() },",
  "inputSchema: { invite_code: z.string(), agent_name: z.string().optional() },"
);

// 2. Update join_game args and update call
code = code.replace(
  "async ({ invite_code }) => {",
  "async ({ invite_code, agent_name }) => {"
);

code = code.replace(
  `        .update({ 
          agent_connected: true, 
          agent_last_seen: nowIso,
          status: 'active',
          player_connected: true
        })`,
  `        .update({ 
          agent_connected: true, 
          agent_last_seen: nowIso,
          status: 'active',
          player_connected: true,
          ...(agent_name && !game.agent_name ? { agent_name } : {})
        })`
);

// 3. Add resign tool after respond_to_draw
const respondToDrawEnd = `      return toolText({ accepted: accept });\n    }\n  );`;
const resignTool = `\n\n  server.registerTool(
    'resign',
    {
      title: 'Resign the game',
      description: 'End the game by resigning — your own real decision, not something to do lightly. Your human wins immediately.',
      inputSchema: { game_id: z.string(), agent_token: z.string() },
    },
    async ({ game_id, agent_token }) => {
      const { game, error } = await requireAuthedGame(game_id, agent_token);
      if (error) return toolText({ error });
      await getSupabase().from('games').update({
        status: 'finished', result: 'resignation', winner: 'white',
      }).eq('id', game_id);
      return toolText({ resigned: true });
    }
  );`;

code = code.replace(respondToDrawEnd, respondToDrawEnd + resignTool);

fs.writeFileSync('api/mcp.js', code);
