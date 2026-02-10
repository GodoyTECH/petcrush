import React from "react";
import { useAuth } from "../state.js";

export function Chat() {
  const { isAuthed } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="text-2xl font-semibold">Chat</div>
      <div className="text-white/60 mt-2">
        {isAuthed
          ? "Estrutura pronta. O Codex vai implementar conversas por match (salas, mensagens, anexos e avisos)."
          : "Faça login para ver conversas e mandar mensagens."}
      </div>
      <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
        <div className="text-white/70">🛠️ TODO: chat realtime (WebSocket/SSE), bloqueio de spam e denúncias.</div>
      </div>
    </div>
  );
}
