const USER_KEY = "@FinalizaTCC:user";
const LEGACY_TOKEN_KEY = "@FinalizaTCC:token";

export function getStoredUser() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Erro ao restaurar sessao:", error);
    clearStoredUser();
    return null;
  }
}

export function storeUser(user) {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
