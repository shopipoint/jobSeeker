# JobSeeker

Self-hosted AI job search copilot inspired by [Jobright](https://jobright.ai/).

## Features

- **Personalized job matching** from your resume/skills (local scoring; optional LLM enrichment)
- **Resume profile** with skill extraction
- **Job-specific resume tailoring** (OpenAI-compatible API or local fallback)
- **Application tracker** (saved → applied → interview → offer → rejected)
- **Career copilot** chat
- **Docker Compose** one-command deploy

## Quick start (local)

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), register an account, paste a resume, then open **Jobs → AI matches**.

### Optional AI

Set in `.env`:

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Point `OPENAI_BASE_URL` at **Ollama**, OpenRouter, Azure OpenAI, or any OpenAI-compatible server. Without a key, matching, tailoring, and copilot still work with local heuristics.

## Docker

```bash
export AUTH_SECRET="$(openssl rand -hex 32)"
# optional
export OPENAI_API_KEY=sk-...
docker compose up --build
```

App: [http://localhost:3000](http://localhost:3000)

SQLite data persists in the `jobseeker-data` volume.

## Scope vs Jobright

This MVP covers the core self-hostable loop. Not included (yet): browser autofill extensions, live scrapes of every ATS, or LinkedIn-style insider referral graphs.

## License

MIT — for personal / team self-hosting. Not affiliated with Jobright.
