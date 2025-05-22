// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAX2QaQXbXZI1ZTepXMNHy8NRmXUuV_KJM",
    authDomain: "doubtdrop-18eaa.firebaseapp.com",
    projectId: "doubtdrop-18eaa",
    storageBucket: "doubtdrop-18eaa.firebasestorage.app",
    messagingSenderId: "743419502892",
    appId: "1:743419502892:web:581d9d14305be87dbc4c89",
    measurementId: "G-7GXLDGF5JB"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



export { app };
