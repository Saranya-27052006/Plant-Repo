import { auth, getDiagnosisHistory } from "./firebase.js";

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const historyMessage = document.getElementById("history-message");

const historyList = document.getElementById("history-list");

onAuthStateChanged(auth, async (user) => {
  historyList.replaceChildren();

  if (!user) {
    historyMessage.textContent = "Please log in to view your history.";
    return;
  }

  historyMessage.textContent = "Loading history...";

  try {
    const records = await getDiagnosisHistory();

    if (records.length === 0) {
      historyMessage.textContent = "No diagnosis history found.";
      return;
    }

    historyMessage.textContent = "Your saved diagnoses";

    records.forEach((record) => {
      const card = document.createElement("article");

      card.className = "history-card";

      const name = document.createElement("h3");
      name.className = "plant-name";
      name.textContent = "🌿 " + (record.plant || "Unknown plant");

      const appearance = document.createElement("p");
      appearance.textContent =
        "🍃 Appearance: " + (record.appearance || "Not available");

      const diagnosis = document.createElement("p");
      diagnosis.textContent =
        "Diagnosis: " + (record.diagnosis || "Not available");

      const button = document.createElement("span");
      button.className = "view-button";
      button.textContent = "View Details →";

      card.append(name, appearance, diagnosis, button);

      card.addEventListener("click", () => {
        if (!record.id) {
          historyMessage.textContent = "Diagnosis record ID is missing.";
          return;
        }

        window.location.href =
          "history-details.html?id=" + encodeURIComponent(record.id);
      });

      historyList.appendChild(card);
    });
  } catch (error) {
    console.error(error);

    historyMessage.textContent = "Unable to load diagnosis history.";
  }
});
