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
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

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
export const auth = getAuth(app);

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

export async function findDiagnosis(plantName, appearance, wateringLevel) {
  const plantKey = normalize(plantName);
  const appearanceKey = normalize(appearance);
  const wateringKey = normalize(wateringLevel);

  const diagnosesRef = collection(db, "plant_diagnosis");

  // Query the exact stored field values first.
  const diagnosisQuery = query(
    diagnosesRef,
    where("plantName", "==", plantKey.replace(/_/g, " ")),
    where("appearance", "==", appearanceKey),
    where("wateringLevel", "==", wateringKey),
  );

  const snapshot = await getDocs(diagnosisQuery);

  if (!snapshot.empty) {
    console.log("snapshot", snapshot.docs[0]);

    return snapshot.docs[0].data();
  }
  return null;
}

export async function saveDiagnosisHistory(diagnosisData) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please log in to save your disgnosis history");
  }

  const historyRef = collection(db, "users", user.uid, "diagnosisHistory");

  await addDoc(historyRef, {
    ...diagnosisData,
    createdAt: serverTimestamp(),
  });
}

export async function getDiagnosisHistory() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Please log in to view your diagnosis history");
  }

  const historyRef = collection(db, "users", user.uid, "diagnosisHistory");

  const historyQuery = query(
    historyRef,
    orderBy("createdAt", "desc"),
    limit(100),
  );

  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map((document) => ({
    id: document.id,
    ...document.data(),
  }));
}
