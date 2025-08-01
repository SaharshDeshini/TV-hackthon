import { auth, db, collection, query, where, orderBy, getDocs, addDoc, serverTimestamp } from './auth.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const historyContainer = document.getElementById('history-container');
const modal = document.getElementById('feedback-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalForm = document.getElementById('modal-feedback-form');

let currentIssueId = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        await fetchUserHistory(user);
    } else {
        window.location.replace('login.html');
    }
});

async function fetchUserHistory(user) {
    try {
        const issuesQuery = query(collection(db, 'issues'), where("userId", "==", user.uid), orderBy("createdAt", "desc"));
        const issuesSnapshot = await getDocs(issuesQuery);

        if (issuesSnapshot.empty) {
            historyContainer.innerHTML = '<p>You have not reported any issues yet.</p>';
            return;
        }

        historyContainer.innerHTML = ''; 
        
        const historyCards = await Promise.all(issuesSnapshot.docs.map(async (doc) => {
            const issue = doc.data();
            issue.id = doc.id;

            let feedbackContent = '';
            if (issue.status.trim() === 'resolved') {
                
                // --- THIS IS THE CORRECTED LINE ---
                // The query now checks for BOTH the issueId AND the userId.
                const feedbackQuery = query(collection(db, 'feedback'), where("issueId", "==", issue.id), where("userId", "==", user.uid));
                const feedbackSnapshot = await getDocs(feedbackQuery);

                if (!feedbackSnapshot.empty) {
                    const feedbackData = feedbackSnapshot.docs[0].data();
                    const stars = '★'.repeat(feedbackData.rating) + '☆'.repeat(5 - feedbackData.rating);
                    feedbackContent = `
                        <h4>Your Feedback:</h4>
                        <p><strong>Rating:</strong> <span style="color: #ffc107;">${stars}</span></p>
                        <p><em>"${feedbackData.comment}"</em></p>
                    `;
                } else {
                    feedbackContent = `<button class="give-feedback-btn" data-issue-id="${issue.id}">Give Feedback</button>`;
                }
            }

            const date = issue.createdAt.toDate().toLocaleDateString("en-IN");
            return `
                <div class="issue-card">
                    <img src="${issue.imageUrl}" alt="Issue Image">
                    <div class="issue-card-details">
                        <h3>${issue.issues.join(', ')}</h3>
                        <p><strong>Status:</strong> ${issue.status}</p>
                        <p class="date"><strong>Reported on:</strong> ${date}</p>
                        <div class="feedback-section">${feedbackContent}</div>
                    </div>
                </div>
            `;
        }));

        historyContainer.innerHTML = historyCards.join('');
        attachFeedbackButtonListeners();

    } catch (error) {
        console.error("Error fetching history:", error);
        historyContainer.innerHTML = '<p>Sorry, we could not load your history. Please check the console for the error.</p>';
    }
}

function attachFeedbackButtonListeners() {
    document.querySelectorAll('.give-feedback-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            currentIssueId = e.target.dataset.issueId;
            modal.style.display = 'block';
        });
    });
}

closeModalBtn.onclick = () => { modal.style.display = "none"; };
window.onclick = (event) => { if (event.target == modal) { modal.style.display = "none"; }};
modalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const statusMessage = document.getElementById('modal-status-message');
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById('modal-feedback-comment').value;
    if (!ratingInput) { statusMessage.textContent = 'Please select a star rating.'; return; }
    try {
        await addDoc(collection(db, "feedback"), {
            userId: auth.currentUser.uid,
            issueId: currentIssueId,
            rating: parseInt(ratingInput.value),
            comment: comment,
            createdAt: serverTimestamp()
        });
        modal.style.display = "none";
        modalForm.reset();
        fetchUserHistory(auth.currentUser);
    } catch (error) {
        console.error("Error submitting feedback: ", error);
        statusMessage.textContent = "An error occurred.";
    }
});