import { useState, useEffect } from "react";
import {
  Box, Card, CardContent, TextField, Button, Typography,
  Grid, MenuItem, Select, FormControl, InputLabel,
  FormHelperText, CircularProgress, Divider, Chip, Alert,
  InputAdornment, LinearProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import RouteIcon from "@mui/icons-material/Route";
import WarningIcon from "@mui/icons-material/Warning";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import LandslideIcon from "@mui/icons-material/Landslide";
import SendIcon from "@mui/icons-material/Send";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import { useAuth } from "../context/AuthContext";
import { API } from "../context/AuthContext";
import toast from "react-hot-toast";

const INCIDENT_TYPES = [
  { value: "Accident", label: "Accident", icon: <CarCrashIcon />, color: "#EF4444" },
  { value: "Pothole", label: "Pothole", icon: <LandslideIcon />, color: "#F97316" },
  { value: "Breakdown", label: "Vehicle Breakdown", icon: <WarningIcon />, color: "#F59E0B" },
  { value: "Obstruction", label: "Road Obstruction", icon: <WarningIcon />, color: "#8B5CF6" },
  { value: "Fire", label: "Fire", icon: <LocalFireDepartmentIcon />, color: "#EF4444" },
  { value: "Flood", label: "Flood", icon: <WarningIcon />, color: "#38BDF8" },
  { value: "Other", label: "Other", icon: <WarningIcon />, color: "#94A3B8" },
];

const SEVERITY_LEVELS = [
  { value: "Low", color: "#22C55E", bg: "rgba(34,197,94,0.1)" },
  { value: "Medium", color: "#F59E0B", bg: "rgba(245,158,11,0.1)" },
  { value: "High", color: "#F97316", bg: "rgba(249,115,22,0.1)" },
  { value: "Critical", color: "#EF4444", bg: "rgba(239,68,68,0.1)" },
];

export default function ReportIncident() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    type: "", severity: "", description: "",
    lat: "", lng: "", highway: user?.highway || "", km: "", landmark: "",
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({ ...form, lat: pos.coords.latitude.toFixed(6), lng: pos.coords.longitude.toFixed(6) });
        toast.success("GPS location captured!");
        setGpsLoading(false);
      },
      () => {
        toast.error("Could not get GPS location. Please enter manually.");
        setGpsLoading(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => formData.append(key, form[key]));
      if (photo) formData.append("photo", photo);

      await API.post("/incidents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Incident reported successfully! Admin has been notified.");
      setSubmitted(true);

      // Reset after 3 seconds
      setTimeout(() => {
        setForm({ type: "", severity: "", description: "", lat: "", lng: "", highway: user?.highway || "", km: "", landmark: "" });
        setPhoto(null); setPhotoPreview(null); setSubmitted(false);
      }, 3000);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors && typeof serverErrors === "object") {
        const cleanErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          const val = serverErrors[key];
          cleanErrors[key] = typeof val === "string" ? val : val?.message || "Invalid value";
        });
        setErrors(cleanErrors);
        toast.error("Please fix the errors in the form");
      } else {
        const msg = err.response?.data?.message;
        toast.error(typeof msg === "string" ? msg : "Failed to report incident. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "calc(100vh - 64px)",
      background: "#060E1A",
      p: { xs: 2, md: 4 },
    }}>
      <Box sx={{ maxWidth: 800, mx: "auto" }}>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 1 }}>
            🚨 Report Incident
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {user?.highway} · {user?.name} · {user?.employeeId}
          </Typography>
        </Box>

        {submitted && (
          <Alert severity="success" sx={{ mb: 3, bgcolor: "rgba(34,197,94,0.1)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
            ✅ Incident reported successfully! The admin team has been notified.
          </Alert>
        )}

        <Card>
          <CardContent sx={{ p: { xs: 2, md: 4 } }}>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>

                {/* Incident Type */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 1.5, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                    Incident Type *
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {INCIDENT_TYPES.map((t) => (
                      <Chip
                        key={t.value}
                        label={t.label}
                        icon={t.icon}
                        onClick={() => { setForm({ ...form, type: t.value }); setErrors({ ...errors, type: "" }); }}
                        variant={form.type === t.value ? "filled" : "outlined"}
                        sx={{
                          borderColor: form.type === t.value ? t.color : "rgba(255,255,255,0.15)",
                          bgcolor: form.type === t.value ? `${t.color}22` : "transparent",
                          color: form.type === t.value ? t.color : "text.secondary",
                          "& .MuiChip-icon": { color: "inherit" },
                          cursor: "pointer",
                          "&:hover": { borderColor: t.color, color: t.color },
                          transition: "all 0.2s",
                        }}
                      />
                    ))}
                  </Box>
                  {errors.type && <Typography variant="caption" sx={{ color: "error.main", mt: 0.5, display: "block" }}>{errors.type}</Typography>}
                </Grid>

                {/* Severity */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 1.5, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                    Severity Level *
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                    {SEVERITY_LEVELS.map((s) => (
                      <Box
                        key={s.value}
                        onClick={() => { setForm({ ...form, severity: s.value }); setErrors({ ...errors, severity: "" }); }}
                        sx={{
                          px: 3, py: 1.2, borderRadius: 2, cursor: "pointer",
                          border: "2px solid",
                          borderColor: form.severity === s.value ? s.color : "rgba(255,255,255,0.1)",
                          bgcolor: form.severity === s.value ? s.bg : "transparent",
                          color: form.severity === s.value ? s.color : "text.secondary",
                          fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1,
                          transition: "all 0.2s",
                          "&:hover": { borderColor: s.color },
                        }}
                      >
                        {s.value}
                      </Box>
                    ))}
                  </Box>
                  {errors.severity && <Typography variant="caption" sx={{ color: "error.main", mt: 0.5, display: "block" }}>{errors.severity}</Typography>}
                </Grid>

                <Grid item xs={12}><Divider sx={{ borderColor: "rgba(245,158,11,0.1)" }} /></Grid>

                {/* Location */}
                <Grid item xs={12}>
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography variant="h6" sx={{ color: "text.secondary", fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                      📍 Location Details *
                    </Typography>
                    <Button
                      size="small" startIcon={gpsLoading ? <CircularProgress size={14} /> : <GpsFixedIcon />}
                      onClick={getGPS} disabled={gpsLoading}
                      sx={{ color: "secondary.main", borderColor: "secondary.main", fontSize: 11 }}
                      variant="outlined"
                    >
                      {gpsLoading ? "Getting GPS..." : "Auto GPS"}
                    </Button>
                  </Box>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <TextField {...{ name: "lat", value: form.lat, onChange: handleChange, error: !!errors.lat, helperText: errors.lat, fullWidth: true }} label="Latitude" placeholder="28.6139" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField {...{ name: "lng", value: form.lng, onChange: handleChange, error: !!errors.lng, helperText: errors.lng, fullWidth: true }} label="Longitude" placeholder="77.2090" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField {...{ name: "highway", value: form.highway, onChange: handleChange, fullWidth: true }} label="Highway" size="small" />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <TextField {...{ name: "km", value: form.km, onChange: handleChange, error: !!errors.km, helperText: errors.km, fullWidth: true }} label="KM Mark" placeholder="342" size="small" type="number" />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        name="landmark" value={form.landmark} onChange={handleChange} fullWidth
                        label="Landmark (optional)" placeholder="Near Sohna Toll Plaza"
                        InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: "primary.main", fontSize: 18 }} /></InputAdornment> }}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    name="description" value={form.description} onChange={handleChange}
                    error={!!errors.description} helperText={errors.description}
                    label="Incident Description *" multiline rows={4} fullWidth
                    placeholder="Describe the incident in detail — number of vehicles involved, injuries, road condition, etc."
                  />
                </Grid>

                {/* Photo Upload */}
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ color: "text.secondary", mb: 1.5, fontSize: 13, letterSpacing: 2, textTransform: "uppercase" }}>
                    📷 Upload Photo
                  </Typography>
                  <Box sx={{
                    border: "2px dashed rgba(245,158,11,0.3)", borderRadius: 2, p: 2,
                    textAlign: "center", cursor: "pointer",
                    "&:hover": { borderColor: "rgba(245,158,11,0.6)", bgcolor: "rgba(245,158,11,0.03)" },
                    transition: "all 0.2s",
                  }}>
                    {photoPreview ? (
                      <Box>
                        <img src={photoPreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: "cover" }} />
                        <Typography variant="caption" display="block" sx={{ color: "success.main", mt: 1 }}>✅ Photo selected</Typography>
                      </Box>
                    ) : (
                      <label htmlFor="photo-upload" style={{ cursor: "pointer" }}>
                        <PhotoCameraIcon sx={{ fontSize: 40, color: "primary.main", opacity: 0.6 }} />
                        <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
                          Click to upload incident photo
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>JPG, PNG up to 5MB</Typography>
                      </label>
                    )}
                    <input id="photo-upload" type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
                  </Box>
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                  <Button
                    type="submit" variant="contained" color="primary"
                    fullWidth size="large" disabled={loading}
                    startIcon={loading ? <CircularProgress size={20} sx={{ color: "background.default" }} /> : <SendIcon />}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? "Submitting Report..." : "Submit Incident Report"}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}