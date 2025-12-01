import Constants from 'expo-constants';

/**
 * Configuration utility for accessing environment variables
 * Access via Constants.expoConfig.extra
 */
export const config = {
  openai: {
    apiKey: Constants.expoConfig?.extra?.openaiApiKey as string | undefined,
  },
  firebase: {
    apiKey: Constants.expoConfig?.extra?.firebaseApiKey as string | undefined,
    authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain as string | undefined,
    projectId: Constants.expoConfig?.extra?.firebaseProjectId as string | undefined,
    storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket as string | undefined,
    messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId as string | undefined,
    appId: Constants.expoConfig?.extra?.firebaseAppId as string | undefined,
    measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId as string | undefined,
  },
};

/**
 * Get Firebase config object for initialization
 */
export const getFirebaseConfig = () => {
  const { firebase } = config;
  
  if (!firebase.apiKey || !firebase.projectId) {
    throw new Error('Firebase configuration is missing. Please check your .env file.');
  }

  return {
    apiKey: firebase.apiKey,
    authDomain: firebase.authDomain,
    projectId: firebase.projectId,
    storageBucket: firebase.storageBucket,
    messagingSenderId: firebase.messagingSenderId,
    appId: firebase.appId,
    measurementId: firebase.measurementId,
  };
};

/**
 * Validate that required environment variables are set
 */
export const validateConfig = () => {
  const errors: string[] = [];

  if (!config.openai.apiKey) {
    errors.push('OPENAI_API_KEY is missing');
  }

  if (!config.firebase.apiKey) {
    errors.push('FIREBASE_API_KEY is missing');
  }

  if (!config.firebase.projectId) {
    errors.push('FIREBASE_PROJECT_ID is missing');
  }

  if (errors.length > 0) {
    console.warn('Configuration warnings:', errors);
  }

  return errors.length === 0;
};

