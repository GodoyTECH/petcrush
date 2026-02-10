import React from "react";
import { useAuth } from "../state.js";

export function Profile() {
  const { isAuthed, user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-2xl font-semibold">Meu Perfil</div>
      {!isAuthed ? (
        <div className="text-white/60 mt-2">Faça login para cadastrar seu pet e usar chat/match.</div>
      ) : (
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="text-white/80">Logado como: <span className="text-gold">{user?.email}</span></div>
          <div className="text-white/60 mt-2">
            🛠️ TODO: cadastro completo do tutor (região, WhatsApp opcional, verificação, denúncias, etc.)
          </div>
        </div>
      )}
    </div>
  );
}
