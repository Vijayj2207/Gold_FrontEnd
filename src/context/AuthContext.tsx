import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "@/services/userService";

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (loginData: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  /* ── Check token on page refresh ── */
  useEffect(() => {
    const storedToken = localStorage.getItem("token");

    if (storedToken) {
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));

        if (payload.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("token");
        }
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  /* ── Login ── */
  const login = async (loginData: { email: string; password: string }) => {
    const data = await loginUser(loginData);

    // API returned error message or no token
    if (!data || !data.token) {
      throw new Error(
        data?.message || "Login failed. Please check your credentials.",
      );
    }

    // ✅ Success — save token and redirect
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  /* ── Logout ── */
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
