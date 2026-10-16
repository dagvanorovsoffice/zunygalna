import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  getFirestore,
  Firestore,
} from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

export function parseFirebaseConfig(configStr?: string): Record<string, string> | null {
  if (!configStr || configStr.trim() === '') return null;
  try {
    let cleanJson = configStr.trim();
    if (cleanJson.includes('{')) {
      cleanJson = cleanJson.substring(cleanJson.indexOf('{'));
    }
    if (cleanJson.endsWith(';')) {
      cleanJson = cleanJson.slice(0, -1);
    }
    try {
      return JSON.parse(cleanJson);
    } catch {
      const relaxedJson = cleanJson
        .replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":')
        .replace(/'/g, '"')
        .replace(/,\s*([}\]])/g, '$1');
      return JSON.parse(relaxedJson);
    }
  } catch {
    return null;
  }
}

export function getFirebaseClient(): {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
  isFirebaseEnabled: boolean;
} {
  let config: Record<string, string> = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'zunygalna',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
  };

  const rawConfigStr =
    process.env.NEXT_PUBLIC_FIREBASE_CONFIG ||
    process.env.FIREBASE_WEBAPP_CONFIG ||
    process.env.FIREBASE_CONFIG ||
    '';
  const parsedStatic = parseFirebaseConfig(rawConfigStr);
  if (parsedStatic) {
    config = { ...config, ...parsedStatic };
  }

  const isValidConfig = Boolean(
    config.apiKey && config.apiKey.trim() !== '' && config.apiKey !== 'YOUR_API_KEY'
  );

  if (!isValidConfig) {
    return { app: null, db: null, auth: null, isFirebaseEnabled: false };
  }

  try {
    const app = getApps().length === 0 ? initializeApp(config) : getApp();
    let db: Firestore;
    if (typeof window !== 'undefined') {
      try {
        db = initializeFirestore(app, {
          localCache: persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          }),
        });
      } catch {
        db = getFirestore(app);
      }
    } else {
      db = getFirestore(app);
    }
    const auth = typeof window !== 'undefined' ? getAuth(app) : null;
    return { app, db, auth, isFirebaseEnabled: true };
  } catch {
    return { app: null, db: null, auth: null, isFirebaseEnabled: false };
  }
}

const client = getFirebaseClient();
export const db = client.db;
export const auth = client.auth;
export const isFirebaseEnabled = client.isFirebaseEnabled;
