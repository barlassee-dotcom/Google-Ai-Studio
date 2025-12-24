
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyClUNt93ds2MQVolB9L5L6tGJlF0hdNTIQ",
  authDomain: "barlastestcashflow.firebaseapp.com",
  databaseURL: "https://barlastestcashflow-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "barlastestcashflow",
  storageBucket: "barlastestcashflow.firebasestorage.app",
  messagingSenderId: "457571851448",
  appId: "1:457571851448:web:11510e555d43fa2041284d"
};

let dbInstance: Firestore | null = null;

const getDb = (): Firestore | null => {
  if (dbInstance) return dbInstance;
  
  try {
    const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error("Firebase Initialization Error:", error);
    return null;
  }
};

export const syncPath = (path: string, callback: (data: any) => void) => {
  const db = getDb();
  if (!db) {
    console.error(`Cannot sync path [${path}]: Firestore not initialized.`);
    // Bağlantı koparsa periyodik olarak yeniden deneme mekanizması
    setTimeout(() => syncPath(path, callback), 2500);
    return () => {};
  }

  try {
    const parts = path.split('/');
    if (parts.length < 2) return () => {};
    
    const [collection, documentId] = parts;
    const docRef = doc(db, collection, documentId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().value);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Firestore Sync Error [${path}]:`, error);
    });
  } catch (err) {
    console.error(`Firestore Setup Error [${path}]:`, err);
    return () => {};
  }
};

export const updatePath = async (path: string, data: any) => {
  const db = getDb();
  if (!db || data === undefined) {
    console.warn(`Cannot update path [${path}]: DB not ready or data undefined.`);
    return;
  }
  
  try {
    const parts = path.split('/');
    if (parts.length < 2) return;
    
    const [collection, documentId] = parts;
    const docRef = doc(db, collection, documentId);
    
    await setDoc(docRef, { 
      value: data,
      lastUpdate: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.error(`Firestore Update Error [${path}]:`, error);
  }
};

export default getDb();
