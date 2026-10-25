# Q65 Online Exam

A responsive React examination portal with an Express API, MongoDB persistence, server-side scoring, and Docker Compose support.

## Quick start with Docker

Install Docker Desktop, then run from the project root:

```powershell
Set-Location backend
npm run setup:local-auth
Set-Location ..
docker compose up --build
```

Open [http://localhost:8080](http://localhost:8080). Compose waits for MongoDB health, inserts the clearly identified sample exams and demo student without deleting existing records, then starts the API and frontend. MongoDB is exposed on `127.0.0.1:27018` by default (configurable with `MONGO_PORT`) and its data is stored in the named `mongo_data` volume. Stop the application with `Ctrl+C`; `docker compose down` leaves the volume intact. Use `docker compose down -v` only when you intentionally want to erase that data.

## Student sign-in

Run `npm run setup:local-auth` from `backend/` once. It creates the ignored project-root `.env` from `.env.example` if necessary, generates a strong random `DEMO_STUDENT_PASSWORD` and stable `SESSION_SECRET` only when those values are missing, and never prints generated values. Open the local `.env` in your editor to see/use the generated demo password, or replace it with your own 12-128 character password using at least three of lowercase, uppercase, digits, and symbols. Do not commit `.env` or share its values. Then run `docker compose up --build`. The backend seed hashes the configured password with bcrypt only when the demo student has no password hash; it never overwrites an existing hash. Sign in with `jordan.davis@example.test` and the value of `DEMO_STUDENT_PASSWORD` in your local `.env`.

If the demo student already has a password hash and you intentionally need to change it, update `DEMO_STUDENT_PASSWORD` in `.env`, recreate the backend so Compose loads the new value, then run:

```powershell
docker compose up -d --force-recreate backend
docker compose exec backend npm run set-demo-password
```

This command validates password strength and replaces only the demo student's password hash; it preserves the student record and all exam attempts/results. Ordinary startup never overwrites an existing hash. Email verification and password recovery are not configured; newly registered students are active immediately. Sessions use an HTTP-only, same-site cookie stored in MongoDB. Enable `SESSION_COOKIE_SECURE=true` when serving over HTTPS.

Student APIs require the Mongo-backed session cookie. Sign out destroys the server-side session and clears the cookie; it does not delete exams, attempts, or results.

## Run services separately

Copy `.env.example` to `.env`. Start MongoDB locally or run `docker compose up -d mongo`, then use separate terminals:

```powershell
Set-Location backend
npm install
npm run seed
npm run dev
```

```powershell
Set-Location frontend
npm install
npm run dev
```

The Vite server proxies `/api` to `http://localhost:4000`. Visit [http://localhost:5173](http://localhost:5173).

## Sample data

The seed command is idempotent and only inserts missing records. It creates three sample exams and a demo student (`Jordan Davis`, `jordan.davis@example.test`, student number `Q65-DEMO-001`). The UI labels sample mode explicitly; attempts and scores are stored as database records once submitted. No sample attempt is inserted automatically.

Seeded exams support the preset lengths 5, 10, 15, 20, 30, and 50, with 50 as the configured maximum. A length is offered only when the exam bank contains enough questions. Omitting `questionCount` when starting an attempt retains the five-question default. Seed updates append missing questions by normalized prompt and do not replace existing exam questions or attempts.

## API overview

- `GET /api/health`
- `GET /api/auth/session`, `POST /api/auth/register`, `POST /api/auth/login`, and `POST /api/auth/logout`
- `GET /api/exams` and `GET /api/exams/:examId`
- `POST /api/attempts` to start a timed attempt
- `GET /api/attempts/:attemptId`
- `PUT /api/attempts/:attemptId/answers` to save an answer or review flag
- `POST /api/attempts/:attemptId/submit` to submit and calculate the result
- `GET /api/students/demo` and `GET /api/students/:studentId/attempts`

Correct-option fields are excluded from normal exam queries and student-facing serializers. The attempt submission service computes scores from the database exam record. All exam, attempt, and student APIs require a valid session and enforce student ownership; `/api/health`, `/api/auth/session`, `/api/auth/login`, and `/api/auth/register` are available before sign-in. The seeded demo identity is intended for local evaluation, not public onboarding.

## Configuration

Set values in `.env` using `.env.example` as a reference. `MONGODB_URI`, `PORT`, `CORS_ORIGIN`, `DEMO_STUDENT_NUMBER`, `DEMO_STUDENT_PASSWORD`, `SESSION_SECRET`, and `SESSION_COOKIE_SECURE` are supported. The Compose database port is bound to localhost and is not intended as a public MongoDB deployment.

## Verification

Run the backend unit and integration suite, including live registration/login/logout against the Compose stack configured by `.env`:

```powershell
npm test --prefix backend
npm run test:auth-live --prefix backend
npm run test:e2e --prefix backend
npm run lint --prefix frontend
npm run build --prefix frontend
```

The live auth suite creates uniquely identified test accounts, verifies password hashing and session behavior, then removes only those generated test accounts. The browser suite uses Playwright and requires the Docker Compose services to be running at `http://localhost:8080`; install its Chromium browser once with `npx playwright install chromium` from `backend/`. It creates a temporary account, verifies a supported exam longer than five questions through refresh, resume, and submission, then removes only that account and its attempts. Do not run these live suites against a shared production database.

## Limitations

Email verification, email delivery, and password recovery are not implemented. Registration activates the account immediately and returns `emailVerified: false`; the UI does not imply otherwise. The seeded demo account is intended for local evaluation. The registration checkbox records acceptance time but the project does not yet provide a published terms/privacy document. Add those documents, delivery and recovery flows, rate limiting, and production deployment review before using this demo as a public exam service.