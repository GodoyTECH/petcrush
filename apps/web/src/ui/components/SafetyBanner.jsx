import React from "react";
import { useTranslation } from "react-i18next";

const phrasesPT = [
  "Amor também é responsabilidade: vacinas e cuidados em dia 🩺🐾",
  "Seu pet é família. Respeite o bem-estar sempre ❤️",
  "Cruzamento responsável: saúde e genética importam 🧬",
  "Adoção é um ato de amor. Combine tudo com clareza 🤝"
];

const phrasesEN = [
  "Love is responsibility: keep vaccines and care up to date 🩺🐾",
  "Your pet is family. Always protect their well-being ❤️",
  "Responsible breeding: health and genetics matter 🧬",
  "Adoption is love. Agree clearly and kindly 🤝"
];

export function SafetyBanner() {
  const { t, i18n } = useTranslation();
  const phrases = i18n.language === "pt-BR" ? phrasesPT : phrasesEN;
  const phrase = phrases[Math.floor(Date.now() / 10000) % phrases.length];

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-2">
        <div className="text-sm text-white/80">{t("safety")}</div>
        <div className="text-sm text-gold">{phrase}</div>
      </div>
    </div>
  );
}
