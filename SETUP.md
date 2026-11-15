# ExamFlow Setup Guide ⚙️

This document outlines step-by-step instructions for configuring, running, and deploying ExamFlow from scratch.

---

## 1. Prerequisites

Ensure your development environment meets the following specifications:
- **Node.js**: `v20.x` or higher (check with `node -v`)
- **Package Manager**: `pnpm` `v9.x` or higher (`npm` `v10.x` works as a fallback)
- **Firebase CLI**: `firebase-tools` `v13.x` or higher (`npm install -g firebase-tools`)
- **Git**: For source version control

---

## 2. Clone and Installation

```bash
# Clone the repository
git clone <repository-url> examflow
cd examflow

# Install project dependencies
pnpm install
```

---

## 3. Environment Variables

Create a `.env` file in the root of `examflow` based on `.env.example`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

> **Demo Mode Notice**: If `VITE_FIREBASE_API_KEY` is omitted or left as `demo-key`, ExamFlow automatically activates **Demo Mode**. You can freely explore the app, log sessions, and track progress using local storage without connecting to Firebase.

---

## 4. Firebase Project Creation Steps

1. **Create Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/) and click **Add project**.
   - Name your project (e.g. `examflow-tracker`). Disable Google Analytics if not needed.

2. **Configure Authentication**:
   - Under **Build → Authentication**, click **Get started**.
   - Enable **Email/Password** under the Sign-in method tab.
   - (Optional) Enable **Google** sign-in and configure the project support email.

3. **Configure Firestore Database**:
   - Under **Build → Firestore Database**, click **Create database**.
   - Choose a server location closest to your target audience (e.g. `asia-south1`).
   - Start in **Production mode** (rules will be deployed in the next step).

4. **Deploy Firestore Rules**:
   - Run the following command from the project root:
     ```bash
     firebase deploy --only firestore:rules
     ```
   - For complete details on security rules, see [docs/FIRESTORE_RULES.md](file:///d:/Colleague/examflow/docs/FIRESTORE_RULES.md).

5. **Register Web App**:
   - In Project Overview, click the **Web icon (</>)** to add a web application.
   - Copy the configuration object values into your local `.env` file.

---

## 5. Running Locally

Start the local Vite development server:
```bash
pnpm dev
```
Open your browser to [http://localhost:5173](http://localhost:5173).

---

## 6. Running Tests

- **Run all Vitest unit tests in single run mode:**
  ```bash
  pnpm test --run
  ```
- **Run tests in interactive watch mode:**
  ```bash
  pnpm test
  ```
- **Run Playwright End-to-End tests:**
  ```bash
  # Ensure dev server is running or let Playwright spawn it
  pnpm test:e2e
  ```

---

## 7. Building for Production

Compile TypeScript and build the optimized production PWA:
```bash
pnpm build
```
Verify the build output in the local preview server:
```bash
pnpm preview
```
The output directory is `dist/`, ready for continuous deployment or Firebase Hosting.
