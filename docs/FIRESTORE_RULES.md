# Firestore Security Rules Documentation

ExamFlow uses Firebase Firestore for user-scoped cloud synchronization.
The app enforces strict per-user document isolation.

## Security Model Overview

- **User Data Isolation**: All application data is partitioned under `/users/{userId}/...`.
- **Authentication Requirement**: Every read and write request must be authenticated (`request.auth != null`).
- **Authorization Rule**: The requesting user's `uid` must match the document path's `{userId}` (`request.auth.uid == userId`).
- **Default Deny**: Any top-level or unmatched document path is explicitly denied (`allow read, write: if false;`).

## `firestore.rules` Definition

```javascript
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

## Subcollections Protected Under `/users/{userId}`

The `{document=**}` wildcard recursively protects all subcollections owned by the student:

1. `/users/{userId}/taskCompletions/{blockId}`:
   - Stores completion records (`status`, `actualMinutes`, `skipReason`).
2. `/users/{userId}/topicProgress/{topicProgressId}`:
   - Stores topic mastery statuses (`confidenceScore`, `status`, `weakAreas`).
3. `/users/{userId}/recalls/{recallTaskId}`:
   - Spaced repetition recall tasks and flashcard evaluations.
4. `/users/{userId}/studySessions/{sessionId}`:
   - Historical timer sessions logged for analytics.
5. `/users/{userId}/notes/{noteId}`:
   - Student notes, formula sheets, and code snippets.
6. `/users/{userId}/settings/{settingDoc}`:
   - User preferences, theme, notification settings, and daily goals.

## Testing & Deployment

Deploy the rules to Firebase:
```bash
firebase deploy --only firestore:rules
```

Verify with the Firebase Emulator Suite:
```bash
firebase emulators:start --only firestore
```
