import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Alert, Divider,
} from "@mui/material";
import BadgeIcon from "@mui/icons-material/Badge";
import LockIcon from "@mui/icons-material/Lock";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ employeeId: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form.employeeId, form.password);
      toast.success(data.message);
      navigate(data.data.role === "admin" ? "/dashboard" : "/report");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
      else toast.error(err.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 20% 50%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(56,189,248,0.06) 0%, transparent 50%), #060E1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      p: 2, position: "relative", overflow: "hidden",
    }}>
      {/* Background road lines decoration */}
      {[...Array(6)].map((_, i) => (
        <Box key={i} sx={{
          position: "absolute", left: `${10 + i * 15}%`, top: 0, bottom: 0,
          width: "2px", background: "linear-gradient(180deg, transparent, rgba(245,158,11,0.05), transparent)",
          pointerEvents: "none",
        }} />
      ))}

      <Card sx={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Logo */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))",
              border: "2px solid rgba(245,158,11,0.4)", mb: 2,
            }}>
              <WarningAmberIcon sx={{ color: "primary.main", fontSize: 32 }} />
            </Box>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 3 }}>
              NHAI
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", letterSpacing: 2, textTransform: "uppercase", fontSize: 11 }}>
              Highway Incident Reporting System
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: "rgba(245,158,11,0.15)" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", px: 1 }}>STAFF LOGIN</Typography>
          </Divider>

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            <TextField
              name="employeeId"
              label="Employee ID"
              placeholder="e.g. NHAI001"
              value={form.employeeId}
              onChange={handleChange}
              error={!!errors.employeeId}
              helperText={errors.employeeId}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              name="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "primary.main", fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                      {showPassword ? <VisibilityOff sx={{ color: "text.secondary" }} /> : <Visibility sx={{ color: "text.secondary" }} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5 }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: "background.default" }} /> : "Login to System"}
            </Button>
          </Box>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
            New staff member?{" "}
            <Link to="/register" style={{ color: "#F59E0B", textDecoration: "none", fontWeight: 600 }}>
              Register Here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
