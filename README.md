# Online Casino Platform

![Frontend](https://img.shields.io/badge/frontend-JavaScript%20%2B%20Vite-f7df1e?style=flat-square)
![Backend](https://img.shields.io/badge/backend-Express.js%20%2B%20Node.js-3c873a?style=flat-square)
![Database](https://img.shields.io/badge/database-MySQL-00758f?style=flat-square)

A browser-based casino app with three games: Slot Machine, Blackjack, and Roulette. Players can register, log in, manage a virtual balance, and play with no real-money transactions.

Read the [Wiki](https://github.com/KoZsombat/casino-project/wiki/Wiki)

## Features

- Home page with featured games and a quick `+ Add $500` balance top-up action
- User registration and login with cookie-based sessions
- Virtual wallet balance stored in MySQL
- Slot, Blackjack, and Roulette game flows
- Hash-based frontend navigation for the game pages

## Requirements

- Node.js 18+
- npm
- MySQL 8+

## Project Structure

- `frontend/` - Vite SPA with the game UI, auth pages, and client-side routing
- `backend/` - Express API, auth/session handling, validation, and game logic
- `backend/db/schema.sql` - MySQL schema for users and sessions

## Setup

### 1. Install Dependencies

Install the packages for both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Create the Database

Open MySQL and create the database used by the app:

```bash
mysql -u root -p
```

```sql
CREATE DATABASE casino_db;
USE casino_db;
SOURCE backend/db/schema.sql;
```

The schema creates two tables:

- `users` with username, email, password hash, and starting balance
- `sessions` with the cookie token and expiration timestamp

### 3. Configure Environment Variables

Create `backend/.env`:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=casino_db
DB_USER=root
DB_PASSWORD=jelszo
SESSION_SECRET=hosszu_random_string_legalabb_32_karakter
SESSION_EXPIRES_IN=86400
ALLOWED_ORIGINS=http://localhost:5173
```

Create `frontend/.env.local` if you want to override the API base URL in the UI:

```env
VITE_API_URL=http://localhost:3000
```

Note: the Vite dev server already proxies `/api` requests to `http://localhost:3000`.

### 4. Run the App

Start the backend:

```bash
cd backend
npm start
```

Start the frontend:

```bash
cd frontend
npm run dev
```

You can also start both from the repository root:

```bash
npm run start
```

### 5. Open the App

Open the frontend at:

```text
http://localhost:5173
```

## API Overview

Auth and user endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/user/balance`
- `POST /api/transactions/deposit`

Game endpoints:

- `POST /api/games/slot/spin`
- `POST /api/games/roulette/spin`
- `POST /api/games/blackjack/start`
- `POST /api/games/blackjack/hit`
- `POST /api/games/blackjack/stand`

## Scripts

Root:

- `npm run start` - run frontend and backend together
- `npm run lint` - lint the repository

Backend:

- `npm start` - start the Express server
- `npm run lint` - lint backend files

Frontend:

- `npm run dev` - start the Vite dev server
- `npm run build` - create a production build
- `npm run preview` - preview the production build

## Notes

- New users start with a balance of `1000`
- The home page includes a quick deposit action that adds `500` to the logged-in user
- Sessions are stored in MySQL and the auth token is kept in an HTTP-only cookie
