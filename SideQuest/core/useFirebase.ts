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
} from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from './firebase';

export const signIn = async (email: string, password: string): Promise<UserCredential> => {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
};

export const signUp = async (email: string, password: string): Promise<UserCredential> => {
  const auth = getFirebaseAuth();
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async (): Promise<void> => {
  const auth = getFirebaseAuth();
  return signOut(auth);
};

export const getCurrentUser = (): User | null => {
  const auth = getFirebaseAuth();
  return auth.currentUser;
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
};

export const createDocument = async <T extends Record<string, any>>(
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

export const getDocument = async <T>(collectionName: string, documentId: string): Promise<T | null> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  
  return null;
};

export const updateDocument = async <T extends Record<string, any>>(
  collectionName: string,
  documentId: string,
  data: Partial<T>
): Promise<void> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, data as any);
};

export const deleteDocument = async (collectionName: string, documentId: string): Promise<void> => {
  const db = getFirestoreDb();
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
};

export const queryDocuments = async <T>(
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

