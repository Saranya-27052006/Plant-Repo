import { findDiagnosis, saveDiagnosisHistory } from "./firebase.js";
import { auth } from "./firebase.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

document
  .querySelector(".form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const plant = document.getElementById("name").value.trim().toLowerCase();
    const appearance = document
      .getElementById("appear")
      .value.trim()
      .toLowerCase();
    const timing = document.getElementById("st").value;
    const symptoms = document.getElementById("ta").value.trim();
    const duration = document.getElementById("ds").value.trim();
    const watering = document.getElementById("wl").value.trim().toLowerCase();

    const resultsContainer = document.querySelector(".result");
    const reslist = document.getElementById("cure-steps");
    const assessmentText = document.querySelector(".assessment p");

    function addResult(text) {
      const li = document.createElement("li");
      li.textContent = text;
      reslist.appendChild(li);
    }

    // Show the results area and prepare it for the new result.
    document.getElementById("form-container").style.display = "none";
    resultsContainer.style.display = "block";
    reslist.replaceChildren();

    try {
      const diagnosis = await findDiagnosis(plant, appearance, watering);
      console.log("diagnosis", diagnosis);

      const historyRecord = {
        plant: plant,
        appearance: appearance,
        timing: timing,
        symptoms: symptoms || "",
        duration: duration,
        watering: watering,
        diagnosis: diagnosis?.diagnosis || "No Matching diagnosis found",
        treatment: diagnosis?.treatment || [],
      };
      try {
        await saveDiagnosisHistory(historyRecord);
      } catch (historyError) {
        console.error("Could not save diagnosis history:", historyError);
      }

      assessmentText.textContent = `Plant: ${plant}. These are possible causes, not a confirmed diagnosis.`;
      addResult(`Plant name: ${plant}`);
      addResult(`Leaf appearance: ${appearance}`);
      addResult(`Symptoms timing: ${timing}`);
      addResult(`Description: ${symptoms || "Not provided"}`);
      addResult(`Duration: ${duration}`);
      addResult(`Watering level: ${watering}`);

      if (!diagnosis) {
        addResult("No matching diagnosis was found in Firebase.");
        addResult(
          "Try another assessment or add a verified record for this exact combination.",
        );
        addResult(
          "Check soil moisture, lighting, drainage and visible pests before treating the plant.",
        );
        return;
      }

      addResult(`Possible diagnosis: ${diagnosis.diagnosis}`);
      console.log("diagnosis.diagnosis", diagnosis.diagnosis);

      // Support either a string or an array in the treatment field.
      if (Array.isArray(diagnosis.treatment)) {
        diagnosis.treatment.forEach(addResult);
      } else if (typeof diagnosis.treatment === "string") {
        addResult(diagnosis.treatment);
      }
    } catch (error) {
      console.error("Firebase diagnosis error:", error.code);
      console.log("Firebase error message:", error.message);
      console.log("Full Firebase error", error);

      assessmentText.textContent = "Firebase connection failed";

      addResult(`Error code:${error.code || "Unknown"}`);
      addResult(
        `Error message:${error.message || "No error message available"}`,
      );
    }
  });

const logoutButton = document.getElementById("logout-btn");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      alert("You have logged out successfully!");
      window.location.href = "login.html";
    } catch (error) {
      console.error("Logout error:", error);
      alert("Could not log out.Please try again.");
    }
  });
}
