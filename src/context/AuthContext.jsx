import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();
const MY_FINANCES_SECURE_KEY = import.meta.env.VITE_MY_FINANCES_SECURE_KEY;

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [validKey, setValidKey] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem(MY_FINANCES_SECURE_KEY);
    if (saved) {
      setValidKey(saved);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ validKey, setValidKey }}>
      {children}
    </AuthContext.Provider>
  );
}