# DigitalWallet — Frontend

A production-ready digital wallet application built with **React 19 + TypeScript 5 + Vite + Tailwind CSS**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 5 |
| Build Tool | Vite 6 |
| Styling | Tailwind CSS |
| State Management | Redux Toolkit (3 slices: auth, notifications, theme) |
| API Client | Axios with interceptors |
| Forms | react-hook-form + zod |
| Payment | Razorpay |
| Routing | React Router v6 |

---

## Project Structure

```
src/
├── core/
│   └── api/
│       ├── client.ts        # Axios instance + request/response interceptors
│       ├── services.ts      # All API endpoint functions grouped by domain
│       └── types.ts         # Typed ApiError interface + shared error utilities
├── store/
│   ├── slices/
│   │   ├── authSlice.ts         # Login / logout / session state
│   │   ├── notificationSlice.ts # In-app notifications
│   │   └── themeSlice.ts        # Light / dark theme
│   ├── store.ts             # Redux configureStore
│   ├── hooks.ts             # useAppDispatch, useAppSelector, useDebounce, usePrevious
│   ├── AuthContext.tsx       # Shim — useAuth() reads Redux authSlice
│   ├── NotificationContext.tsx  # Shim — useNotifications() reads Redux slice
│   └── ThemeContext.tsx     # Shim — useTheme() reads Redux slice
├── shared/
│   └── components/
│       ├── UI.tsx           # Modal, StatCard, StatusBadge, Spinner, ErrorBoundary, EmptyState
│       ├── Toast.tsx        # Global toast notifications
│       └── NoWalletBanner.tsx  # KYC / wallet missing guidance banner
├── layouts/
│   └── AppLayout.tsx        # Sidebar navigation, topbar, notification dropdown
├── features/
│   ├── auth/        # LoginPage, SignupPage, ForgotPasswordPage
│   ├── dashboard/   # DashboardPage — balance, recent transactions, stats
│   ├── wallet/      # WalletPage (ledger, add money, withdraw), TransferPage
│   ├── transactions/ # TransactionsPage — full history with filters
│   ├── rewards/     # RewardsPage — tier, catalog, redemption
│   ├── profile/     # ProfilePage — edit profile, KYC submission
│   ├── admin/       # AdminPage — users, KYC queue, catalog management
│   └── landing/     # LandingPage — public marketing page
└── App.tsx          # Route definitions with lazy loading + code splitting
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
# Clone and install
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_RAZORPAY_KEY=rzp_test_xxxxxxxxxxxxxxxx
```

> **Never commit `.env` to version control.** The `.gitignore` already excludes it.

---

## Architecture Decisions

### State Management — Redux Toolkit
Global state is managed via Redux Toolkit with three slices. Context API shims (`useAuth`, `useNotifications`, `useTheme`) wrap Redux so that no component was changed during the migration.

### Code Splitting — React.lazy + Suspense
All route-level page components are lazy-loaded. Each page is a separate bundle chunk, reducing initial load size significantly.

### API Layer
All endpoint functions live in `src/core/api/services.ts`. The Axios instance in `client.ts` handles:
- Attaching `Authorization: Bearer <token>` to every request
- Automatic token refresh on 401 responses (queued retry pattern)
- Global error interception

### Typed Errors
`src/core/api/types.ts` exports `ApiError`, `getApiErrorMessage()`, and `isWalletNotFound()` — replacing all `err: any` catch blocks across the codebase.

### Performance
- `React.memo` on `StatCard` and `StatusBadge` to prevent unnecessary re-renders
- `useMemo` for filtered lists (TransactionsPage, AdminPage user count)
- `useDebounce` (400ms) on all search/filter inputs to avoid API calls on every keystroke

### Accessibility (a11y)
- `role`, `aria-label`, `aria-live`, `aria-selected`, `aria-modal` added to interactive elements
- All form inputs have associated `<label htmlFor>` bindings
- Icon elements use `aria-hidden="true"` to avoid screen reader noise

---

## Key Features

| Feature | Description |
|---|---|
| Authentication | Email + phone login, OTP-based forgot password, JWT + refresh tokens |
| Wallet | Balance display, paginated ledger, add money via Razorpay, withdraw |
| Transfer | Send money between users with idempotency key protection |
| Transactions | Full history with type/status filters and CSV export |
| Rewards | Points, tiers (Bronze → Platinum), catalog redemption |
| Profile & KYC | Profile editing, KYC document upload |
| Admin Panel | User management, KYC approval queue, rewards catalog management |
| Dark Mode | System-aware theme with manual toggle, persisted to localStorage |

---

## Scripts

```bash
npm run dev       # Start dev server (http://localhost:5173)
npm run build     # TypeScript check + Vite production build
npm run preview   # Serve production build locally
npm run lint      # ESLint check
```

---

## Security Notes

- Tokens stored in `sessionStorage` (cleared on tab close)
- No sensitive data rendered in the DOM
- Razorpay key loaded from `.env`, never hardcoded
- No `dangerouslySetInnerHTML` usage anywhere
- All form inputs validated with zod schemas
