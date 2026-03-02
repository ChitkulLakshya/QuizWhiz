# QuizWhiz - Pre-Deployment Bug Documentation

This document summarizes the current status of the 8 pre-deployment bugs identified during the testing phase.

## Status Summary
- ✅ **Fixed (3)**
- 🕵️ **Confirmed & Pending Fix (4)**
- ⚠️ **External Dependency / Won't Fix Directly (1)**

---

### 1. Login Page – Text Visibility Issue
* **Status**: ✅ **FIXED** (Resolved in previous tasks)
* **Description**: Text was faded and lacked proper contrast.
* **Fix Applied**: Adjusted the text colors, placeholders, and footer text in `src/app/login/page.tsx` to improve visibility against the dark background.

### 2. Footer Links Not Working (Home Page)
* **Status**: 🕵️ **CONFIRMED**
* **Description**: "Privacy", "Contact", and "Terms" links do not trigger navigation.
* **Root Cause Found**: In `src/app/page.tsx`, the footer links are hardcoded to `href="#"` and no routes currently exist for these pages.
* **Impact**: Medium

### 3. Play Page – Unable to Change Answer Within Timer
* **Status**: 🕵️ **CONFIRMED**
* **Description**: Users cannot change their answer before the timer expires.
* **Root Cause Found**: In `src/components/game/state-views/question-view.tsx`, the answer buttons are instantly disabled the moment an answer is selected using `disabled={isAnswerSubmitted}`.
* **Impact**: High

### 4. Host/Create Page – Quiz Generation Failure
* **Status**: 🕵️ **CONFIRMED**
* **Description**: System fails to generate a quiz after inputs are provided.
* **Root Cause Found**: In `src/app/host/create/quiz-form.tsx`, the `createQuiz` function is passing hardcoded fallback string values (`'anonymous'`, `'anonymous-user'`) instead of the actual `auth.currentUser.uid`. This likely causes Firestore security rules to reject the write or causes failures in associating the quiz with the actual host.
* **Impact**: Critical

### 5. Manual Question Addition – Signal/Error Issue
* **Status**: 🕵️ **CONFIRMED** (needs deeper debugging during fix phase)
* **Description**: System throws a "signal-related error" when manually adding questions.
* **Root Cause Found**: The exact form setup in `quiz-form.tsx` uses `react-hook-form` `useFieldArray`. The UI includes multiple buttons with mixed types, which may be triggering unexpected form `onSubmit` events prematurely, leading to `AbortSignal` timeouts or disrupted API calls.
* **Impact**: High

### 6. Settings Page – Edit Button Not Working
* **Status**: 🕵️ **CONFIRMED**
* **Description**: The "Edit" button for the user profile triggers no action.
* **Root Cause Found**: In `src/app/settings/page.tsx`, the `<Button>` component for "Edit" is purely presentational and lacks an `onClick` handler pointing to an edit modal or form route.
* **Impact**: Medium

### 7. Admin Page – Results Section Not Working
* **Status**: ✅ **FIXED** (Resolved in previous tasks)
* **Description**: Results section failed to load data.
* **Fix Applied**: Fixed the `getLeaderboard` function in `src/lib/firebase-service.ts` to prevent crashing when `p.answers` was missing. Verified it correctly fetches `totalQuestions` to render the leaderboard accuracy table correctly.

### 8. Anime and Manga Category – Inaccurate Questions
* **Status**: ⚠️ **PARTIALLY FIXED / EXTERNAL**
* **Description**: Questions were not loading for "Anime & Manga" initially, and some contain incorrect options.
* **Fix Applied**: The routing mapping bug was fixed so the correct OpenTDB Category ID (`31`) is now used.
* **Note on Accuracy**: The actual quiz content comes raw from the external Open Trivia Database (OpenTDB) API. Inaccuracies within the questions/answers are dependent on this external dataset.
* **Impact**: High (but external)

---

## Recommended Next Steps
Prioritize fixing **Issue 4 (Host/Create generation)** and **Issue 3 (Play Page answer switching)** as they directly impact the core application loop.
