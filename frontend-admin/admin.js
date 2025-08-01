import { auth, db, signOut, collection, getDocs, query, where } from '../frontend-user/auth.js';

const adminLogoutBtn = document.getElementById('admin-logout-btn');

// This function will run as soon as the page is ready
document.addEventListener('DOMContentLoaded', () => {
    // NEW: Check if the current page is admin.html before running the stats function
    if (window.location.pathname.endsWith('admin.html')) {
        populateDashboardStats();
    }
});

// This function fetches data from Firebase and updates the dashboard cards
async function populateDashboardStats() {
    try {
        const totalWorkersEl = document.getElementById('total-workers-stat');
        const activeIssuesEl = document.getElementById('active-issues-stat');
        const completedIssuesEl = document.getElementById('completed-issues-stat');
        const avgRatingEl = document.getElementById('avg-rating-stat');

        // 1. Fetch Workers
        const workersQuery = query(collection(db, "users"), where("role", "==", "worker"));
        const workersSnapshot = await getDocs(workersQuery);
        totalWorkersEl.textContent = workersSnapshot.size;

        // 2. Fetch Issues
        const allIssuesQuery = query(collection(db, "issues"));
        const allIssuesSnapshot = await getDocs(allIssuesQuery);
        
        let activeCount = 0;
        let completedCount = 0;
        allIssuesSnapshot.forEach(doc => {
            if (doc.data().status === 'resolved') {
                completedCount++;
            } else {
                activeCount++;
            }
        });
        activeIssuesEl.textContent = activeCount;
        completedIssuesEl.textContent = completedCount;

        // 3. Fetch Feedback to calculate average rating
        const feedbackQuery = query(collection(db, "feedback"));
        const feedbackSnapshot = await getDocs(feedbackQuery);
        
        if (feedbackSnapshot.size > 0) {
            let totalRating = 0;
            feedbackSnapshot.forEach(doc => {
                totalRating += doc.data().rating;
            });
            const avgRating = (totalRating / feedbackSnapshot.size).toFixed(1);
            avgRatingEl.textContent = avgRating;
        } else {
            avgRatingEl.textContent = "N/A";
        }

    } catch (error) {
        console.error("Error populating dashboard stats:", error);
    }
}

// --- Logout Logic (This will run on all admin pages) ---
if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    });
}