const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function parseResponse(r, fallbackMessage) {
  if (r.ok) return r.json();
  let message = fallbackMessage;
  try {
    const err = await r.json();
    message = err.error || fallbackMessage;
  } catch {
    // noop
  }
  throw new Error(message);
}

export async function devLogin(email) {
  const r = await fetch(`${API_URL}/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return parseResponse(r, "dev-login failed");
}

export async function requestOtp(email) {
  const r = await fetch(`${API_URL}/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  return parseResponse(r, "request-otp failed");
}

export async function verifyOtp(email, code) {
  const r = await fetch(`${API_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code })
  });
  return parseResponse(r, "verify-otp failed");
}

export async function oauthGoogle(idToken) {
  const r = await fetch(`${API_URL}/auth/oauth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  return parseResponse(r, "google-auth failed");
}

export async function oauthApple(idToken) {
  const r = await fetch(`${API_URL}/auth/oauth/apple`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });
  return parseResponse(r, "apple-auth failed");
}

export async function getMe(token) {
  const r = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return parseResponse(r, "auth/me failed");
}

export async function listPets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API_URL}/pets?${qs}`);
  return parseResponse(r, "listPets failed");
}

export async function createPet(token, payload) {
  const r = await fetch(`${API_URL}/pets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  return parseResponse(r, "createPet failed");
}

export async function likePet(token, petId) {
  const r = await fetch(`${API_URL}/matches/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ petId })
  });
  return parseResponse(r, "likePet failed");
}
