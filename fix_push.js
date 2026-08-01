const fs = require('fs');
let code = fs.readFileSync('src/components/PushNotificationManager.jsx', 'utf8');

// Always resubscribe to ensure the subscription is fresh and includes the gameId
const oldSubscribeLogic = `        if (Notification.permission === 'granted') {
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

const newSubscribeLogic = `        if (Notification.permission === 'granted' && gameId) {
          subscribeUser(registration);
        }`;

code = code.replace(oldSubscribeLogic, newSubscribeLogic);

fs.writeFileSync('src/components/PushNotificationManager.jsx', code);
console.log('Fixed push logic.');
