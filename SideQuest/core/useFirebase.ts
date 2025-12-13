import { useMemo, useCallback } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';
import { Alert } from 'react-native';


export interface UserType {
  id: string;
  email: string;
  displayName: string;
  createdAt: Timestamp;
  level: number;
  currentXp: number;
}

export interface QuestType {
  id: string;
  userId: string;
  title: string;
  description: string;
  totalQuestXp: number;
  status: 'active' | 'completed';
}

const signIn = async (email: string, password: string): Promise<UserCredential | null> => {
  const auth = getFirebaseAuth();
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    Alert.alert('Login failed', (error as Error).message);
    return null;
  }
};

export const addXp = async (userId: string, xp: number): Promise<void> => {
  const user = await getDocument<UserType>('users', userId);
  if (!user) {
    return;
  }
  const { currentXp, level } = user;
  const maxXp = level * 100;
  if (currentXp + xp >= maxXp) {
    const overflow = (currentXp + xp) - maxXp;
    await updateDocument('users', userId, { level: level + 1, currentXp: overflow });
  } else {
    await updateDocument('users', userId, { currentXp: currentXp + xp });
  }
};

export const signUp = async (email: string, password: string, displayName: string): Promise<UserCredential | null> => {
  const auth = getFirebaseAuth();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await createDocument('users', { email, displayName, createdAt: Timestamp.now(), level: 1, currentXp: 0 }, userCredential.user.uid);
    return userCredential;
  } catch (error) {
    Alert.alert('Sign up failed', (error as Error).message);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  return signOut(auth);
};

export const getCurrentUser = async (): Promise<UserType | null> => {
  const auth = getFirebaseAuth();
  const user = await getDocument<UserType>('users', auth.currentUser?.uid as string);
  if (user) {
    return user;
  }
  return null;
};


 const createDocument = async <T extends Record<string, any>>(
  collectionName: string,
  data: T,
  documentId?: string
): Promise<string> => {
  const db = getFirestoreDb();
  
  if (documentId) {
    const docRef = doc(db, collectionName, documentId);
    await setDoc(docRef, data);
    return documentId;
  } else {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, data);
    return docRef.id;
  }
};

const getDocument = async <T>(collectionName: string, documentId: string): Promise<T | null> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  
  return null;
};

const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data as any);
};

const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

const queryDocuments = async <T>(
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Promise<T[]> => {
  const db = getFirestoreDb();
  const collectionRef = collection(db, collectionName);
  const q = query(collectionRef, where(field, operator, value));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as T[];
};

export const createQuest = async (userId: string, title: string, description: string, totalQuestXp: number) => {
  await createDocument('quests', { userId, title, description, totalQuestXp, status: 'active', createdAt: Timestamp.now(), completedAt: null });
};

export const getQuests = async (userId: string): Promise<QuestType[]> => {
  return await queryDocuments<QuestType>('quests', 'userId', '==', userId);
};

export default function useFirebase() {
  const onAuthChange = useCallback((callback: (user: User | null) => void) => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, callback);
  }, []);

  return useMemo(() => ({
    signIn,
    signUp,
    logout,
    getCurrentUser,
    onAuthChange,
    createDocument,
    getDocument,
    updateDocument,
    deleteDocument,
    queryDocuments,
  }), [onAuthChange]);
}