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
    updatePassword,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    serverTimestamp,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

// YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDa23nbzWusBuW2_uPzMErdbb158GXoBbI",
  authDomain: "maintenance-ai-8613c.firebaseapp.com",
  projectId: "maintenance-ai-8613c",
  storageBucket: "maintenance-ai-8613c.firebasestorage.app",
  messagingSenderId: "1019313438020",
  appId: "1:1019313438020:web:0190ace62338e88e0eab11",
  measurementId: "G-ZWQH8E1KVW"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);  
const provider = new GoogleAuthProvider();

export { 
    auth, db, storage, provider, 
    onAuthStateChanged, signOut, updatePassword,
    collection, addDoc, serverTimestamp, query, where, orderBy, getDocs, doc, getDoc, setDoc,
    ref, uploadBytes, getDownloadURL
};

// --- Centralized Redirect Logic with DEBUGGING LOGS ---
onAuthStateChanged(auth, async (user) => {
    console.log("[DEBUG] Auth state changed. User:", user ? user.email : "Not logged in");
    const onAuthPage = window.location.pathname.includes('login.html') || window.location.pathname.includes('signup.html');
    const onAdminPage = window.location.pathname.includes('frontend-admin');

    if (user) {
        console.log("[DEBUG] User is logged in. Checking role in Firestore...");
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        console.log("[DEBUG] Does user document exist in 'users' collection?", userDoc.exists());
        if (userDoc.exists()) {
            console.log("[DEBUG] User role found in database is:", userDoc.data().role);
        }

        const isAdmin = userDoc.exists() && userDoc.data().role === 'admin';
        console.log("[DEBUG] Is this user determined to be an admin?", isAdmin);

        if (isAdmin) {
            if (!onAdminPage) {
                console.log("[DEBUG] Admin is not on an admin page. Redirecting to admin.html...");
                window.location.replace('../frontend-admin/admin.html');
            }
        } else {
            if (onAdminPage) {
                console.log("[DEBUG] Regular user is on an admin page. Redirecting to user dashboard...");
                window.location.replace('../frontend-user/dashboard.html');
            } else if (onAuthPage) {
                console.log("[DEBUG] Regular user just logged in. Redirecting to user dashboard...");
                window.location.replace('dashboard.html');
            }
        }
    } else {
        const isProtectedPage = !onAuthPage && !window.location.pathname.endsWith('index.html') && window.location.pathname !== '/';
        if (isProtectedPage) {
            console.log("[DEBUG] No user logged in. Redirecting to login page...");
            window.location.replace('/TV-hackthon/frontend-user/login.html');
        }
    }
});


// --- Page-Specific Logic ---
document.addEventListener('DOMContentLoaded', () => {
    // ... This part remains the same as before ...
    const authStatus = document.getElementById('auth-status');
    const setAuthStatus = (message, isError = false) => { if (authStatus) { authStatus.textContent = message; authStatus.style.color = isError ? '#dc3545' : '#212529'; } };
    const handleAuthError = (error) => {
        let message = "An error occurred. Please try again.";
        if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            message = "Invalid email or password. Please try again.";
        } else if (error.code === 'auth/email-already-in-use') {
            message = "This email is already registered. Please log in.";
        }
        console.error("Firebase Auth Error:", error.code);
        setAuthStatus(message, true);
    };
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await setDoc(doc(db, "users", userCredential.user.uid), { email: userCredential.user.email, role: 'user', createdAt: serverTimestamp() });
            } catch (error) { handleAuthError(error); }
        });
    }
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            try { await signInWithEmailAndPassword(auth, email, password); } 
            catch (error) { handleAuthError(error); }
        });
    }
    const googleLoginBtn = document.getElementById('google-login-btn');
    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const userDocRef = doc(db, "users", result.user.uid);
                const userDoc = await getDoc(userDocRef);
                if (!userDoc.exists()) {
                    await setDoc(userDocRef, { email: result.user.email, role: 'user', createdAt: serverTimestamp() });
                }
            } catch (error) { handleAuthError(error); }
        });
    }
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => { await signOut(auth); });
    }
});