# Setup & Deploy (Netlify + Render + Neon + Cloudinary)

## Why Cloudinary (or S3/R2) for media?
Neon is Postgres. It **does not provide native file storage**, so the recommended pattern is:
1) Upload media to a specialized storage/CDN
2) Store only the media URL + metadata in Neon
Source: Neon docs. citeturn0search1

Cloudinary has a Free plan and docs describing its free plan/credits model. citeturn0search0turn0search3turn0search21  
If you outgrow it, you can swap to S3/R2 later with minimal changes (keep URLs in DB).

## Local
- Node 18+
- Postgres (Neon recommended)

### API
```bash
cd apps/api
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

### Web
```bash
cd apps/web
npm install
npm run dev
```

## Deploy (recommended)
### 1) Neon (database)
- Create a Neon project and copy the connection string into `DATABASE_URL`.

### 2) API on Render
- Root directory: `apps/api`
- Build command: `npm install && npm run build`
- Start command: `npm start`
- Set env vars: `DATABASE_URL`, `JWT_SECRET`, plus Cloudinary vars if used.

### 3) Web on Netlify
- Base directory: `apps/web`
- Build command: `npm install && npm run build`
- Publish directory: `dist`
- Env var: `VITE_API_URL` set to your Render API URL.

### Netlify + Neon integration note
Netlify DB (powered by Neon) can auto-create a Neon DB when using `@netlify/neon`. citeturn0search5turn0search11turn0search20  
For this repo we’re using **Render for API** + **Neon directly**, which is straightforward and stable.
