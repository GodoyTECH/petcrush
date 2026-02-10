# PetCrushes 🐾❤️
Web app + API base (monorepo) for a matchmaking + donations platform for **domesticated pets** (dogs, cats, rabbits, hamsters, birds, etc.).

This repo is intentionally a **clean, production-ish starter** so Codex can implement the full feature set without getting lost.

## What’s included
- **apps/web**: React + Vite + Tailwind + Router + i18n (PT/EN) + polished UI skeleton (mock data + API hooks)
- **apps/api**: Node + Express + Prisma (Postgres/Neon ready) + basic auth stubs + REST endpoints skeleton
- **assets**: SVG icons (Cruzamento / Companhia / Socialização)
- **docs**: setup + deploy notes for Netlify (web) + Render (api) + Neon + Cloudinary (media)

## Quick start (local)
1) Install deps
```bash
npm install
```

2) Configure env
```bash
cp apps/api/.env.example apps/api/.env
# set DATABASE_URL, JWT_SECRET, CLOUDINARY_* (optional)
```

3) Prisma
```bash
cd apps/api
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

4) Run dev (2 terminals)
```bash
# terminal 1
cd apps/api && npm run dev

# terminal 2
cd apps/web && npm run dev
```

## Deploy overview
- **Web (Netlify)**: build `apps/web`, publish `apps/web/dist`
- **API (Render)**: build `apps/api`, start `npm start`
- **DB (Neon)**: Postgres + Prisma migrations
- **Media (Cloudinary or S3/R2)**: store files, save URLs in Neon

See `docs/SETUP.md`.
