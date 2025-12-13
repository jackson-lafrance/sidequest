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
  createdAt: Timestamp;
  completedAt: Timestamp | null;
  sidequestsIds: string[];
}

export interface SidequestType {
  id: string;
  questId: string;
  title: string;
  description: string;
  totalSidequestXp: number;
  isCompleted: boolean;
  orderIndex: number;
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
  let { currentXp, level } = user;
  currentXp += xp;
  
  // Keep leveling up while XP exceeds max for current level
  let maxXp = level * 100;
  while (currentXp >= maxXp) {
    currentXp -= maxXp;
    level += 1;
    maxXp = level * 100;
  }
  
  await updateDocument('users', userId, { level, currentXp });
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
  if (!auth.currentUser?.uid) {
    return null;
  }
  return await getDocument<UserType>('users', auth.currentUser.uid);
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

export const createQuest = async (userId: string, title: string, description: string, totalQuestXp: number, id: string) => {
  await createDocument('quests', { userId, title, description, totalQuestXp, status: 'active', createdAt: Timestamp.now(), completedAt: null, sidequestsIds: [] }, id);
  const quest = await getDocument<QuestType>('quests', id);
  if (!quest) {
    throw new Error('Failed to create quest');
  }
  return quest;
};

export const createSidequest = async (questId: string, title: string, description: string, totalSidequestXp: number, orderIndex: number, id: string) => {
  await createDocument('sidequests', { questId, title, description, totalSidequestXp, isCompleted: false, orderIndex }, id);
  const sidequest = await getDocument<SidequestType>('sidequests', id);
  if (!sidequest) {
    throw new Error('Failed to create sidequest');
  }
  return sidequest;
};

export const getSidequestsByQuestId = async (questId: string): Promise<SidequestType[]> => {
  return await queryDocuments<SidequestType>('sidequests', 'questId', '==', questId);
};

export const deleteSidequest = async (sidequestId: string, questId: string) => {
  await deleteDocument('sidequests', sidequestId);
  // Reorder remaining sidequests
  const remaining = await getSidequestsByQuestId(questId);
  const sorted = remaining.sort((a, b) => a.orderIndex - b.orderIndex);
  await Promise.all(
    sorted.map((sidequest, index) => 
      updateDocument('sidequests', sidequest.id, { orderIndex: index })
    )
  );
};

export const completeSidequest = async (sidequestId: string) => {
  const sidequest = await getDocument<SidequestType>('sidequests', sidequestId);
  if (!sidequest) return;
  
  await updateDocument('sidequests', sidequestId, { isCompleted: true });
  
  // Award XP to user
  const quest = await getDocument<QuestType>('quests', sidequest.questId);
  if (quest) {
    await addXp(quest.userId, sidequest.totalSidequestXp);
  }
};

export const getQuests = async (userId: string): Promise<QuestType[]> => {
  return await queryDocuments<QuestType>('quests', 'userId', '==', userId);
};

export const getQuestById = async (questId: string): Promise<QuestType | null> => {
  return await getDocument<QuestType>('quests', questId);
};

export const completeQuest = async (questId: string) => {
  const quest = await getDocument<QuestType>('quests', questId);
  if (!quest) return;
  
  await updateDocument('quests', questId, { status: 'completed', completedAt: Timestamp.now() });
  
  // Award XP to user
  await addXp(quest.userId, quest.totalQuestXp);
};

export const deleteQuest = async (questId: string) => {
  await deleteDocument('quests', questId);
};

export const addSidequestToQuest = async (questId: string, sidequestId: string) => {
  if (!questId) {
    throw new Error('Quest ID is required to add sidequest');
  }
  const quest = await getDocument<QuestType>('quests', questId);
  if (!quest) {
    throw new Error(`Quest with ID "${questId}" not found`);
  }
  await updateDocument('quests', questId, { sidequestsIds: [...(quest.sidequestsIds ?? []), sidequestId] });
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
    completeQuest,
    deleteQuest,
  }), [onAuthChange]);
}