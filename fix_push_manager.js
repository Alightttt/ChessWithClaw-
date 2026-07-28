const fs = require('fs');
let content = fs.readFileSync('src/components/PushNotificationManager.jsx', 'utf8');

const oldBlock = `        if (Notification.permission === 'granted') {
          registration.pushManager.getSubscription().then((subscription) => {
            if (!subscription) {
              subscribeUser(registration);
            }
          });
        }`;

const newBlock = `        if (Notification.permission === 'granted') {
          registration.pushManager.getSubscription().then((subscription) => {
            if (!subscription) {
              subscribeUser(registration);
            } else if (gameId) {
              // Send the existing subscription to the backend for the new gameId
              fetch('/api/actions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save_push_subscription', subscription, gameId })
              }).catch(console.error);
            }
          });
        }`;

content = content.replace(oldBlock, newBlock);
fs.writeFileSync('src/components/PushNotificationManager.jsx', content);
