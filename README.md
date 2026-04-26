# Course Compass MERN Assessment

This folder contains the completed assessment built from the supplied frontend.

## What Is Included

- Next.js frontend integrated with backend APIs for admin login, course upload/listing, and recommendations.
- Express backend with MongoDB models, JWT admin auth, CSV import, Redis-backed caching, and Gemini API integration with a clear mock fallback.
- Dockerfiles, `docker-compose.yml`, and DevOps notes in `docs/devops.md`.
- The supplied `course_template.csv` is copied to `backend/data/course_template.csv` for seeding.

## Local Setup

```bash
npm install
npm --prefix backend install
cp .env.example .env.local
cp backend/.env.example backend/.env
```

Start MongoDB and Redis locally, or run them with Docker:

```bash
docker compose up mongo redis
```

Then seed the CSV data:

```bash
npm run backend:seed
```

Run the backend and frontend in separate terminals:

```bash
npm run backend:dev
npm run dev
```

Frontend: `http://localhost:9002`
Backend: `http://localhost:5001/api`

## Admin Flow

1. Open `/admin/login`.
2. Create an admin account with email and password.
3. Login stores the JWT in localStorage via React Context.
4. Upload `backend/data/course_template.csv` from `/admin/dashboard`.

## Docker

```bash
docker compose up --build
```

For production, replace placeholder values for `JWT_SECRET` and `GEMINI_API_KEY`.
