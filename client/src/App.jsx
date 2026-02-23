import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Toaster } from "react-hot-toast";
import theme from "./theme";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportIncident from "./pages/ReportIncident";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import Navbar from "./components/Navbar";

// Protected Route
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/report" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={!user ? <Home /> : <Navigate to={user.role === "admin" ? "/dashboard" : "/report"} />} />

        {/* Auth Pages */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to={user.role === "admin" ? "/dashboard" : "/report"} />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={user.role === "admin" ? "/dashboard" : "/report"} />} />

        {/* Protected Pages */}
        <Route path="/report" element={<ProtectedRoute><ReportIncident /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute adminOnly><Dashboard /></ProtectedRoute>} />
        <Route path="/map" element={<ProtectedRoute adminOnly><MapView /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0D1F35",
            color: "#F1F5F9",
            border: "1px solid rgba(245,158,11,0.3)",
            fontFamily: "'Barlow', sans-serif",
          },
          success: { iconTheme: { primary: "#22C55E", secondary: "#0D1F35" } },
          error: { iconTheme: { primary: "#EF4444", secondary: "#0D1F35" } },
        }}
      />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}