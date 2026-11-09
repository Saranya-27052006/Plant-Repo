import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { auth } from "./firebase.js";

const signupForm = document.getElementById("signup-form");
if (signupForm) {
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value;
    const message = document.getElementById("signup-message");
    const button = document.getElementById("signup_button");

    message.textContent = "";

    button.disabled = true;
    button.textContent = "Creating account...";

    try {
      //creates new firebase authentication account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      console.log("usercredential", userCredential);
      console.log("usercredential.user", userCredential.user);

      await updateProfile(userCredential.user, {
        displayName: name,
      });

      message.textContent = "Account created successfully! Redirecting...";
      window.location.replace("login.html");
    } catch (error) {
      console.log(error);
      message.textContent = "Could not create your account.Please try again.";
      button.disabled = false;
      button.textContent = "Sign Up";
    }
  });
}

// login

const loginForm = document.getElementById("login-form");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value;
    const message = document.getElementById("login-message");

    const button = document.getElementById("login-button");
    // message.textContent = "";
    button.disabled = true;
    button.textContent = "Logging in...";
    console.log("login");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.textContent = "Login successful! Redirecting...";

      window.location.replace("formcode.html");
    } catch (error) {
      console.log(error);
      message.textContent = "Login failed.Please try again.";
      button.disabled = false;
      button.textContent = "Log In";
    }
  });
}
