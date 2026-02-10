import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

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
const OTP_TTL_MINUTES = Number(process.env.OTP_TTL_MINUTES || 10);

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

function hashOTP(email, otp) {
  return crypto.createHash("sha256").update(`${email}:${otp}:${process.env.OTP_SECRET || "petcrush_otp_secret"}`).digest("hex");
}

function createOtpCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(email, otp) {
  console.log(`[petcrush-api] OTP for ${email}: ${otp}`);
  return false;
}

function parseJwtPayload(idToken) {
  const parts = idToken.split(".");
  if (parts.length < 2) throw new Error("INVALID_OAUTH_TOKEN");
  const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf-8"));
  return payload;
}

async function upsertUserFromIdentity({ email, name, provider, verified }) {
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name || null,
      locale: "pt-BR",
      emailVerified: verified,
      authProvider: provider
    },
    update: {
      name: name || undefined,
      emailVerified: verified,
      authProvider: provider
    }
  });
}

// Health
app.get("/health", (req, res) => res.json({ ok: true, name: "petcrush-api" }));

app.get("/auth/me", auth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) return res.status(404).json({ error: "USER_NOT_FOUND" });
  return res.json({ user });
});

app.post("/auth/request-otp", async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  const { email } = schema.parse(req.body);

  const otp = createOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  await prisma.verificationCode.updateMany({
    where: { email, usedAt: null },
    data: { usedAt: new Date() }
  });

  await prisma.verificationCode.create({
    data: {
      email,
      codeHash: hashOTP(email, otp),
      expiresAt
    }
  });

  const sent = await sendOtpEmail(email, otp);
  return res.json({ ok: true, delivery: sent ? "email" : "dev-console", expiresAt });
});

app.post("/auth/verify-otp", async (req, res) => {
  const schema = z.object({ email: z.string().email(), code: z.string().length(6) });
  const { email, code } = schema.parse(req.body);

  const record = await prisma.verificationCode.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: "desc" }
  });

  if (!record) return res.status(400).json({ error: "OTP_NOT_FOUND" });
  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP_EXPIRED" });
  if (record.attempts >= 5) return res.status(429).json({ error: "OTP_TOO_MANY_ATTEMPTS" });

  const ok = record.codeHash === hashOTP(email, code);
  if (!ok) {
    await prisma.verificationCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
    return res.status(400).json({ error: "OTP_INVALID" });
  }

  await prisma.verificationCode.update({ where: { id: record.id }, data: { usedAt: new Date() } });

  const user = await upsertUserFromIdentity({ email, provider: "EMAIL_OTP", verified: true });
  return res.json({ token: signToken(user), user });
});

app.post("/auth/oauth/google", async (req, res) => {
  const schema = z.object({ idToken: z.string().min(10) });
  const { idToken } = schema.parse(req.body);

  const payload = parseJwtPayload(idToken);
  if (payload.iss !== "https://accounts.google.com" && payload.iss !== "accounts.google.com") {
    return res.status(400).json({ error: "GOOGLE_ISSUER_INVALID" });
  }
  if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
    return res.status(400).json({ error: "GOOGLE_AUDIENCE_INVALID" });
  }
  if (!payload.email) return res.status(400).json({ error: "GOOGLE_EMAIL_NOT_AVAILABLE" });

  const user = await upsertUserFromIdentity({
    email: payload.email,
    name: payload.name,
    provider: "GOOGLE",
    verified: Boolean(payload.email_verified)
  });

  return res.json({ token: signToken(user), user });
});

app.post("/auth/oauth/apple", async (req, res) => {
  const schema = z.object({ idToken: z.string().min(10) });
  const { idToken } = schema.parse(req.body);

  const payload = parseJwtPayload(idToken);
  if (payload.iss !== "https://appleid.apple.com") {
    return res.status(400).json({ error: "APPLE_ISSUER_INVALID" });
  }
  if (process.env.APPLE_CLIENT_ID && payload.aud !== process.env.APPLE_CLIENT_ID) {
    return res.status(400).json({ error: "APPLE_AUDIENCE_INVALID" });
  }

  const email = payload.email;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "APPLE_EMAIL_NOT_AVAILABLE" });
  }

  const user = await upsertUserFromIdentity({
    email,
    provider: "APPLE",
    verified: payload.email_verified === true || payload.email_verified === "true"
  });

  return res.json({ token: signToken(user), user });
});

if (process.env.NODE_ENV !== "production") {
  app.post("/auth/dev-login", async (req, res) => {
    const schema = z.object({ email: z.string().email(), name: z.string().min(2).optional() });
    const { email, name } = schema.parse(req.body);

    const user = await upsertUserFromIdentity({ email, name, provider: "DEV", verified: true });

    return res.json({ token: signToken(user), user });
  });
}

// --- Pets ---
app.post("/pets", auth, async (req, res) => {
  const schema = z.object({
    displayName: z.string().min(1),
    species: z.string().min(2),
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
      photos: z.array(z.string().url()).min(3),
      video: z.string().url()
    })
  });

  const data = schema.parse(req.body);

  const pet = await prisma.pet.create({
    data: {
      ownerId: req.user.sub,
      ...data,
      photos: data.media.photos,
      videoUrl: data.media.video
    }
  });

  return res.json({ pet });
});

app.get("/pets", async (req, res) => {
  const schema = z.object({
    species: z.string().optional(),
    breed: z.string().optional(),
    gender: z.enum(["MALE", "FEMALE"]).optional(),
    objective: z.enum(["BREEDING", "COMPANIONSHIP", "SOCIALIZATION"]).optional(),
    region: z.string().optional(),
    donationOnly: z.string().optional(),
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

  const pets = await prisma.pet.findMany({ where, orderBy: { createdAt: "desc" }, take });

  return res.json({ pets, nextCursor: null });
});

app.post("/matches/like", auth, async (req, res) => {
  const schema = z.object({ petId: z.string().uuid() });
  const { petId } = schema.parse(req.body);

  const like = await prisma.like.upsert({
    where: { userId_petId: { userId: req.user.sub, petId } },
    create: { userId: req.user.sub, petId },
    update: { updatedAt: new Date() }
  });

  return res.json({ like, matched: false });
});

app.get("/chats", auth, async (req, res) => {
  return res.json({ chats: [] });
});

app.listen(PORT, () => {
  console.log(`[petcrush-api] listening on :${PORT}`);
});
