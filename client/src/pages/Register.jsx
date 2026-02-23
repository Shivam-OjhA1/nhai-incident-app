import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  InputAdornment, IconButton, CircularProgress, Grid,
  MenuItem, Select, FormControl, InputLabel, FormHelperText, Divider,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import PhoneIcon from "@mui/icons-material/Phone";
import RouteIcon from "@mui/icons-material/Route";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const HIGHWAYS = [
  "NH-1","NH-2","NH-4","NH-5","NH-6","NH-7","NH-8",
  "NH-10","NH-19","NH-24","NH-27","NH-44","NH-48",
  "NH-52","NH-58","NH-66","NH-71","NH-76","NH-92",
  "NH-104","NH-148","Other",
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", employeeId: "", email: "",
    password: "", confirmPassword: "",
    role: "staff", highway: "", phone: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
      const data = await register(form);
      toast.success(data.message);
      navigate(form.role === "admin" ? "/dashboard" : "/report");
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) setErrors(serverErrors);
      else toast.error(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  const fieldProps = (name) => ({
    name, value: form[name], onChange: handleChange,
    error: !!errors[name], helperText: errors[name], fullWidth: true,
  });

  return (
    <Box sx={{
      minHeight: "100vh",
      background: "radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(56,189,248,0.06) 0%, transparent 50%), #060E1A",
      display: "flex", alignItems: "center", justifyContent: "center",
      p: 2, py: 4,
    }}>
      <Card sx={{ width: "100%", maxWidth: 600, position: "relative", zIndex: 1 }}>
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Box sx={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 56, height: 56, borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))",
              border: "2px solid rgba(245,158,11,0.4)", mb: 1.5,
            }}>
              <WarningAmberIcon sx={{ color: "primary.main", fontSize: 28 }} />
            </Box>
            <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}>
              NHAI STAFF REGISTRATION
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Create your Highway Incident Reporting account
            </Typography>
          </Box>

          <Divider sx={{ mb: 3, borderColor: "rgba(245,158,11,0.15)" }} />

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2.5}>

              {/* Full Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...fieldProps("name")}
                  label="Full Name"
                  placeholder="Shivam Ojha"
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>

              {/* Employee ID */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...fieldProps("employeeId")}
                  label="Employee ID"
                  placeholder="NHAI001"
                  InputProps={{ startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <TextField
                  {...fieldProps("email")}
                  label="Email Address"
                  type="email"
                  placeholder="shivam@nhai.gov.in"
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment> }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...fieldProps("password")}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} size="small">
                          {showPassword ? <VisibilityOff sx={{ color: "text.secondary" }} /> : <Visibility sx={{ color: "text.secondary" }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  {...fieldProps("confirmPassword")}
                  label="Confirm Password"
                  type={showConfirm ? "text" : "password"}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirm(!showConfirm)} size="small">
                          {showConfirm ? <VisibilityOff sx={{ color: "text.secondary" }} /> : <Visibility sx={{ color: "text.secondary" }} />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Role */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.role}>
                  <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>Role</InputLabel>
                  <Select
                    name="role" value={form.role} onChange={handleChange} label="Role"
                    startAdornment={<InputAdornment position="start"><SupervisorAccountIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment>}
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.3)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.6)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F59E0B" } }}
                  >
                    <MenuItem value="staff">Field Staff</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Highway */}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.highway}>
                  <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>Assigned Highway</InputLabel>
                  <Select
                    name="highway" value={form.highway} onChange={handleChange} label="Assigned Highway"
                    startAdornment={<InputAdornment position="start"><RouteIcon sx={{ color: "primary.main", fontSize: 20 }} /></InputAdornment>}
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.3)" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.6)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F59E0B" } }}
                  >
                    {HIGHWAYS.map((h) => <MenuItem key={h} value={h}>{h}</MenuItem>)}
                  </Select>
                  {errors.highway && <FormHelperText>{errors.highway}</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Phone */}
              <Grid item xs={12}>
                <TextField
                  {...fieldProps("phone")}
                  label="Mobile Number"
                  placeholder="9140398127"
                  inputProps={{ maxLength: 10 }}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: "primary.main", fontSize: 20 }} /><Typography sx={{ color: "text.secondary", ml: 0.5, mr: 0.5 }}>+91</Typography></InputAdornment> }}
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button
                  type="submit" variant="contained" color="primary"
                  fullWidth size="large" disabled={loading} sx={{ py: 1.5, mt: 1 }}
                >
                  {loading ? <CircularProgress size={22} sx={{ color: "background.default" }} /> : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "text.secondary" }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#F59E0B", textDecoration: "none", fontWeight: 600 }}>
              Login Here
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
