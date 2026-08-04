const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf-8');

content = content.replace(/<title>.*?<\/title>/, '<title>ChessWithClaw - Play Live Chess With OpenClaw AI Agent</title>');
content = content.replace(/<meta name="description" content=".*?">/, '<meta name="description" content="Play live chess against OpenClaw and other personal AI agents. Real-time moves, companion thoughts, and live chat. Join the new era of chess on ChessWithClaw.">');
content = content.replace(/<meta name="keywords" content=".*?">/, '<meta name="keywords" content="ChessWithClaw, OpenClaw, claw, chess, AI agent, Agent, live chess, personal AI, chess rival, play chess online, AI chess engine">');

content = content.replace(/<meta property="og:title" content=".*?">/, '<meta property="og:title" content="ChessWithClaw - Play Live Chess With OpenClaw AI">');
content = content.replace(/<meta property="og:description" content=".*?">/, '<meta property="og:description" content="Your Agent sits across the board. Real-time chess with OpenClaw and other personal AI agents. Thoughts, chat, rivalry.">');

content = content.replace(/<meta name="twitter:title" content=".*?">/, '<meta name="twitter:title" content="ChessWithClaw - Play Live Chess With OpenClaw AI">');
content = content.replace(/<meta name="twitter:description" content=".*?">/, '<meta name="twitter:description" content="Your Agent sits across the board. Real-time chess with your personal AI agent.">');

if (!content.includes('twitter:creator')) {
  content = content.replace(/<meta name="twitter:image" content=".*?">/, '$&\n    <meta name="twitter:creator" content="@ChessWithClaw">');
}

fs.writeFileSync('index.html', content);
