const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function devLogin(email) {
  const r = await fetch(`${API_URL}/auth/dev-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email })
  });
  if (!r.ok) throw new Error("dev-login failed");
  return r.json();
}

export async function listPets(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const r = await fetch(`${API_URL}/pets?${qs}`);
  if (!r.ok) throw new Error("listPets failed");
  return r.json();
}

export async function createPet(token, payload) {
  const r = await fetch(`${API_URL}/pets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload)
  });
  if (!r.ok) throw new Error("createPet failed");
  return r.json();
}

export async function likePet(token, petId) {
  const r = await fetch(`${API_URL}/matches/like`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ petId })
  });
  if (!r.ok) throw new Error("likePet failed");
  return r.json();
}
