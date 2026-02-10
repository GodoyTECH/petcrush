import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Logo } from "./Logo.jsx";
import { useAuth } from "../state.js";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID;

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

function AuthPanel() {
  const {
    isAuthed,
    loading,
    requestOtpCode,
    loginWithOtp,
    loginWithGoogle,
    loginWithApple,
    loginDev,
    logout
  } = useAuth();
  const [email, setEmail] = React.useState("demo@petcrush.app");
  const [code, setCode] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const googleRef = React.useRef(null);

  React.useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleRef.current || !window.google || isAuthed) return;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async ({ credential }) => {
        try {
          setStatus("Validando conta Google...");
          await loginWithGoogle(credential);
          setStatus("Login com Google concluído.");
        } catch (error) {
          setStatus(`Erro no Google login: ${error.message}`);
        }
      }
    });

    googleRef.current.innerHTML = "";
    window.google.accounts.id.renderButton(googleRef.current, {
      theme: "outline",
      size: "medium",
      shape: "pill",
      text: "signin_with"
    });
  }, [isAuthed, loginWithGoogle]);

  React.useEffect(() => {
    if (!APPLE_CLIENT_ID || !window.AppleID) return;
    window.AppleID.auth.init({
      clientId: APPLE_CLIENT_ID,
      scope: "name email",
      redirectURI: window.location.origin,
      usePopup: true
    });
  }, []);

  async function handleRequestOtp() {
    setSending(true);
    try {
      const data = await requestOtpCode(email);
      setStatus(`Código enviado (${data.delivery}). Verifique seu e-mail.`);
    } catch (error) {
      setStatus(`Falha ao enviar código: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  async function handleVerifyOtp() {
    setSending(true);
    try {
      await loginWithOtp(email, code);
      setStatus("Login por código confirmado.");
    } catch (error) {
      setStatus(`Código inválido: ${error.message}`);
    } finally {
      setSending(false);
    }
  }

  async function handleAppleLogin() {
    if (!window.AppleID) {
      setStatus("Apple Sign-In indisponível. Defina VITE_APPLE_CLIENT_ID.");
      return;
    }

    try {
      const response = await window.AppleID.auth.signIn();
      const idToken = response?.authorization?.id_token;
      if (!idToken) throw new Error("Token Apple não recebido");
      await loginWithApple(idToken);
      setStatus("Login com Apple concluído.");
    } catch (error) {
      setStatus(`Falha no login Apple: ${error.message}`);
    }
  }

  if (loading) {
    return <div className="text-xs text-white/70">Carregando sessão…</div>;
  }

  if (isAuthed) {
    return (
      <button className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5" onClick={logout}>
        Sair
      </button>
    );
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="hidden xl:flex items-center gap-2">
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none w-56"
          placeholder="email"
        />
        <button
          className="px-3 py-2 rounded-xl text-sm bg-gold text-slate-950 font-semibold hover:opacity-90 disabled:opacity-60"
          onClick={handleRequestOtp}
          disabled={sending}
        >
          Enviar OTP
        </button>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm outline-none w-24"
          placeholder="123456"
          maxLength={6}
        />
        <button
          className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5 disabled:opacity-60"
          onClick={handleVerifyOtp}
          disabled={sending || code.length !== 6}
        >
          Entrar
        </button>
      </div>

      <div className="hidden xl:flex items-center gap-2">
        {GOOGLE_CLIENT_ID ? <div ref={googleRef} /> : <span className="text-xs text-white/60">Google indisponível</span>}
        <button className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5" onClick={handleAppleLogin}>
          Entrar com Apple
        </button>
        {import.meta.env.DEV && (
          <button
            className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
            onClick={() => loginDev(email)}
          >
            dev-login
          </button>
        )}
      </div>

      {status ? <div className="text-xs text-white/70 max-w-[320px] text-right">{status}</div> : null}
    </div>
  );
}

export function TopNav() {
  const { t, i18n } = useTranslation();

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

        <div className="flex items-center gap-3">
          <button
            className="px-3 py-2 rounded-xl text-sm border border-white/10 hover:bg-white/5"
            onClick={() => i18n.changeLanguage(i18n.language === "pt-BR" ? "en" : "pt-BR")}
            title="Toggle language"
          >
            {i18n.language === "pt-BR" ? "PT" : "EN"}
          </button>

          <AuthPanel />
        </div>
      </div>
    </div>
  );
}
