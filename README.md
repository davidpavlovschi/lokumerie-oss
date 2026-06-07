# Lokumerie

Lokumerie is a self-hosted private package registry for team AI know-how.

It gives collaborating teams a private place to publish, version, search, install, and curate the prompts, Codex or Claude-style skill folders, runbooks, source notes, and hard-won lessons that help a project get smarter over time.

## Why

AI teams accumulate useful instructions everywhere: local skill folders, Slack messages, pull request comments, notes, and one-off prompts. Lokumerie gives that knowledge a home with:

- Versioned skills with markdown and bundled folder support.
- A terminal CLI for pushing, searching, listing, and installing skills.
- Koutis, which are curated collections of skills for a project, role, or workflow.
- A pantry for links, notes, references, and source material.
- Authenticated team access through Auth.js OAuth providers.
- Optional semantic search with pgvector and Gemini embeddings.

## Stack

- Next.js App Router
- React
- Prisma
- PostgreSQL with pgvector
- Auth.js / NextAuth
- Tailwind CSS

## Quick Start

Requirements:

- Node.js 22+
- PostgreSQL with the `vector` extension available
- A GitHub or Google OAuth app

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Generate an auth secret with:

```bash
npx auth secret
```

For local OAuth callbacks, use:

```text
http://localhost:3000/api/auth/callback/github
http://localhost:3000/api/auth/callback/google
```

## CLI

After signing in, open Settings and copy the generated CLI install command. For local development it looks like:

```bash
curl -sL http://localhost:3000/lokum.sh | LOKUM_API_KEY=lok_xxx bash -s -- setup
```

The CLI supports:

- `lokum push skill.md`
- `lokum push path/to/skill-folder`
- `lokum list`
- `lokum search "deploy"`
- `lokum install teammate-skill-slug`
- `lokum versions teammate-skill-slug`
- `lokum login`
- `lokum logout`
- `lokum whoami`

For a deployed instance, set `NEXT_PUBLIC_APP_URL` in the app and `LOKUM_URL` in the CLI environment if needed.

## Configuration

Copy `.env.example` and fill in:

- `DATABASE_URL`
- `AUTH_SECRET`
- `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET`, or `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `ALLOWED_EMAILS` if you want an email allowlist
- `GOOGLE_API_KEY` if you want embeddings and semantic search

## Development

```bash
npm run lint
npm run build
npx prisma studio
```

Maintenance scripts:

```bash
npm run db:seed
npm run db:links
npm run db:reassign-flavors
npm run db:backfill-embeddings
```

## Deployment Notes

Lokumerie is a normal Next.js app backed by PostgreSQL. Use any host that supports Node.js and a Postgres database with pgvector. Run migrations during deploy:

```bash
npx prisma migrate deploy
npm run build
npm run start
```

## Maintainer

Built by [David Pavlovschii](https://www.doved.page/).

Socials and related links:

- [doved.page](https://www.doved.page/)
- [GitHub](https://github.com/davidpavlovschi)
- [X / @real_doved](https://x.com/real_doved)
- [Codex++ Linux](https://github.com/davidpavlovschi/codex-plusplus-linux)

## License

MIT
