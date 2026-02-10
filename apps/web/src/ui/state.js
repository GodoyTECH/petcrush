import React from "react";
import { devLogin } from "./api.js";

const AuthCtx = React.createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = React.useState(localStorage.getItem("pc_token") || "");
  const [user, setUser] = React.useState(null);

  async function login(email) {
    const data = await devLogin(email);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("pc_token", data.token);
  }

  function logout() {
    setToken("");
    setUser(null);
    localStorage.removeItem("pc_token");
  }

  return (
    <AuthCtx.Provider value={{ token, user, login, logout, isAuthed: !!token }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const v = React.useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
