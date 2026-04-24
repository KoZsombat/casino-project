# Online Casino Platform

![Frontend](https://img.shields.io/badge/frontend-JavaScript%20%2B%20Vite-f7df1e?style=flat-square)
![Backend](https://img.shields.io/badge/backend-Express.js%20%2B%20Node.js-3c873a?style=flat-square)
![Database](https://img.shields.io/badge/database-MySQL-00758f?style=flat-square)

Böngészőalapú online kaszinó platform három játékkal: Slot Machine, Blackjack és Rulett. A felhasználók regisztrálhatnak, bejelentkezhetnek, és virtuális egyenlegükkel játszhatnak.

Read the [Wiki](https://github.com/KoZsombat/casino-project/wiki/Wiki)

## Követelmények

- Node.js 18+
- npm
- MySQL 8+

## Setup

### 1. Függőségek telepítése

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2. Adatbázis létrehozása

```bash
mysql -u root -p
```

```sql
CREATE DATABASE casino_db;
USE casino_db;
SOURCE backend/db/schema.sql;
```

### 3. Környezeti változók

Hozd létre a `backend/.env` fájlt:

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
```

Hozd létre a `frontend/.env.local` fájlt:

```env
VITE_API_URL=http://localhost:3000
```

### 4. Backend indítása

```bash
cd backend
npm run dev
```

### 5. Frontend indítása

```bash
cd frontend
npm run dev
```

### 6. Megnyitás

`http://localhost:5173`
