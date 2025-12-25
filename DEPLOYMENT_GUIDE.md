# QuizWhiz Deployment Guide

This guide covers how to deploy the QuizWhiz application to **Vercel** (recommended for Next.js) and **Render**.

## Prerequisites

1.  **GitHub Repository**: Ensure your project is pushed to a GitHub repository.
2.  **Firebase Project**: You need your Firebase configuration keys ready.

## Environment Variables

For both platforms, you will need to configure the following environment variables. These are found in your `.env.local` file.

| Variable Name | Description |
| :--- | :--- |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Your Firebase API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Your Firebase App ID |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | (Optional) Analytics ID |

---

## Option 1: Deploy to Vercel (Recommended)

Vercel is the creators of Next.js, offering the best performance and easiest setup.

1.  **Create Account**: Go to [vercel.com](https://vercel.com) and sign up with GitHub.
2.  **Import Project**:
    *   Click **"Add New..."** -> **"Project"**.
    *   Select your `QuizWhiz` repository.
3.  **Configure Project**:
    *   **Framework Preset**: Next.js (should be auto-detected).
    *   **Root Directory**: `./` (or `QuizWhiz` if it's in a subdirectory).
    *   **Build Command**: `npm run build` (default).
    *   **Output Directory**: `.next` (default).
4.  **Environment Variables**:
    *   Expand the **"Environment Variables"** section.
    *   Copy-paste all the keys and values from your `.env.local` file.
5.  **Deploy**:
    *   Click **"Deploy"**.
    *   Wait for the build to complete.
6.  **Update Firebase Auth**:
    *   Once deployed, you will get a URL (e.g., `https://quizwhiz.vercel.app`).
    *   Go to your **Firebase Console** -> **Authentication** -> **Settings** -> **Authorized Domains**.
    *   Add your new Vercel domain to the list.
    *   **Google Sign-In**: If using Google Auth, go to **Google Cloud Console** -> **APIs & Services** -> **Credentials**. Edit your OAuth 2.0 Client ID and add the Vercel URL to **"Authorized JavaScript origins"** and **"Authorized redirect URIs"**.

---

## Option 2: Deploy to Render

Render is a great alternative for hosting Node.js web services.

1.  **Create Account**: Go to [render.com](https://render.com) and sign up.
2.  **New Web Service**:
    *   Click **"New +"** -> **"Web Service"**.
    *   Connect your GitHub repository.
3.  **Configure Service**:
    *   **Name**: `quizwhiz` (or your choice).
    *   **Region**: Choose one close to you.
    *   **Branch**: `main`.
    *   **Runtime**: **Node** (Important!).
    *   **Build Command**: `npm install && npm run build`.
    *   **Start Command**: `npm start`.
4.  **Environment Variables**:
    *   Scroll down to **"Environment Variables"**.
    *   Add each key-value pair from your `.env.local`.
5.  **Deploy**:
    *   Click **"Create Web Service"**.
    *   Render will start building your app. This might take a few minutes.
6.  **Update Firebase Auth**:
    *   Once live, copy your Render URL (e.g., `https://quizwhiz.onrender.com`).
    *   Add this domain to **Firebase Console** -> **Authentication** -> **Authorized Domains**.
    *   Update **Google Cloud Console** credentials if using Google Sign-In.

---

## Troubleshooting

### "Build Failed"
*   Check the logs. Common issues include TypeScript errors. Run `npm run typecheck` locally to verify.
*   Ensure all dependencies are in `package.json`.

### "Firebase: Error (auth/unauthorized-domain)"
*   This means you forgot to add your new deployment domain to the Firebase Console's **Authorized Domains** list.

### "Hydration Error" or UI Glitches
*   Ensure your `NEXT_PUBLIC_` environment variables are set correctly in the dashboard. If they are missing during build time, some parts of the app might not work.
