# ExamFlow 📚

> **ExamFlow** is an intelligent university exam preparation Progressive Web App (PWA) tailored for intensive revision periods. It guides students through a structured 24-day countdown covering 6 university subjects, balancing full study days, light recovery days, and focused morning exam routines. With integrated active recall scheduling, an offline-first timestamp timer, and granular readiness tracking, ExamFlow keeps students accountable all the way through their final examinations.

---

## 🚀 Tech Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `^18.3.1` | Reactive UI framework |
| **TypeScript** | `^5.4.5` | Strict static typing |
| **Vite** | `^5.2.13` | Next-generation frontend tooling & build pipeline |
| **Tailwind CSS** | `^3.4.4` | Mobile-first utility styling & dark mode |
| **Zustand** | `^4.5.2` | Lightweight state management |
| **Firebase** | `^10.12.2` | Authentication & Firestore cloud synchronization |
| **Recharts** | `^2.12.7` | Interactive study analytics visualizations |
| **Vite PWA / Workbox** | `^0.20.0` | Offline service worker and PWA manifest |
| **Vitest & RTL** | `^1.6.0` | High-speed unit and component testing |
| **Playwright** | `^1.44.1` | End-to-end browser integration testing |

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js**: `v20.x` or higher
- **pnpm**: `v9.x` or `npm` `v10.x`

### 2. Installation
```bash
git clone <repository-url> examflow
cd examflow
pnpm install
```

### 3. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Populate the values from your Firebase Console. If running locally in demo mode without Firebase, ExamFlow will automatically detect the demo credentials and function locally using browser storage.

---

## 💻 Development Server

To launch the local development server with Hot Module Replacement (HMR):
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Production Build

To build the optimized static bundle and PWA service worker:
```bash
pnpm build
```
To preview the production build locally:
```bash
pnpm preview
```

---

## 🧪 Testing

ExamFlow includes a comprehensive suite of unit tests, component tests, and E2E journeys.

- **Run all unit & integration tests:**
  ```bash
  pnpm test
  ```
- **Run tests in interactive UI mode:**
  ```bash
  pnpm test:ui
  ```
- **Run E2E Playwright tests:**
  ```bash
  pnpm test:e2e
  ```
See [TESTING.md](file:///d:/Colleague/examflow/TESTING.md) for full test details and manual verification checklists.

---

## 🔐 Firebase Configuration

ExamFlow uses Firebase Auth (Email/Password & Google) and Cloud Firestore:
1. Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
2. Enable **Authentication** (Email/Password and Google sign-in).
3. Create a **Firestore Database** in production mode.
4. Deploy the security rules from `firestore.rules`:
   ```bash
   firebase deploy --only firestore:rules
   ```
   For detailed explanation of rules and data partitioning, consult [docs/FIRESTORE_RULES.md](file:///d:/Colleague/examflow/docs/FIRESTORE_RULES.md).

---

## 📱 Progressive Web App (PWA) Installation

ExamFlow is designed mobile-first and installs as a native application:
- **Chrome / Android**: Tap the "Add to Home Screen" prompt or select "Install ExamFlow" from the browser menu.
- **Safari / iOS**: Tap the Share button in Safari, then tap "Add to Home Screen".
- **Desktop (Chrome/Edge)**: Click the Install icon in the browser address bar.

---

## 🌐 Offline Behavior

ExamFlow is built **offline-first**:
- All core application assets (HTML, CSS, JS, icons) are pre-cached by Workbox.
- Study plan definitions, subject data, and milestones are statically loaded.
- Timer sessions, completed tasks, and notes are immediately written to local storage and IndexedDB.
- When an internet connection is re-established, local changes seamlessly synchronize with Firebase Firestore.

---

## 💾 Backup and Restore

Students retain full sovereignty over their progress data:
- **Export Progress**: Navigate to **Settings → Backup & Restore** and click **Export Backup (JSON)**. A full export of topic statuses, study sessions, notes, and completions will be downloaded.
- **Import Progress**: Select a previously saved JSON backup file. The importer verifies schema validity using Zod and performs conflict-free deduplication.

---

## 🚀 Deployment to Firebase Hosting

ExamFlow can be deployed to Firebase Hosting in minutes:
```bash
# 1. Login to Firebase CLI
firebase login

# 2. Initialize project (if not already initialized)
firebase init hosting

# 3. Build the production application
pnpm build

# 4. Deploy to Firebase Hosting
firebase deploy --only hosting
```
