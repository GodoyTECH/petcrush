import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  "pt-BR": {
    translation: {
      brand: "PetCusher",
      tagline: "Onde pets encontram o match perfeito 🐾❤️",
      nav: { discover: "Publicações", donations: "Doações", chat: "Chat", profile: "Meu Perfil" },
      safety: "Aviso: acordos, valores e cuidados devem ser combinados entre os tutores. O PetCusher não se responsabiliza por negociações.",
      actions: { like: "Dar Match", pass: "Pular", message: "Enviar mensagem", login: "Entrar", logout: "Sair" },
      filters: { species: "Espécie", breed: "Raça", gender: "Gênero", region: "Região", objective: "Objetivo" },
      objective: { breeding: "Cruzamento", companionship: "Companhia", socialization: "Socialização" },
      gender: { male: "Macho", female: "Fêmea" },
      donationOnly: "Adoção / Doação"
    }
  },
  "en": {
    translation: {
      brand: "PetCusher",
      tagline: "Where pets find the perfect match 🐾❤️",
      nav: { discover: "Listings", donations: "Donations", chat: "Chat", profile: "My Profile" },
      safety: "Notice: agreements, fees and care are between guardians. PetCusher is not responsible for negotiations.",
      actions: { like: "Match", pass: "Skip", message: "Send message", login: "Sign in", logout: "Sign out" },
      filters: { species: "Species", breed: "Breed", gender: "Gender", region: "Region", objective: "Goal" },
      objective: { breeding: "Breeding", companionship: "Companionship", socialization: "Socialization" },
      gender: { male: "Male", female: "Female" },
      donationOnly: "Adoption / Donation"
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "pt-BR",
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
