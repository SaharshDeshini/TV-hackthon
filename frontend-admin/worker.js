// worker.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// STEP 1: Your Firebase Config (fill in from your console)
const firebaseConfig = {
  apiKey: "AIzaSyDa23nbzWusBuW2_uPzMErdbb158GXoBBl",
  authDomain: "maintenance-ai-8613c.firebaseapp.com",
  projectId: "maintenance-ai-8613c",
  storageBucket: "maintenance-ai-8613c.appspot.com",
  messagingSenderId: "1019313438020",
  appId: "1:1019313438020:web:0190ace62338e88e0eab11",
  measurementId: "G-ZWQH8E1KVW"
};

// STEP 2: Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// STEP 3: Fetch and display workers on page load
document.addEventListener('DOMContentLoaded', fetchAndDisplayWorkers);

async function fetchAndDisplayWorkers() {
  const tableBody = document.getElementById('workers-table-body');
  if (!tableBody) return;
  tableBody.innerHTML = '';  // clear any existing content

  try {
    // Query 'workers' collection, ordered by joinDate descending
    const q = query(
      collection(db, 'workers'),
      orderBy('joinDate', 'desc')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align:center;">No workers found</td>
        </tr>`;
      return;
    }

    snapshot.forEach(doc => {
      const w = doc.data();
      const joinDate = w.joinDate
        ? new Date(w.joinDate.seconds * 1000).toLocaleDateString()
        : '–';
      const statusBadge = w.status === 'Active'
        ? `<span style="color:green;font-weight:bold;">Active</span>`
        : `<span style="color:gray;">Inactive</span>`;

      tableBody.innerHTML += `
        <tr>
          <td>${w.name || '–'}</td>
          <td>${w.email || '–'}</td>
          <td>${w.department || '–'}</td>
          <td>${statusBadge}</td>
          <td>${joinDate}</td>
        </tr>`;
    });

  } catch (err) {
    console.error('Error loading workers:', err);
    tableBody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center;color:red;">
          Error loading workers
        </td>
      </tr>`;
  }
}
