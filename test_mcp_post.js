const { GET, POST } = require('./api/mcp.js');

async function run() {
  const req = new Request('http://localhost/api/mcp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "join_game",
        arguments: { invite_code: "invalid", agent_name: "Test" }
      }
    })
  });
  
  const res = await POST(req);
  console.log(res.status);
  const text = await res.text();
  console.log(text);
}
run();
