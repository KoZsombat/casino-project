# Online Casino Platform

[![Frontend](https://img.shields.io/badge/frontend-JavaScript%20%2B%20Vite%208-f7df1e?style=flat-square)](frontend)
[![Backend](https://img.shields.io/badge/backend-Express%205%20%2B%20MySQL-3c873a?style=flat-square)](backend)
[![Games](https://img.shields.io/badge/games-Slots%20%C2%B7%20Blackjack%20%C2%B7%20Roulette-c62828?style=flat-square)](backend/src/controllers)

A browser casino with three games — slots, blackjack and roulette — built on a virtual balance. No real money goes anywhere near it; you sign up, get a thousand chips, and lose them at your own pace.

There's more detail in the [Wiki](https://github.com/KoZsombat/casino-project/wiki/Wiki).

## What it does

- Spins a three-reel slot machine, where matching the middle row pays out a multiple of your bet and three Bonus symbols pay a flat 5000
- Deals blackjack with hit and stand against a dealer, the hand held server-side for the length of the round
- Takes roulette bets from a full betting table, several at once, and settles them all against one spin
- Keeps a virtual wallet in MySQL — new accounts start at 1000, and the home page has a quick `+ $500` top-up
- Registers and signs users in with bcrypt-hashed passwords and an HTTP-only session cookie

Every game runs on the server. The frontend only asks for a spin or a card and renders whatever comes back, so nothing about the outcome is decided in the browser.

## Running it locally

You'll need Node 20.19+ (or 22.12+) and MySQL 8.

```bash
git clone https://github.com/KoZsombat/casino-project
cd casino-project

# install everything
npm install
cd backend && npm install
cd ../frontend && npm install
```

Create the database and load the schema:

```bash
cd ..
mysql -u root -p -e "CREATE DATABASE casino_db"
mysql -u root -p casino_db < backend/src/db/schema.sql
```

That gives you a `users` table with the balance on it and a `sessions` table for the cookie tokens.

Then copy the backend environment file and fill it in:

```bash
cp backend/.env.example backend/.env
```

The ones that matter are your MySQL connection (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`), a `SESSION_SECRET` of at least 32 random characters, and `ALLOWED_ORIGINS` pointing at the frontend. The frontend needs no configuration — Vite proxies `/api` straight to `http://localhost:3000` in development.

Start both from the repository root:

```bash
npm start
```

That runs the API and the Vite dev server together. If you'd rather have them apart, `npm start` in `backend/` and `npm run dev` in `frontend/` do the same thing in two terminals.

The frontend runs at `http://localhost:5173`.

## Under the hood

Plain JavaScript on the front, no framework — a hash router in `src/router.js`, one module per page in `src/pages`, and the API wrappers in `src/api`. The backend is Express 5 with mysql2, request bodies validated by zod, and helmet, CORS and rate limiting in front of everything. Auth is bcrypt plus a session row in MySQL, with the token in an HTTP-only cookie.

The game logic lives in `backend/src/controllers` — one file each for slots, blackjack and roulette — and the routes that wrap them, take the bet and settle the balance are in `backend/src/routes/games.js`.

## License

Built as a school project, provided as-is.
