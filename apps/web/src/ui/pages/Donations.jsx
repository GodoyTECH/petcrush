import React from "react";
import { useTranslation } from "react-i18next";
import { listPets } from "../api.js";
import { PetCard } from "../components/PetCard.jsx";

export function Donations() {
  const { t } = useTranslation();
  const [pets, setPets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    setLoading(true);
    try {
      const data = await listPets({ donationOnly: "true" });
      setPets(data.pets || []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div>
        <div className="text-2xl font-semibold">{t("nav.donations")}</div>
        <div className="text-white/60">Adoção/Doação responsável 💝</div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-white/60">Carregando…</div>
        ) : pets.length === 0 ? (
          <div className="text-white/60">Nenhuma doação publicada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((p) => <PetCard key={p.id} pet={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
