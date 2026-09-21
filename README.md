# JobSeeker

Self-hosted AI job search copilot inspired by [Jobright](https://jobright.ai/).

**Current release:** `v1.0` (MVP) + RBAC/profile follow-up on `main`.

## Features

- **Personalized job matching** from your resume/skills (local scoring; optional LLM enrichment)
- **Resume profile** with skill extraction
- **Job-specific resume tailoring** (OpenAI-compatible API or local fallback)
- **Application tracker** (saved → applied → interview → offer → rejected)
- **Career copilot** chat
- **RBAC** — Super Admin → Project Manager → Bidder / Caller / Developer ([docs/RBAC.md](docs/RBAC.md))
- **Profile & settings** — account, career, notifications, security, role/permissions, plan preview
- **Subscriptions planned for v2** — schema + UI preview ([docs/SUBSCRIPTIONS.md](docs/SUBSCRIPTIONS.md))
- **Docker Compose** one-command deploy

## Quick start (local)

```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo accounts (after seed)

| Email | Role | Password |
|---|---|---|
| `admin@jobseeker.local` | Super Admin | `password123` |
| `pm@jobseeker.local` | Project Manager | `password123` |
| `bidder@jobseeker.local` | Bidder | `password123` |
| `caller@jobseeker.local` | Caller | `password123` |
| `dev@jobseeker.local` | Developer | `password123` |

Self-registration defaults to **Developer**.

### Optional AI

```env
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

Point `OPENAI_BASE_URL` at **Ollama**, OpenRouter, Azure OpenAI, or any OpenAI-compatible server.

## Docker

```bash
export AUTH_SECRET="$(openssl rand -hex 32)"
docker compose up --build
```

## License

MIT — for personal / team self-hosting. Not affiliated with Jobright.
