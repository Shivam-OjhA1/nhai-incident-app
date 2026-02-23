import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API = axios.create({ baseURL: "https://highway-incident-reporting.onrender.com" });

// Attach JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (employeeId, password) => {
    const { data } = await API.post("/auth/login", { employeeId, password });
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  const register = async (formData) => {
    const { data } = await API.post("/auth/register", formData);
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user", JSON.stringify(data.data));
    setUser(data.data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, API }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export { API };
