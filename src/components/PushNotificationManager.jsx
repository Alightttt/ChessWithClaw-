import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [visitedGame, setVisitedGame] = useState(false);
  const [timePassed, setTimePassed] = useState(false);
  const location = useLocation();

  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    if (location.pathname.startsWith('/game/')) {
      setVisitedGame(true);
      const parts = location.pathname.split('/');
      if (parts[2]) {
        setGameId(parts[2]);
      }
    }
  }, [location.pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimePassed(true);
    }, 30000);
    return () => clearTimeout(timer);
  }, []);

  const [swRegistration, setSwRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        setSwRegistration(registration);
        
        // If already granted, ensure we are subscribed immediately
        if (Notification.permission === 'granted' && gameId) {
          subscribeUser(registration);
        }
      });
    }
  }, [gameId]);

  useEffect(() => {
    if (swRegistration && visitedGame) {
      if (Notification.permission === 'default') {
        const handleInteraction = () => {
          Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
              subscribeUser(swRegistration);
            }
          });
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
        document.addEventListener('click', handleInteraction);
        document.addEventListener('touchstart', handleInteraction);
        return () => {
          document.removeEventListener('click', handleInteraction);
          document.removeEventListener('touchstart', handleInteraction);
        };
      }
    }
  }, [swRegistration, visitedGame, gameId]);

  const subscribeUser = async (registration) => {
    try {
      const res = await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_vapid_key' })
      });
      const data = await res.json();
      const vapidPublicKey = data.key;
      
      if (!vapidPublicKey) {
        console.error('VAPID public key not found from server');
        return;
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
      
      const subscriptionJSON = subscription.toJSON();
      subscriptionJSON.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      await fetch('/api/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save_push_subscription', subscription: subscriptionJSON, gameId })
      });
      console.log('User is subscribed to push notifications.');
    } catch (err) {
      console.error('Failed to subscribe the user: ', err);
    }
  };

  return null;
}
