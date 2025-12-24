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

// Singleton pattern for Firestore instance
let dbInstance: Firestore | null = null;

/**
 * Ensures Firebase is initialized and returns the Firestore instance.
 * Using a function to guarantee that initialization has completed.
 */
const getDb = (): Firestore | null => {
  if (dbInstance) return dbInstance;
  
  try {
    const apps = getApps();
    const app: FirebaseApp = apps.length === 0 ? initializeApp(firebaseConfig) : getApp();
    
    // Attempt to get firestore instance
    dbInstance = getFirestore(app);
    return dbInstance;
  } catch (error) {
    console.error("Critical Firebase Initialization Error:", error);
    return null;
  }
};

/**
 * Belirli bir döküman yolu için gerçek zamanlı senkronizasyon başlatır.
 */
export const syncPath = (path: string, callback: (data: any) => void) => {
  const db = getDb();
  
  if (!db) {
    console.warn(`Firestore initialization delayed for [${path}]. Retrying in 2 seconds...`);
    const retryTimeout = setTimeout(() => syncPath(path, callback), 2000);
    return () => clearTimeout(retryTimeout);
  }

  try {
    const parts = path.split('/');
    if (parts.length < 2) {
      console.error(`Invalid Firestore path: ${path}`);
      return () => {};
    }
    
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

/**
 * Firestore'daki bir dökümanı günceller.
 */
export const updatePath = async (path: string, data: any) => {
  const db = getDb();
  
  if (!db || data === undefined) {
    console.warn(`Firestore not ready for update at [${path}].`);
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

// Modül yüklendiğinde bir kez ilklendirmeyi dene
getDb();
