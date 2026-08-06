const fs = require('fs');

let gameJsx = fs.readFileSync('src/pages/Game.jsx', 'utf8');

// The code we added previously was:
const oldHook = `  useEffect(() => {
    if (normalizedMessages.length > lastChatLenRef.current) {
      if (!chatMobileOpen && normalizedMessages[normalizedMessages.length - 1]?.role === 'agent') {
        setHasUnreadChat(true);
      }
    }
    lastChatLenRef.current = normalizedMessages.length;
  }, [normalizedMessages.length, chatMobileOpen]);

  useEffect(() => {
    if (chatMobileOpen) {
      setHasUnreadChat(false);
    }
  }, [chatMobileOpen]);`;

gameJsx = gameJsx.replace(oldHook, '');

// Now we need to insert it AFTER normalizedMessages
gameJsx = gameJsx.replace(
  /const normalizedMessages = useMemo\(\(\) => \{[\s\S]*?\}, \[game\?.chat_history\]\);/,
  match => match + "\n\n" + oldHook
);

fs.writeFileSync('src/pages/Game.jsx', gameJsx);
console.log('Fixed Game.jsx hook');
