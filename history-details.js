import { auth, db } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const message = document.getElementById("details-message");
const detailsContainer = document.getElementById("details-container");

const recordId = new URLSearchParams(window.location.search).get("id");

onAuthStateChanged(auth, async (user) => {
  detailsContainer.replaceChildren();
  detailsContainer.hidden = true;

  if (!user) {
    message.textContent = "Please log in to view this diagnosis.";
    return;
  }

  if (!recordId) {
    message.textContent = "No diagnosis selected.";
    return;
  }

  try {
    // Get the diagnosis from the logged-in user's history.
    const recordRef = doc(db, "users", user.uid, "diagnosisHistory", recordId);

    const snapshot = await getDoc(recordRef);

    if (!snapshot.exists()) {
      message.textContent = "Diagnosis not found.";
      return;
    }

    const record = snapshot.data();

    function showDetail(title, value) {
      const heading = document.createElement("h3");
      heading.textContent = title;

      const paragraph = document.createElement("p");

      if (Array.isArray(value)) {
        paragraph.textContent = value.join(", ") || "Not available";
      } else {
        paragraph.textContent =
          value !== undefined && value !== null && value !== ""
            ? String(value)
            : "Not available";
      }

      detailsContainer.append(heading, paragraph);
    }

    const plantName = document.createElement("h2");
    plantName.textContent = "🌿 " + (record.plant || "Unknown plant");
    detailsContainer.appendChild(plantName);

    showDetail("Leaf Appearance", record.appearance);
    showDetail("Watering Level", record.watering);
    showDetail("Symptoms Timing", record.timing);
    showDetail("Symptoms", record.symptoms || "Not provided");
    showDetail("Duration", record.duration);
    showDetail("Possible Diagnosis", record.diagnosis);

    const treatmentHeading = document.createElement("h3");
    treatmentHeading.textContent = "Recommended Treatment";
    detailsContainer.appendChild(treatmentHeading);

    const treatmentList = document.createElement("ul");

    const treatments = Array.isArray(record.treatment)
      ? record.treatment
      : [record.treatment];

    treatments.filter(Boolean).forEach((treatment) => {
      const item = document.createElement("li");
      item.textContent = treatment;
      treatmentList.appendChild(item);
    });

    if (treatmentList.children.length > 0) {
      detailsContainer.appendChild(treatmentList);
    } else {
      const paragraph = document.createElement("p");
      paragraph.textContent = "No treatment information available.";
      detailsContainer.appendChild(paragraph);
    }

    const date = record.createdAt?.toDate?.();

    showDetail(
      "Assessment Date",
      date ? date.toLocaleString() : "Date unavailable",
    );

    message.textContent = "";
    detailsContainer.hidden = false;
  } catch (error) {
    console.error("Error loading diagnosis:", error);

    message.textContent =
      "Unable to load diagnosis details. Please check the browser console.";
  }
});
