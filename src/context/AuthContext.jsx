import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { LoadingSpinner } from "../components";

const STORAGE_KEY = "talentlink.auth";
const AuthContext = createContext(null);

function readPersistedAuth() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    return value ? JSON.parse(value) : { user: null };
  } catch {
    return { user: null };
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => readPersistedAuth().user);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      if (user) {
        try {
          // Verify session validity with backend
          await api.get("/verification/status");
        } catch (error) {
          // If 401, interceptor handles logout; but we ensure UI is ready
          if (error?.response?.status === 401) {
            setUser(null);
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }
      setIsInitializing(false);
    };

    checkSession();
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      setAuthUser(nextUser) {
        setUser(nextUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser }));
      },
      clearAuth() {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
      },
      logout() {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        navigate("/login", { replace: true });
      },
    }),
    [user, navigate]
  );

  useEffect(() => {
    const onUnauthorized = () => {
      setUser(null);
      localStorage.removeItem(STORAGE_KEY);
      navigate("/login", { replace: true });
    };

    window.addEventListener("talentlink:unauthorized", onUnauthorized);
    return () => {
      window.removeEventListener("talentlink:unauthorized", onUnauthorized);
    };
  }, [navigate]);

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <LoadingSpinner className="h-12 w-12 text-brandViolet" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
