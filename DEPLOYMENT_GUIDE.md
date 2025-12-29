# Deployment Guide

This guide details the steps to deploy QuizWhiz to production. It assumes a standard stack of **Vercel** for the frontend and **Firebase** for the backend.

## 1. Prerequisites & Accounts

Before starting, ensure you have administrative access to:

*   **GitHub**: The repository must be pushed to a remote repo.
*   **Firebase Console**: You need a project with Firestore and Authentication enabled.
*   **Vercel Account**: For hosting the Next.js frontend.
*   **Google Cloud Console**: (Automatically linked to Firebase) for managing OAuth credentials.

## 2. Environment Variables

You must configure these variables in your deployment platform (Vercel). Do **not** commit `.env.local` to GitHub.

| Variable | Description | Source |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API Key | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Auth Domain | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Project ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Storage Bucket | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | Firebase Console > Project Settings |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | App ID | Firebase Console > Project Settings |
| `GOOGLE_GENAI_API_KEY` | Gemini API Key | Google AI Studio |

## 3. Backend Deployment (Firebase)

### A. Firestore Database
1.  Go to **Firebase Console** > **Firestore Database**.
2.  Click **Create Database** (if not created). Select a region close to your users.
3.  **Indexes**: The app requires composite indexes for querying.
    *   Deploy `firestore.indexes.json` using the Firebase CLI:
        ```bash
        firebase deploy --only firestore:indexes
        ```
    *   *Alternatively*: Run the app locally, trigger a query (e.g., view leaderboard), and click the link in the console error to create the index automatically.

### B. Security Rules
1.  Go to **Firebase Console** > **Firestore Database** > **Rules**.
2.  Copy the content of `firestore.rules` from this repository.
3.  Paste it into the editor and click **Publish**.
    *   *CLI Method*: `firebase deploy --only firestore:rules`

### C. Authentication
1.  Go to **Firebase Console** > **Authentication** > **Sign-in method**.
2.  Enable **Google**.
3.  **IMPORTANT**: Add your production domain (e.g., `quizwhiz.vercel.app`) to **Authorized Domains** under the **Settings** tab in Authentication.

## 4. Frontend Deployment (Vercel)

1.  **Import Project**:
    *   Log in to Vercel and click **Add New > Project**.
    *   Select your GitHub repository.

2.  **Configure Build**:
    *   **Framework Preset**: Next.js
    *   **Root Directory**: `./`
    *   **Build Command**: `npm run build`
    *   **Output Directory**: `.next`

3.  **Add Environment Variables**:
    *   Copy all values from your local `.env.local` into the Vercel Environment Variables panel.

4.  **Deploy**:
    *   Click **Deploy**. Vercel will build the app and assign a domain.

## 5. Post-Deployment Configuration

### Google OAuth Redirect URI
After Vercel assigns a domain (e.g., `https://quizwhiz.vercel.app`):

1.  Go to **Google Cloud Console** > **APIs & Services** > **Credentials**.
2.  Find the **OAuth 2.0 Client ID** auto-created by Firebase.
3.  Add your Vercel URL to:
    *   **Authorized JavaScript origins**: `https://quizwhiz.vercel.app`
    *   **Authorized redirect URIs**: `https://quizwhiz.vercel.app/__/auth/handler`

## 6. Common Pitfalls & Troubleshooting

### "Missing or insufficient permissions"
*   **Cause**: Firestore rules are blocking the request.
*   **Fix**: Check `firestore.rules`. Ensure the user is authenticated for writes. For the demo, ensure rules aren't too restrictive if you haven't implemented full role checks yet.

### "Auth/unauthorized-domain"
*   **Cause**: The Vercel domain is not whitelisted in Firebase.
*   **Fix**: Add the domain to **Firebase Console > Authentication > Settings > Authorized Domains**.

### "Suspense" / Build Errors
*   **Cause**: Using `useSearchParams` without a Suspense boundary in Next.js App Router.
*   **Fix**: Ensure pages using search params are wrapped in `<Suspense>`. (Already fixed in `src/app/join/page.tsx`).

### Real-time listeners not updating
*   **Cause**: Client connectivity issues or missing indexes.
*   **Fix**: Check the browser console. If it says "index needed", click the link provided to generate it.
