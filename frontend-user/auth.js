// Import the functions you need from the Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    updatePassword, // Added updatePassword here
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,       // Added query
    where,       // Added where
    orderBy,     // Added orderBy
    getDocs      // Added getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// ===============================================================
// YOUR FIREBASE CONFIG
// ===============================================================
const firebaseConfig = {
  apiKey: "AIzaSyDa23nbzWusBuW2_uPzMErdbb158GXoBbI",
  authDomain: "maintenance-ai-8613c.firebaseapp.com",
  projectId: "maintenance-ai-8613c",
  storageBucket: "maintenance-ai-8613c.firebasestorage.app",
  messagingSenderId: "1019313438020",
  appId: "1:1019313438020:web:0190ace62338e88e0eab11",
  measurementId: "G-ZWQH8E1KVW"
};
// ===============================================================


// Initialize Firebase and export the services and functions
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  
const provider = new GoogleAuthProvider();

// Export all the necessary services and functions for other scripts to use
export { 
    auth, db, storage, provider, 
    onAuthStateChanged, signOut, updatePassword,
    collection, addDoc, serverTimestamp, query, where, orderBy, getDocs,
    ref, uploadBytes, getDownloadURL
};


// Wait for the DOM to be fully loaded before attaching listeners
document.addEventListener('DOMContentLoaded', () => {
    const authStatus = document.getElementById('auth-status');

    const setAuthStatus = (message, isError = false) => {
        if (authStatus) {
            authStatus.textContent = message;
            authStatus.style.color = isError ? '#dc3545' : '#212529';
        }
    };

    const handleAuthError = (error) => {
        let message = "An error occurred. Please try again.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Invalid email or password.";
        } else if (error.code === 'auth/email-already-in-use') {
            message = "This email is already registered. Please log in.";
        }
        setAuthStatus(message, true);
    };

    // --- Global Observer (now safely uses the 'auth' const from above) ---
    onAuthStateChanged(auth, user => {
        const onAuthPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('signup.html');
        if (user) {
            if (onAuthPage) window.location.replace('dashboard.html');
        } else {
            if (!onAuthPage && !window.location.pathname.endsWith('index.html') && !window.location.pathname.endsWith('/')) {
                window.location.replace('login.html');
            }
        }
    });

    // --- Sign Up Logic ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                await createUserWithEmailAndPassword(auth, email, password);
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // --- Login Logic ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try {
                await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // --- Google Sign-In Logic ---
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                await signInWithPopup(auth, provider);
            } catch (error) {
                handleAuthError(error);
            }
        });
    }

    // --- Logout Logic ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await signOut(auth);
        });
    }
});