import { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  setToken as setAuthToken,
  removeToken,
  isAuthenticated as hasValidToken,
} from "../utils/auth";
import { useNavigate} from "react-router-dom";
import { api } from "../utils/api";

const AuthContext = createContext();

const decodeTokenPayload = (token) => {
  try {
    if (!token) return null;

    const payload = token.split(".")[1];

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  useEffect(() => {
    const initializeAuth = () => {
      try {
        const token = getToken();

        if (!token || !hasValidToken()) {
          setUser(null);
          return;
        }

        const storedUser = localStorage.getItem("user");
        const tokenPayload = decodeTokenPayload(token);

        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            setUser({
              ...tokenPayload,
              loggedIn: true,
            });
          }
        } else if (tokenPayload) {
          setUser({
            ...tokenPayload,
            loggedIn: true,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  
  const login = (token, userData) => {
    setAuthToken(token);

    console.log(userData)
    
    const tokenPayload = decodeTokenPayload(token);

    const nextUser = userData
      ? {
          ...userData,
          loggedIn: true,
        }
      : {
          ...tokenPayload,
          loggedIn: true,
        };

    localStorage.setItem("user", JSON.stringify(nextUser));

    setUser(nextUser);
  };

  const updateUser = (updatedFields) => {
    if (!updatedFields || typeof updatedFields !== "object") return;
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updatedFields };
      try {
        localStorage.setItem("user", JSON.stringify(next));
      } catch (e) {
        console.warn("Could not save updated user to localStorage", e);
      }
      return next;
    });
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      navigate("/");
      removeToken();
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        updateUser,
        loading,
        isAuthenticated,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
