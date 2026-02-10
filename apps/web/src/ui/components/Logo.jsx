import React from "react";

export function Logo({ compact = false }) {
  return (
    <div className="flex items-center gap-2 select-none">
      <div className="h-9 w-9 rounded-2xl bg-ink shadow-glow grid place-items-center border border-white/10">
        <span className="text-gold text-lg">🐾</span>
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="font-semibold tracking-tight">PetCrushes</div>
          <div className="text-xs text-white/60">match • donate • care</div>
        </div>
      )}
    </div>
  );
}
