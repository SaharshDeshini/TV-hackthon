// Ensure Firebase is initialized in your main script if not already here
// For this example, we'll assume firebase-app-compat.js and firebase-auth-compat.js are loaded.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js';

// Your Firebase configuration (REPLACE WITH YOUR ACTUAL CONFIG)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get elements
const loginForm = document.getElementById('loginForm');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const googleLoginBtn = document.getElementById('google-login-btn');
const authStatusDiv = document.getElementById('auth-status');
const loginButton = loginForm.querySelector('.btn-primary'); // Get the login button


// --- Input Field Focus Animation (Visual Enhancement) ---
const inputs = document.querySelectorAll('.auth-card input');

inputs.forEach(input => {
    input.addEventListener('focus', () => {
        // Add a class for focused state for potential CSS transitions
        input.classList.add('is-focused');
    });

    input.addEventListener('blur', () => {
        // Remove the class when focus is lost
        input.classList.remove('is-focused');
    });
});

// --- Dynamic Status Message Display ---
function showStatusMessage(message, type = 'error') {
    authStatusDiv.textContent = message;
    authStatusDiv.className = 'auth-status visible'; // Reset classes and make visible
    if (type === 'success') {
        authStatusDiv.style.color = '#27ae60'; // Green for success
    } else {
        authStatusDiv.style.color = '#e74c3c'; // Red for error
    }

    // Hide message after a few seconds
    setTimeout(() => {
        authStatusDiv.classList.remove('visible');
    }, 5000);
}


// --- Form Submission (Login with Email/Password) ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    // Basic client-side validation (visual feedback)
    if (!email || !password) {
        showStatusMessage('Please enter both email and password.');
        if (!email) loginEmailInput.classList.add('input-error');
        if (!password) loginPasswordInput.classList.add('input-error');
        return;
    } else {
        loginEmailInput.classList.remove('input-error');
        loginPasswordInput.classList.remove('input-error');
    }

    loginButton.textContent = 'Logging In...'; // Show loading state
    loginButton.disabled = true; // Disable button during login

    try {
        await signInWithEmailAndPassword(auth, email, password);
        showStatusMessage('Login successful! Redirecting...', 'success');
        // Redirect user or update UI
        setTimeout(() => {
            window.location.href = '/dashboard.html'; // Example redirect
        }, 1500);

    } catch (error) {
        let errorMessage = 'Login failed. Please try again.';
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
            errorMessage = 'Invalid email or password.';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Invalid email format.';
        } else if (error.code === 'auth/user-disabled') {
            errorMessage = 'Your account has been disabled.';
        }
        showStatusMessage(errorMessage);
        console.error("Login Error:", error.message);

    } finally {
        loginButton.textContent = 'Login'; // Restore button text
        loginButton.disabled = false; // Re-enable button
    }
});


// --- Google Login ---
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    googleLoginBtn.textContent = 'Signing in...';
    googleLoginBtn.disabled = true;

    try {
        await signInWithPopup(auth, provider);
        showStatusMessage('Google login successful! Redirecting...', 'success');
        // Redirect user or update UI
        setTimeout(() => {
            window.location.href = '/dashboard.html'; // Example redirect
        }, 1500);

    } catch (error) {
        let errorMessage = 'Google login failed.';
        if (error.code === 'auth/popup-closed-by-user') {
            errorMessage = 'Google login window closed.';
        }
        showStatusMessage(errorMessage);
        console.error("Google Login Error:", error.message);
    } finally {
        googleLoginBtn.textContent = 'Sign in with Google';
        googleLoginBtn.disabled = false;
    }
});

// --- Add this CSS to style1.css for input-error feedback ---
/*
.input-error {
    border-color: #e74c3c !important;
    box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.2) !important;
}
*/