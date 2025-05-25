import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";

import { app } from "./firebase-config.js";

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const container = document.getElementById("container");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");

registerBtn?.addEventListener("click", () => {
  container.classList.add("active");
});

loginBtn?.addEventListener("click", () => {
  container.classList.remove("active");
});

// Sign Up with Email/Password
const signupForm = document.querySelector(".sign-up form");
signupForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = signupForm.querySelector("input[type='email']").value;
  const password = signupForm.querySelector("input[type='password']").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      sendEmailVerification(user).then(() => {
        alert("Signup successful! Please verify your email.");
        signupForm.reset();
      });
    })
    .catch((error) => {
      alert(`Signup error: ${error.message}`);
    });
});

// Sign In with Email/Password
const loginForm = document.querySelector(".sign-in form");
loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const email = loginForm.querySelector("input[type='email']").value;
  const password = loginForm.querySelector("input[type='password']").value;

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      if (!user.emailVerified) {
        alert("Please verify your email before logging in.");
        return;
      }
      alert("Login successful!");
      loginForm.reset();
    })
    .catch((error) => {
      alert(`Login error: ${error.message}`);
    });
});

document.querySelectorAll(".fa-google-plus-g").forEach((icon) => {
  icon.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        alert(`Welcome, ${user.displayName}!`);
        console.log("User info:", user);
        window.location.href="class.html";
        // Optional: redirect to dashboard
      })
      .catch((error) => {
        alert(`Google sign-in failed: ${error.message}`);
      });
  });
});

