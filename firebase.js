import {
  initializeApp,
  getApp,
  getApps,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  orderBy,
  serverTimestamp,
  limit,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBgS5PP4jIWs07zLS_uw8pNW3KIqG2C7J8",
  authDomain: "plantdoctor-5e41b.firebaseapp.com",
  projectId: "plantdoctor-5e41b",
  storageBucket: "plantdoctor-5e41b.firebasestorage.app",
  messagingSenderId: "324376314672",
  appId: "1:324376314672:web:0c1058f634771806433ef5",
  measurementId: "G-02LBYEKQS6",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
console.log("db", db);

export const auth = getAuth(app);
console.log("auth", auth);
// Keep the user logged in across page navigation and browser restarts.
export const authReady = setPersistence(auth, browserLocalPersistence);
console.log("authReady", authReady);

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

// Find plant diagnosis
export async function findDiagnosis(plantName, appearance, wateringLevel) {
  const plantKey = normalize(plantName);
  const appearanceKey = normalize(appearance);
  const wateringKey = normalize(wateringLevel);

  const diagnosesRef = collection(db, "plant_diagnosis");

  const diagnosisQuery = query(
    diagnosesRef,
    where("plantName", "==", plantKey.replace(/_/g, " ")),
    where("appearance", "==", appearanceKey),
    where("wateringLevel", "==", wateringKey),
  );

  const snapshot = await getDocs(diagnosisQuery);
  console.log("snap_data", snapshot.docs[0].data);

  if (!snapshot.empty) {
    return snapshot.docs[0].data();
  }

  return null;
}

// Save diagnosis history
export async function saveDiagnosisHistory(diagnosisData) {
  await authReady;

  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please log in to save your diagnosis history.");
  }

  const historyRef = collection(db, "users", user.uid, "diagnosisHistory");

  await addDoc(historyRef, {
    ...diagnosisData,
    createdAt: serverTimestamp(),
  });
}

// Get diagnosis history
export async function getDiagnosisHistory() {
  await authReady;

  const user = auth.currentUser;
  console.log("user", user);

  if (!user) {
    throw new Error("Please log in to view your diagnosis history.");
  }

  const historyRef = collection(db, "users", user.uid, "diagnosisHistory");

  const historyQuery = query(
    historyRef,
    orderBy("createdAt", "desc"),
    limit(100),
  );

  const snapshot = await getDocs(historyQuery);
  console.log("snapshot", snapshot.docs);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}
