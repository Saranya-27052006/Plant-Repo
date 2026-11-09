import { auth, authReady } from "./firebase.js";

import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

await authReady;

const signup = document.querySelector(".signup_btn");
const login = document.querySelector(".login_btn");
const logout = document.getElementById("logout-btn");

const diagnosisLinks = document.querySelectorAll("#diag_btn, #diagnosis_btn");

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is already logged in.
    signup.style.display = "none";
    login.style.display = "none";
    logout.hidden = false;

    // Allow the user to return to assessment.
    diagnosisLinks.forEach((link) => {
      link.href = "formcode.html";
    });
  } else {
    // User is not logged in.
    signup.style.display = "";
    login.style.display = "";
    logout.hidden = true;

    diagnosisLinks.forEach((link) => {
      link.href = "signup.html";
    });
  }
});

// Logout manually.
logout.addEventListener("click", async () => {
  try {
    await signOut(auth);

    alert("You have logged out successfully!");

    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);

    alert("Could not log out. Please try again.");
  }
});
