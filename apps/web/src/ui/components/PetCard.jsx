import React from "react";
import { useTranslation } from "react-i18next";
import { clsx } from "clsx";
import { useAuth } from "../state.jsx";
import { likePet } from "../api.js";

function Badge({ children }) {
  return (
    <span className="px-2 py-1 rounded-xl text-xs border border-white/10 bg-white/5">
      {children}
    </span>
  );
}

export function PetCard({ pet, onOpen }) {
  const { t } = useTranslation();
  const { isAuthed, token } = useAuth();
  const [liking, setLiking] = React.useState(false);

  const objectiveLabel = {
    BREEDING: t("objective.breeding"),
    COMPANIONSHIP: t("objective.companionship"),
    SOCIALIZATION: t("objective.socialization")
  }[pet.objective];

  async function onLike() {
    if (!isAuthed) return onOpen?.(pet, { requireLogin: true });
    setLiking(true);
    try {
      await likePet(token, pet.id);
      onOpen?.(pet, { liked: true });
    } finally {
      setLiking(false);
    }
  }

  return (
    <div className="rounded-3xl overflow-hidden border border-white/10 bg-ink shadow-glow">
      <div className="relative">
        <img
          src={pet.photos?.[0]}
          alt={pet.displayName}
          className="w-full h-56 object-cover opacity-90"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          <Badge>{pet.species}</Badge>
          <Badge>{pet.breed}</Badge>
          <Badge>{objectiveLabel}</Badge>
          {pet.isDonation && <Badge>💝 {t("donationOnly")}</Badge>}
        </div>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold">{pet.displayName}</div>
            <div className="text-sm text-white/70">
              {pet.region} • {pet.gender === "MALE" ? t("gender.male") : t("gender.female")} • {Math.round(pet.ageMonths / 12)}a
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={clsx(
                "h-10 w-10 grid place-items-center rounded-2xl border border-white/10 hover:bg-white/5",
                "active:scale-95 transition"
              )}
              onClick={() => onOpen?.(pet, {})}
              title="Detalhes"
            >
              ℹ️
            </button>
            <button
              className={clsx(
                "h-10 w-10 grid place-items-center rounded-2xl bg-coral/90 text-slate-950 font-bold",
                "hover:opacity-90 active:scale-95 transition",
                liking && "opacity-60 pointer-events-none"
              )}
              onClick={onLike}
              title="Match"
            >
              🐾
            </button>
          </div>
        </div>

        <div className="text-sm text-white/75 line-clamp-3">{pet.about || ""}</div>

        <div className="flex flex-wrap gap-2">
          <Badge>🎨 {pet.colors?.join(" / ")}</Badge>
          <Badge>🧬 {pet.pedigree ? "Pedigree" : "Sem pedigree"}</Badge>
          {pet.vaccinated ? <Badge>💉 Vacinas OK</Badge> : <Badge>💉 Não informado</Badge>}
          {pet.neutered ? <Badge>✂️ Castrado</Badge> : <Badge>✂️ Não castrado</Badge>}
        </div>
      </div>
    </div>
  );
}
