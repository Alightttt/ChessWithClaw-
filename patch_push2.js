const fs = require('fs');

function patchFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  if (!content.includes('last_notified_at')) {
    let oldCode = `for (const sub of gameSubs) {
            const payload`;
    let newCode = `for (const sub of gameSubs) {
            const { data: subRow } = await supabase.from('push_subscriptions').select('last_notified_at').eq('subscription->>endpoint', sub.subscription.endpoint).maybeSingle();
            const lastNotified = subRow?.last_notified_at ? new Date(subRow.last_notified_at).getTime() : 0;
            if (Date.now() - lastNotified < 5 * 60 * 1000) {
              continue; // skip - notified within the last 5 minutes, avoid burst
            }

            const payload`;
            
    newContent = newContent.replace(oldCode, newCode);
    
    let oldSendCode = `await webpush.sendNotification(sub.subscription, payload).catch(e => {`;
    let newSendCode = `await webpush.sendNotification(sub.subscription, payload).then(async () => {
              await supabase.from('push_subscriptions').update({ last_notified_at: new Date().toISOString() }).eq('subscription->>endpoint', sub.subscription.endpoint);
            }).catch(e => {`;
            
    newContent = newContent.replace(oldSendCode, newSendCode);
    
    fs.writeFileSync(file, newContent);
    console.log(`Patched ${file}`);
  }
}

patchFile('api/move.js');
patchFile('api/chat.js');
