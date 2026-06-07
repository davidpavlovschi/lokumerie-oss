# Contributing

Thanks for helping improve Lokumerie.

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Before opening a pull request, run:

```bash
npm run lint
npm run build
```

## Pull Requests

- Keep changes focused.
- Include screenshots or short notes for UI changes.
- Update documentation when setup, behavior, or public APIs change.
- Avoid committing secrets, local `.env` files, database dumps, or generated build output.

## Product Direction

Lokumerie is meant to stay self-hostable, team-oriented, and useful from both the browser and terminal. New features should make shared skills easier to publish, discover, install, review, or curate.
