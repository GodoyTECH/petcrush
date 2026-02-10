import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo.jsx";
import { useAuth } from "../state.js";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        "px-3 py-2 rounded-xl text-sm transition border border-white/10 " +
        (isActive ? "bg-white/10 shadow-glow" : "hover:bg-white/5")
      }
    >
      {children}
    </NavLink>
  );
}

export function TopNav() {
  const { t, i18n } = useTranslation();
  const { isAuthed, login, logout } = useAuth();
  const [email, setEmail] = React.useState("demo@petcusher.app");

  return (
    <div className="sticky top-0 z-30 backdrop-blur bg-slate-950/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Logo />

        <div className="hidden md:flex items-center gap-2">
          <NavItem to="/">{t("nav.discover")}</NavItem>
          <NavItem to="/donations">{t("nav.donations")}</NavItem>
          <NavItem to="/chat">{t("nav.chat")}</NavItem>
          <NavItem to="/profile">{t("nav.profile")}</NavItem>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
            onClick={() => i18n.changeLanguage(i18n.language === "pt-BR" ? "en" : "pt-BR")}
            title="Toggle language"
          >
            {i18n.language === "pt-BR" ? "PT" : "EN"}
          </button>

          <div className="hidden sm:flex items-center gap-2">
            {!isAuthed ? (
              <>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none w-56"
                  placeholder="email"
                />
                <button
                  className="px-3 py-2 rounded-xl text-sm bg-gold text-slate-950 font-semibold hover:opacity-90"
                  onClick={() => login(email)}
                >
                  {t("actions.login")}
                </button>
              </>
            ) : (
              <button
                className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
                onClick={logout}
              >
                {t("actions.logout")}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
