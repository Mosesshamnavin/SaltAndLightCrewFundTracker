# 🪙 Salt & Light Fund Tracker

A simple, transparent, and cloud-based financial ledger and fund tracker built for church youth groups, ministries, and community crews to track income and expenses in Indian Currency (**INR ₹**).

---

## 🌟 Features

- **📊 Interactive Dashboard**: Real-time summary cards for Total Income, Expenses, and Current Balance with dynamic monthly trend charts.
- **💳 Transaction Management**: Add, edit, filter, and track youth transactions across categorized income (Offerings, Donations, Alumni Support, Sales) and expenses (Activities, Equipment, Utilities, Printing).
- **🔒 Role-Based Access Control (RBAC)**:
  - **Admin**: Full control to record, modify, or delete transactions and manage organization settings.
  - **Member / User**: Read-only transparency view to foster trust and accountability.
- **📜 Audit Trail**: Immutable logging of transaction creation, edits, and deletions with user attribution.
- **📑 Reports & Export**:
  - Export professional PDF financial statements using jsPDF and AutoTable.
  - Export data to CSV/Excel formats for audits and review meetings.
- **📱 Responsive & Polished UI**: Built with Next.js 14, Tailwind CSS, Radix UI primitives, Lucide icons, and Framer Motion micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database & Auth**: [Firebase](https://firebase.google.com/) (Cloud Firestore & Firebase Authentication)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Icons & Alerts**: [Lucide React](https://lucide.dev/) & [Sonner](https://sonner.emilkowal.ski/)

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have installed:
- [Node.js](https://nodejs.org/) (version 18.17 or later)
- `npm`, `pnpm`, or `yarn`

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Mosesshamnavin/SaltAndLightCrewFundTracker.git
cd SaltAndLightCrewFundTracker
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your Firebase credentials:

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your Firebase project values:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

NEXT_PUBLIC_CHURCH_NAME=Salt And Light Crew
NEXT_PUBLIC_DEFAULT_CURRENCY=INR
NEXT_PUBLIC_DEFAULT_CURRENCY_SYMBOL=₹
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the development server at `localhost:3000` |
| `npm run build` | Builds the optimized production application |
| `npm run start` | Runs the compiled production build |
| `npm run lint` | Runs ESLint checks across the codebase |

---

## 📂 Project Structure

```text
├── public/                # Static assets (logos, background images)
├── src/
│   ├── app/               # Next.js App Router pages & layouts
│   │   ├── login/         # User login page
│   │   ├── reports/       # Report generation & exports
│   │   ├── settings/      # App & organization settings
│   │   ├── transactions/  # Ledger & transaction history
│   │   ├── layout.tsx     # Root layout & context providers
│   │   └── page.tsx       # Main dashboard
│   ├── components/        # Reusable UI & feature components
│   │   ├── layout/        # Header, Splash screen, Layout wrappers
│   │   ├── transactions/  # Modal forms & confirmation dialogs
│   │   └── ui/            # UI components (buttons, dropdowns, cards)
│   ├── context/           # React Contexts (Auth, Transactions)
│   ├── lib/               # Firebase config, export utilities, formatters
│   └── types/             # TypeScript interfaces & types
├── firestore.rules        # Firebase Firestore security rules
└── package.json           # Project metadata & dependencies
```

---

## 🔒 Security & Firestore Rules

Security rules are maintained in [`firestore.rules`](firestore.rules).
- Authenticated members can read financial data and transactions.
- Only users with the `admin` role can create, edit, or delete transactions and configure settings.
- Audit logs are append-only by admins and cannot be overwritten or removed.

---

## 📄 License

This project is maintained for the Salt & Light Crew ministry. Feel free to customize and adapt it for your own church or non-profit community!
