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
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      message.textContent = "Account created successfully! Redirecting...";

      window.location.replace("login.html");
    } catch (error) {
      console.log(error);
      const messages = {
        "auth/email-already-in-use":
          "This eamil already has an account.Please log in.",
        "auth/invalid-email": "Please enter a valid email address",
        "auth/weak-password": "Please choose a stronger password",
        "auth/network-required-request-failed":
          "Network error.Check your internet connection",
        "auth/operation-not-allowed":
          "Email/Password sign-in is not enabled in Firebase",
      };

      message.textContent =
        messages[error.code] ||
        "Could not create your account.Please try again.";

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

      const messages = {
        "auth/invalid-credential": "Incorrect email or password.",
        "auth/user-not-found": "No account found.Please signup.",
        "auth/wrong-password": "Incorrect password",
        "auth/invalid-email": "please enter a valid email address",
        "auth/too-many-requests": "Too many attempts.Please try again later.",
        "auth/network-request-failed":
          "Network error.Check your internet connection",
      };
      message.textContent =
        messages[error.code] || "Login failed.Please try again.";
      button.disabled = false;
      button.textContent = "Log In";
    }
  });
}
