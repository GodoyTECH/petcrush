import React from "react";
import { Routes, Route } from "react-router-dom";
import { TopNav } from "./components/TopNav.jsx";
import { SafetyBanner } from "./components/SafetyBanner.jsx";
import { AuthProvider } from "./state.js";
import { Discover } from "./pages/Discover.jsx";
import { Donations } from "./pages/Donations.jsx";
import { Chat } from "./pages/Chat.jsx";
import { Profile } from "./pages/Profile.jsx";

export function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen paw-bg">
        <TopNav />
        <SafetyBanner />
        <Routes>
          <Route path="/" element={<Discover />} />
          <Route path="/donations" element={<Donations />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>

        <footer className="mt-10 border-t border-white/10 bg-slate-950/40">
          <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-white/60 flex flex-col gap-2">
            <div>🐾 PetCusher — amor, cuidado e responsabilidade.</div>
            <div>
              Aviso legal: PetCusher não se responsabiliza por acordos, valores, cruzamentos ou cuidados.
              Use denúncias e verificação para manter a comunidade segura.
            </div>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
