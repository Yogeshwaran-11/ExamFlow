# Firebase Project Setup Guide for ExamFlow

This document provides a step-by-step walkthrough for configuring Firebase Authentication and Cloud Firestore for the **ExamFlow** progressive web application.

---

## 1. Create a Firebase Project

1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or **Create a project**).
3. Enter a project name (e.g., `examflow-tracker`).
4. (Optional) Choose whether to enable Google Analytics. Click **Create project**.

---

## 2. Register Your Web App

1. On the Project Overview page, click the **Web icon (`</>`)** to add an app.
2. Enter an App nickname (e.g., `ExamFlow PWA`).
3. Check the box **"Also set up Firebase Hosting for this app"** (recommended for production deployment).
4. Click **Register app**.
5. Copy the configuration credentials shown in the `firebaseConfig` object.

---

## 3. Set Up Environment Variables

Create a `.env.local` file in the root of the `examflow` project (`d:\Colleague\examflow\.env.local`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=examflow-tracker.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=examflow-tracker
VITE_FIREBASE_STORAGE_BUCKET=examflow-tracker.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> **Note on Demo Mode**:
> If `VITE_FIREBASE_API_KEY` is not set or is left as `demo-key`, ExamFlow automatically runs in **Demo Mode**.
> In Demo Mode:
> - Authentication uses a local mock session without contacting Firebase servers.
> - Data is persisted seamlessly in browser `localStorage` and `IndexedDB`.
> - The app is fully functional offline.

---

## 4. Enable Firebase Authentication

1. In the Firebase Console left sidebar, click **Build** > **Authentication**.
2. Click **Get started**.
3. Under the **Sign-in method** tab:
   - **Email/Password**:
     - Click **Email/Password**, toggle **Enable**, and save.
   - **Google**:
     - Click **Google**, toggle **Enable**, select the project support email, and save.
4. Under the **Settings** tab > **Authorized domains**, make sure `localhost` and your production domain (e.g., `examflow-tracker.web.app`) are listed.

---

## 5. Enable Cloud Firestore

1. In the left sidebar, click **Build** > **Firestore Database**.
2. Click **Create database**.
3. Choose a Firestore location close to your users (e.g., `asia-south1` for India / Asia or `us-central1`).
4. Select **Start in production mode** (our `firestore.rules` will enforce security).
5. Click **Create**.

---

## 6. Deploy Security Rules and Indexes

From your local machine in the `examflow` directory:

```bash
# Log in to your Firebase account
firebase login

# Link your project
firebase use --add

# Deploy rules and indexes
firebase deploy --only firestore
```

The deployed rules guarantee that:
- Every authenticated user has isolated read/write permissions to `/users/{userId}/...`.
- No user can access or tamper with another student's exam preparation progress.
- Unauthenticated requests are blocked.

---

## 7. Offline Support & Sync Behavior

ExamFlow is built as an offline-first PWA:
- **IndexedDB Persistence**: Automatically enabled via `enableIndexedDbPersistence` in `src/lib/firebase/config.ts`.
- **Zustand Offline Store**: All mutations (block completions, topic mastery, focus sessions, notes) are immediately saved to local storage.
- **Auto-Sync Hook (`useFirestoreSync`)**:
  - Listens to browser online/offline events.
  - Automatically batches and syncs pending changes (`syncPending()`) when network connectivity is restored.
  - Listens to real-time updates via Firestore `onSnapshot`.
