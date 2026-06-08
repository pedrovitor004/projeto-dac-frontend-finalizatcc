/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { login as apiLogin } from "../services/api";
import { clearStoredUser, getStoredUser, storeUser } from "../lib/session";

const AuthContext = createContext();

function normalizeUser(response) {
  return {
    id: response.id,
    nome: response.nome,
    email: response.email,
    tipo: response.tipo,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = getStoredUser();

    if (storedUser) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }

    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    setLoading(true);

    try {
      const response = await apiLogin(email, senha);
      const userData = normalizeUser(response);

      storeUser(userData);
      setUser(userData);
      setIsAuthenticated(true);

      return userData;
    } catch (error) {
      const errorMessage = error.message || "Erro ao fazer login";

      clearStoredUser();
      setIsAuthenticated(false);
      setUser(null);

      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredUser();
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Voce foi desconectado");
  };

  const updateUser = (updates) => {
    setUser((current) => {
      if (!current) return current;
      const next = { ...current, ...updates };
      storeUser(next);
      return next;
    });
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }

  return context;
}
