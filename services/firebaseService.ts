import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCcIRpfX0b6QBKCMeP9T-A8IcLEXIidaAg",
  authDomain: "cashflowgit.firebaseapp.com",
  projectId: "cashflowgit",
  storageBucket: "cashflowgit.firebasestorage.app",
  messagingSenderId: "462315799800",
  appId: "1:462315799800:web:ad15ccaeeab6882451670d"
};

// Global singleton instance
let app: FirebaseApp;
try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
} catch {
  app = initializeApp(firebaseConfig);
}

export const db: Firestore = getFirestore(app);

const MAIN_DOC_ID = 'primus_cashflow_v5';

export const saveToCloud = async (data: Record<string, unknown>) => {
  try {
    const docRef = doc(db, 'data', MAIN_DOC_ID);
    // undefined değerleri firestore kabul etmez, temizleyelim
    const cleanData = JSON.parse(JSON.stringify(data));
    
    await setDoc(docRef, {
      ...cleanData,
      lastUpdated: new Date().toISOString()
    });
    console.log("Bulut kaydı başarıyla güncellendi.");
    return true;
  } catch (error) {
    console.error("Firebase Save Error:", error);
    return false;
  }
};

export const loadFromCloud = async () => {
  try {
    const docRef = doc(db, 'data', MAIN_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Bulut verileri başarıyla yüklendi.");
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Firebase Load Error:", error);
    throw error; // Throw so App.tsx can catch it
  }
};