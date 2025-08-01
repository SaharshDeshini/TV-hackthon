// Import the functions and services we need from our main auth.js file
import { auth, db, storage, ref, uploadBytes, getDownloadURL, addDoc, collection, serverTimestamp } from './auth.js';

// --- Get elements from the HTML page ---
const profileBtn = document.getElementById('profile-btn');
const dropdownContent = document.getElementById('dropdown-content');
const chatbotBtn = document.getElementById('chatbot-btn');
const issueForm = document.getElementById('issue-form');
const statusMessage = document.getElementById('status-message');
const fileInput = document.getElementById('image-upload');
const fileNameSpan = document.getElementById('file-name');

// --- Profile Dropdown Logic ---
if(profileBtn) {
    profileBtn.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });
}
window.addEventListener('click', function(event) {
    if (dropdownContent && !event.target.matches('.profile-btn')) {
        if (dropdownContent.classList.contains('show')) {
            dropdownContent.classList.remove('show');
        }
    }
});

// --- Chatbot Button Logic ---
if(chatbotBtn) {
    chatbotBtn.addEventListener('click', function() {
        alert('Chatbot feature coming soon!');
    });
}

// --- Custom File Input Logic ---
if(fileInput) {
    fileInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileNameSpan.textContent = this.files[0].name;
        } else {
            fileNameSpan.textContent = 'No file chosen';
        }
    });
}
      
// --- Form Submission Logic ---
if(issueForm) {
    issueForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        // 1. Get the current user
        const user = auth.currentUser; 
        if (!user) {
            statusMessage.textContent = 'You must be logged in to submit an issue.';
            statusMessage.style.color = '#dc3545';
            return;
        }

        // 2. Get form data (using the new file input ID)
        const imageFile = fileInput.files[0];
        const checkedIssues = Array.from(document.querySelectorAll('input[name="issue"]:checked')).map(cb => cb.value);

        if (!imageFile || checkedIssues.length === 0) {
            statusMessage.textContent = 'Please upload an image and select at least one issue.';
            statusMessage.style.color = '#dc3545';
            return;
        }

        statusMessage.style.color = '#00aaff';
        statusMessage.textContent = 'Submitting your report... please wait.';

        try {
            // 3. Upload image to Firebase Storage
            const imagePath = `issues/${user.uid}/${Date.now()}-${imageFile.name}`;
            const storageRef = ref(storage, imagePath);
            await uploadBytes(storageRef, imageFile);
            const imageUrl = await getDownloadURL(storageRef);

            // 4. Save issue data to Firestore
            const issuesCollectionRef = collection(db, "issues");
            await addDoc(issuesCollectionRef, {
                userId: user.uid,
                userEmail: user.email,
                issues: checkedIssues,
                imageUrl: imageUrl,
                status: 'submitted',
                createdAt: serverTimestamp()
            });

            // 5. Show success message and reset the form
            statusMessage.style.color = '#28a745';
            statusMessage.textContent = 'Issue reported successfully! Thank you.';
            issueForm.reset();
            fileNameSpan.textContent = 'No file chosen'; // Reset the file name text

        } catch (error) {
            console.error("Error submitting issue: ", error);
            statusMessage.style.color = '#dc3545';
            statusMessage.textContent = 'An error occurred. Please try again.';
        } finally {
            setTimeout(() => {
                statusMessage.textContent = '';
            }, 5000);
        }
    });
}