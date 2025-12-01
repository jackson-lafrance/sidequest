import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './config';

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;


export const initializeFirebase = (): FirebaseApp => {
  if (getApps().length > 0) {
    app = getApps()[0];
    return app;
  }

  const config = getFirebaseConfig();
  app = initializeApp(config);
  
  return app;
};

export const getFirebaseAuth = (): Auth => {
  if (!app) {
    app = initializeFirebase();
  }
  
  if (!auth) {
    auth = getAuth(app);
  }
  
  return auth;
};

export const getFirestoreDb = (): Firestore => {
  if (!app) {
    app = initializeFirebase();
  }
  
  if (!db) {
    db = getFirestore(app);
  }
  
  return db;
};

export const getFirebaseApp = (): FirebaseApp => {
  if (!app) {
    app = initializeFirebase();
  }
  
  return app;
};

