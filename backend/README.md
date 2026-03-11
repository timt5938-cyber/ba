# Dota Scope Backend

Production-ready Node.js + Fastify backend with PostgreSQL persistence.

## Run locally

```bash
cd backend
cp .env.example .env
# set DATABASE_URL / JWT secrets / OpenDota key
npm install
npm run migrate
npm run dev
```

## Build

```bash
cd backend
npm run build
npm start
```

## Main API

Base prefix: `/api`

- `GET /api/health`
- `GET /api/ready`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

Authenticated routes (Bearer token):

- `GET/PATCH /api/profile`
- `GET/PATCH /api/settings`
- `GET /api/account/summary`
- `DELETE /api/account`
- `GET /api/devices`
- `DELETE /api/devices/:id`
- `POST /api/devices/logout-all`
- `GET /api/notifications`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `GET/POST/PATCH/DELETE /api/goals`
- `GET/POST /api/exports`
- `GET /api/steam/accounts`
- `POST /api/steam/bind`
- `POST /api/steam/accounts/:id/activate`
- `DELETE /api/steam/accounts/:id`
- `POST /api/sync`
- `GET /api/matches`
- `GET /api/matches/:id`
- `GET /api/analytics/summary?period=7d|30d|3m|all`
- `GET /api/builds`
- `GET /api/comparison/player/:accountId`
- `GET /api/comparison/period?period=30d`

Public OpenDota passthrough/cache:

- `GET /api/opendota/patch`
- `GET /api/opendota/constants/:name`

## Deploy on Ubuntu (backend VM + external PostgreSQL)

Use the script from project root:

`C:\dota\backend_ubuntu_bootstrap.txt`

Then deploy app code:

```bash
sudo mkdir -p /opt/dota-scope/backend
sudo chown -R $USER:$USER /opt/dota-scope
# upload backend folder to /opt/dota-scope/backend
cd /opt/dota-scope/backend
npm ci --omit=dev
npm run migrate
npm run build
pm2 start dist/server.js --name dota-scope-api
pm2 save
```

Example env (`/etc/dota-scope/.env`):

```env
NODE_ENV=production
PORT=8080
DATABASE_URL=postgresql://dbadmin:<password>@10.0.0.7:5432/bd_ce76
JWT_ACCESS_SECRET=<strong_secret>
JWT_REFRESH_SECRET=<strong_secret>
OPENDOTA_API_KEY=<key>
OPENDOTA_BASE_URL=https://api.opendota.com/api
```
