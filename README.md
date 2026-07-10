# Inventory Frontend

React dashboard for the limited edition sneaker drop system. Shows live stock counts, handles reservations and purchases, and updates in real-time across all open tabs.

## Tech Stack

- **UI:** React 19
- **Language:** TypeScript
- **Bundler:** Vite
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP client:** Axios
- **Real-time:** Socket.io-client
- **Notifications:** React Hot Toast
- **State:** React Context + useReducer

## Prerequisites

- Node.js 18+
- npm

## Setup

```bash
cd frontend
npm install
```

Copy the environment file:

```bash
cp .env.example .env
```

The `.env` file only has two variables. The defaults work if the backend is running on port 4000:

```
VITE_API_URL=http://localhost:4000
VITE_SOCKET_URL=http://localhost:4000
```

## Running

```bash
npm run dev
```

Starts the dev server on `http://localhost:5173`. The Vite config proxies `/api` and `/socket.io` requests to the backend at `localhost:4000`, so you don't have to deal with CORS during development.

For a production build:

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── components/
│   ├── Layout/            # Navbar, Footer, Layout wrapper
│   ├── ProductCard/       # Product card with reserve/purchase flow
│   ├── UpcomingDropCard/  # Upcoming drop with countdown timer
│   ├── CountdownTimer/    # Live countdown (days/hrs/min/sec)
│   └── common/            # ProtectedRoute
├── pages/
│   ├── Dashboard.tsx      # Main page — active & upcoming drops
│   ├── Login.tsx
│   └── Register.tsx
├── hooks/
│   └── useSocket.ts       # Socket.io connection & event listeners
├── context/
│   └── AuthContext.tsx     # Auth state (useReducer)
├── services/
│   └── api.ts             # Axios instance with JWT interceptor
├── types/
│   └── index.ts           # Shared TypeScript interfaces
├── App.tsx                # Route definitions
├── main.tsx               # Entry point
└── style.css              # Tailwind CSS import
```

## How it works

### Public browsing

Anyone can view the dashboard — active drops show with live stock counts and recent purchasers. Upcoming drops display at the bottom with a countdown timer. No login required to browse.

### Authentication

Clicking "Reserve" without being logged in redirects to the registration page. Once registered or logged in, the JWT token is stored in localStorage and automatically attached to all API requests via the Axios interceptor. As this is demo project so token is saved on localstorage otherwise it will be saved on cookie for security reasons.

### Reservation flow

1. Click **Reserve** on any in-stock product
2. The button changes to **Complete Purchase**
3. A cart icon appears in the navbar showing your reservation count
4. You have 60 seconds to complete the purchase
5. If the timer expires, the button reverts to "Reserve" — all handled in real-time via Socket.io

### Real-time updates

The dashboard subscribes to Socket.io events on mount:

- **Stock changes** — when anyone reserves or buys, the stock counter updates instantly across all open tabs
- **Reservation expiry** — when your 60-second window expires, the UI resets without a page refresh
- **New purchases** — recent buyers list updates live with the purchaser's name and timestamp

## Styling

Tailwind CSS v4 with a dark theme. The color scheme uses violet for primary actions and emerald for purchase confirmation. No external component library — just utility classes.
