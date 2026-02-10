import React from "react";
import { useTranslation } from "react-i18next";
import { listPets } from "../api.js";
import { PetCard } from "../components/PetCard.jsx";

export function Discover() {
  const { t } = useTranslation();
  const [pets, setPets] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [filters, setFilters] = React.useState({
    species: "",
    breed: "",
    gender: "",
    objective: "",
    region: ""
  });

  async function load() {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
      const data = await listPets(params);
      setPets(data.pets || []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-2xl font-semibold">{t("nav.discover")}</div>
          <div className="text-white/60">{t("tagline")}</div>
        </div>
        <button
          className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10"
          onClick={load}
        >
          🔎 Filtrar
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input className="md:col-span-1 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 outline-none"
          placeholder={t("filters.species")} value={filters.species}
          onChange={(e) => setFilters(v => ({...v, species: e.target.value}))}/>
        <input className="md:col-span-1 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 outline-none"
          placeholder={t("filters.breed")} value={filters.breed}
          onChange={(e) => setFilters(v => ({...v, breed: e.target.value}))}/>
        <select className="md:col-span-1 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 outline-none"
          value={filters.gender} onChange={(e) => setFilters(v => ({...v, gender: e.target.value}))}>
          <option value="">{t("filters.gender")}</option>
          <option value="MALE">{t("gender.male")}</option>
          <option value="FEMALE">{t("gender.female")}</option>
        </select>
        <select className="md:col-span-1 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 outline-none"
          value={filters.objective} onChange={(e) => setFilters(v => ({...v, objective: e.target.value}))}>
          <option value="">{t("filters.objective")}</option>
          <option value="BREEDING">{t("objective.breeding")}</option>
          <option value="COMPANIONSHIP">{t("objective.companionship")}</option>
          <option value="SOCIALIZATION">{t("objective.socialization")}</option>
        </select>
        <input className="md:col-span-1 px-3 py-2 rounded-2xl bg-white/5 border border-white/10 outline-none"
          placeholder={t("filters.region")} value={filters.region}
          onChange={(e) => setFilters(v => ({...v, region: e.target.value}))}/>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="text-white/60">Carregando…</div>
        ) : pets.length === 0 ? (
          <div className="text-white/60">Nada encontrado. Tente outros filtros.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pets.map((p) => <PetCard key={p.id} pet={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
