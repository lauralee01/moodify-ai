## MoodifyAI

MoodifyAI is a mood‑based music companion. You describe how you feel or what you want to listen to, and the app:

- Uses **Gemini** to analyse your mood and generate music parameters.
- Uses **Deezer** to fetch tracks that match that mood/artist.
- Stores your conversations and recommendations in **PostgreSQL**, so chats persist across refreshes and devices.

The project is split into:

- `frontend/` – Next.js 16 (App Router) chat UI.
- `backend/` – NestJS API (mood analysis, Deezer integration, persistence).

---

## Local development

### 1. Prerequisites

- Node.js 20+
- Docker (for local Postgres)
- A Gemini API key from Google AI Studio

### 2. Start Postgres with Docker

From the repo root:

```bash
docker compose up -d
```

This starts a Postgres 16 instance with:

- user: `moodify`
- password: `moodify`
- database: `moodify`

### 3. Backend setup (`backend/`)

Create `backend/.env` based on `backend/.env.example`:

```env
DATABASE_URL=postgresql://moodify:moodify@localhost:5432/moodify
GEMINI_API_KEY=your_gemini_api_key_here
PORT=4000
```

Install dependencies and run the Nest dev server:

```bash
cd backend
npm install
npm run start:dev
```

The API will be available at `http://localhost:4000/api`.

### 4. Frontend setup (`frontend/`)

Create `frontend/.env.local` based on `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Install dependencies and run the Next.js dev server:

```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:3000` to use the app.

---

## Production deployment

MoodifyAI is deployed with:

- **Neon** – managed Postgres (production database).
- **Render** – hosts the NestJS backend.
- **Vercel** – hosts the Next.js frontend.

The high‑level flow in production:

1. Vercel (frontend) calls the Render backend using `NEXT_PUBLIC_API_URL`.
2. The backend reads/writes conversations and messages in Neon using `DATABASE_URL`.

## Learn More

To learn more about Next.js, take a look at the following resources:

If you want to reproduce the deployment for another project, follow that guide from Step 1 (Neon) → Step 2 (Render) → Step 3 (Vercel).

---

## Project highlights

- Chat UI modelled after Cursor/ChatGPT:
  - Sidebar with conversation list (desktop + mobile overlay).
  - Persistent input bar with auto‑resizing textarea and inline send arrow.
  - “Thinking” state using a subtle sparkle animation instead of a generic spinner.
- Mood‑to‑music pipeline:
  - Gemini prompt engineering to produce Deezer‑friendly queries and optional `artistName`.
  - Deezer integration that prefers artist top tracks when a specific artist is requested.
- Persistence:
  - Conversations and messages stored in Postgres via TypeORM.
  - Session‑based conversation ownership using a browser session id.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
