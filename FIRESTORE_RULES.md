# Firestore Security Rules & Indexes Guide

## 1. Security Architecture

ExamFlow implements a strict, user-isolated security model in Firestore:
- Every piece of personal exam preparation data (study plan completions, topic progress, spaced repetition recalls, focus timer sessions, markdown notes, and user preferences) is nested under `/users/{userId}/...`.
- Only an authenticated user whose Firebase Auth UID matches `{userId}` can read or write their own documents.
- All other collections or root documents are denied by default (`allow read, write: if false;`).

### Rules Source (`firestore.rules`)
```cel
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    // Deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 2. Firestore Indexes (`firestore.indexes.json`)

To enable fast queries across task completions and spaced repetition recall schedules, composite indexes are configured:

1. **`taskCompletions`**:
   - `date` (ASCENDING) + `updatedAt` (DESCENDING)
   - Used for fetching daily completions and sorting recent updates.
2. **`recalls`**:
   - `scheduledDate` (ASCENDING) + `status` (ASCENDING)
   - Used for querying due spaced repetition tasks.

---

## 3. How to Deploy Rules & Indexes

### Prerequisites
Install the Firebase CLI if not already installed:
```bash
npm install -g firebase-tools
```

Authenticate with your Google account:
```bash
firebase login
```

Associate the project directory with your Firebase project:
```bash
firebase use --add <your-project-id>
```

### Deploying Rules Only
To deploy only the security rules without affecting hosting or other services:
```bash
firebase deploy --only firestore:rules
```

### Deploying Indexes Only
```bash
firebase deploy --only firestore:indexes
```

### Deploying Both Rules & Indexes
```bash
firebase deploy --only firestore
```

---

## 4. Testing Locally with Firebase Emulator

You can test security rules locally without deploying to production:

```bash
# Start Firestore emulator
firebase emulators:start --only firestore

# Or test with the emulator UI at http://localhost:4000
```
In your app's `.env.local`, you can point the app to the emulator if desired:
```env
VITE_USE_FIREBASE_EMULATOR=true
```
