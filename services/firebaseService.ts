import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDNEjtnH6ZLTdM-jdGl2vrBz8nkNKFC76s",
  authDomain: "barlassetest.firebaseapp.com",
  databaseURL: "https://barlassetest-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "barlassetest",
  storageBucket: "barlassetest.firebasestorage.app",
  messagingSenderId: "613768627938",
  appId: "1:613768627938:web:f0b9ca5a6e7e6de6cb80bb"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

const MAIN_DOC_ID = 'primus_cashflow_v5';

export const saveToCloud = async (data: any) => {
  try {
    const docRef = doc(db, 'data', MAIN_DOC_ID);
    await setDoc(docRef, {
      ...data,
      lastUpdated: new Date().toISOString()
    }, { merge: true });
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
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Firebase Load Error:", error);
    return null;
  }
};