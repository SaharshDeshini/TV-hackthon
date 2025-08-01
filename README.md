🚀 Project Overview
A smart community maintenance system that uses AI to classify damage reports and automatically assigns the nearest available workers based on the type and urgency of the issue.

The platform consists of three interfaces:

User Website: Submit issues with images and track progress

Admin Dashboard: Manage workers and monitor community requests

Worker App: Receive and respond to job notifications in real-time

🧩 Key Features
👤 User Website (HTML + Bootstrap)
User Authentication via Firebase

Image upload with preview

Select or enter issue keyword

Auto-detect geolocation via browser

Submit issue to backend for AI classification

View submitted issues and their status

Give feedback after resolution

🧑‍💼 Admin Dashboard (HTML + Bootstrap)
Admin login (Firebase)

View all user-submitted issues

Register/remove up to 5 workers per category (e.g., plumber, electrician)

See assignment progress, completions, and feedback

Monitor worker performance

👷 Worker Mobile App (React Native + Firebase)
Worker login and session handling

Get notified of new issues in their category

Accept or reject jobs (reassigns automatically)

Alerts with sound for critical tasks (like water or electrical leakage)

🧠 AI Integration
Google Cloud Vision API for damage recognition from images

Google Vertex AI for issue category classification

Auto-assignment logic:

Based on category & geolocation

Notifies the nearest 2 workers

Reassigns on timeout or rejection

Priority-based escalation system

📦 Tech Stack
Component	Technology
Frontend (User)	HTML, CSS, Bootstrap 5
Frontend (Admin)	HTML, CSS, Bootstrap 5
Mobile App	React Native (Expo)
Backend	Node.js + Express
Database	MongoDB Atlas
Auth	Firebase Authentication
Image Storage	Firebase Storage / Cloudinary
Notifications	Firebase Cloud Messaging (FCM)
AI Models	Google Vision API, Google Vertex AI
Deployment	GitHub Pages, Render, Railway
