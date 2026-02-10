import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(helmet());
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(",") ?? "*",
  credentials: true
}));

const PORT = process.env.PORT || 8080;

function signToken(user) {
  const secret = process.env.JWT_SECRET || "dev_secret";
  return jwt.sign({ sub: user.id, email: user.email }, secret, { expiresIn: "7d" });
}

function auth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: "UNAUTHENTICATED" });

  try {
    const secret = process.env.JWT_SECRET || "dev_secret";
    req.user = jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

// Health
app.get("/health", (req, res) => res.json({ ok: true, name: "petcusher-api" }));

// --- Auth (stub) ---
// For now: email + verification code flow will be implemented by Codex.
// This endpoint is just a dev shortcut to get a token.
app.post("/auth/dev-login", async (req, res) => {
  const schema = z.object({ email: z.string().email(), name: z.string().min(2).optional() });
  const { email, name } = schema.parse(req.body);

  const user = await prisma.user.upsert({
    where: { email },
    create: { email, name: name ?? null, locale: "pt-BR" },
    update: { name: name ?? undefined }
  });

  return res.json({ token: signToken(user), user });
});

// --- Pets ---
app.post("/pets", auth, async (req, res) => {
  const schema = z.object({
    displayName: z.string().min(1),
    species: z.string().min(2),         // dog, cat, hamster, etc (free string for now)
    breed: z.string().min(1),
    gender: z.enum(["MALE", "FEMALE"]),
    size: z.enum(["SMALL", "MEDIUM", "LARGE"]).optional(),
    colors: z.array(z.string().min(1)).min(1).max(3),
    ageMonths: z.number().int().min(0).max(360),
    pedigree: z.boolean(),
    vaccinated: z.boolean().optional(),
    neutered: z.boolean().optional(),
    healthNotes: z.string().max(500).optional(),
    objective: z.enum(["BREEDING", "COMPANIONSHIP", "SOCIALIZATION"]),
    region: z.string().min(2),
    about: z.string().max(800).optional(),
    media: z.object({
      photos: z.array(z.string().url()).min(3), // URLs
      video: z.string().url().optional()        // URL
    })
  });

  const data = schema.parse(req.body);

  const pet = await prisma.pet.create({
    data: {
      ownerId: req.user.sub,
      ...data,
      photos: data.media.photos,
      videoUrl: data.media.video ?? null
    }
  });

  return res.json({ pet });
});

app.get("/pets", async (req, res) => {
  // public listing with filters
  const schema = z.object({
    species: z.string().optional(),
    breed: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    objective: z.enum(["BREEDING", "COMPANIONSHIP", "SOCIALIZATION"]).optional(),
    region: z.string().optional(),
    donationOnly: z.string().optional(), // "true"
    cursor: z.string().optional(),
    take: z.string().optional()
  });

  const q = schema.parse(req.query);
  const take = Math.min(parseInt(q.take || "20", 10) || 20, 50);

  const where = {
    species: q.species || undefined,
    breed: q.breed || undefined,
    gender: q.gender || undefined,
    objective: q.objective || undefined,
    region: q.region || undefined,
    isDonation: q.donationOnly === "true" ? true : undefined
  };

  const pets = await prisma.pet.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take
  });

  return res.json({ pets, nextCursor: null });
});

// --- Matches (like) ---
app.post("/matches/like", auth, async (req, res) => {
  const schema = z.object({ petId: z.string().uuid() });
  const { petId } = schema.parse(req.body);

  const like = await prisma.like.upsert({
    where: { userId_petId: { userId: req.user.sub, petId } },
    create: { userId: req.user.sub, petId },
    update: { updatedAt: new Date() }
  });

  // Match detection will be implemented when we support "like" both sides (owner->owner).
  return res.json({ like, matched: false });
});

// --- Chat (skeleton) ---
app.get("/chats", auth, async (req, res) => {
  // Stub: Codex will implement chat rooms based on matches
  return res.json({ chats: [] });
});

app.listen(PORT, () => {
  console.log(`[petcusher-api] listening on :${PORT}`);
});
