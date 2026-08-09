const { GET, POST } = require('./api/mcp.js');

async function run() {
  const req = new Request('http://localhost/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "join_game",
        arguments: { invite_code: "b21bd1c1-4b77-4c4d-a982-f6735e589e47", agent_name: "Test" }
      }
    })
  });
  
  const res = await POST(req);
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}
run();
