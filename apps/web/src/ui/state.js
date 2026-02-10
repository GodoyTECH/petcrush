import React from "react";
import { devLogin, getMe, oauthApple, oauthGoogle, requestOtp, verifyOtp } from "./api.js";

const AuthCtx = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(localStorage.getItem("pc_token") || "");
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(Boolean(token));

  async function applySession(data) {
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("pc_token", data.token);
  }

  async function loginDev(email) {
    const data = await devLogin(email);
    await applySession(data);
  }

  async function loginWithOtp(email, code) {
    const data = await verifyOtp(email, code);
    await applySession(data);
  }

  async function loginWithGoogle(idToken) {
    const data = await oauthGoogle(idToken);
    await applySession(data);
  }

  async function loginWithApple(idToken) {
    const data = await oauthApple(idToken);
    await applySession(data);
  }

  async function requestOtpCode(email) {
    return requestOtp(email);
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("pc_token");
  }

  React.useEffect(() => {
    let ignore = false;

    async function hydrate() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getMe(token);
        if (!ignore) setUser(data.user);
      } catch {
        if (!ignore) logout();
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    hydrate();
    return () => { ignore = true; };
  }, [token]);

  return (
    <AuthCtx.Provider
      value={{
        token,
        user,
        loading,
        requestOtpCode,
        loginWithOtp,
        loginWithGoogle,
        loginWithApple,
        loginDev,
        logout,
        isAuthed: !!token
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
