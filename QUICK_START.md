# Quick Start Guide 🚀

Get QuizWhiz running locally in under 10 minutes.

## Prerequisites
*   Node.js 18+
*   Git
*   A Google/Firebase Account

## 1. Clone & Install

```bash
git clone https://github.com/ChitkulLakshya/QuizWhiz.git
cd QuizWhiz
npm install
```

## 2. Firebase Setup

1.  Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Authentication**: Enable **Google** provider.
3.  **Firestore**: Create database (Start in **Test Mode** for now).
4.  **Project Settings**:
    *   Go to Project Settings > General.
    *   Click the `</>` icon to create a Web App.
    *   Copy the `firebaseConfig` object keys.

## 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
touch .env.local
```

Paste your Firebase keys:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 5. First Run Checklist

1.  **Login**: Click "Admin Login" and sign in with Google.
2.  **Create Quiz**: Go to Dashboard -> Create Quiz.
3.  **Add Question**: Add at least one question.
4.  **Test Play**: Open an Incognito window, go to `/join`, and enter the code.

> **Note**: If you see "The query requires an index" in the console, click the link provided in the error message to auto-create it in Firebase.
