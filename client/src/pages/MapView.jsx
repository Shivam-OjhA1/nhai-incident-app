import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  Box, Card, CardContent, Typography, Chip, Grid,
  FormControl, InputLabel, Select, MenuItem, CircularProgress,
} from "@mui/material";
import { API } from "../context/AuthContext";
import toast from "react-hot-toast";

// Fix leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const SEVERITY_COLORS = {
  Low: "#22C55E", Medium: "#F59E0B", High: "#F97316", Critical: "#EF4444",
};

const createColoredIcon = (color) =>
  L.divIcon({
    className: "",
    html: `<div style="
      width: 16px; height: 16px; border-radius: 50%;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 0 8px ${color}88;
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });

export default function MapView() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", severity: "" });

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const params = new URLSearchParams();
        if (filter.status) params.append("status", filter.status);
        if (filter.severity) params.append("severity", filter.severity);
        const { data } = await API.get(`/incidents?${params}`);
        setIncidents(data.data.filter((i) => i.location?.lat && i.location?.lng));
      } catch {
        toast.error("Failed to load map data");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [filter]);

  const center = [20.5937, 78.9629]; // Center of India

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", background: "#060E1A", p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>Live Incident Map</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>Real-time highway incident locations across India</Typography>
        </Box>

        {/* Filters + Legend */}
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={6} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>Status</InputLabel>
                  <Select value={filter.status} label="Status"
                    onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.2)" } }}>
                    <MenuItem value="">All</MenuItem>
                    {["Pending", "Assigned", "In Progress", "Resolved"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={2}>
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>Severity</InputLabel>
                  <Select value={filter.severity} label="Severity"
                    onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
                    sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.2)" } }}>
                    <MenuItem value="">All</MenuItem>
                    {["Low", "Medium", "High", "Critical"].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              {/* Legend */}
              <Grid item xs={12} sm={8}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  {Object.entries(SEVERITY_COLORS).map(([label, color]) => (
                    <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: color, boxShadow: `0 0 6px ${color}` }} />
                      <Typography variant="caption" sx={{ color: "text.secondary" }}>{label}</Typography>
                    </Box>
                  ))}
                  <Typography variant="caption" sx={{ color: "text.secondary", ml: 1 }}>
                    · {incidents.length} incidents shown
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Map */}
        <Card sx={{ overflow: "hidden" }}>
          {loading ? (
            <Box sx={{ height: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress sx={{ color: "primary.main" }} />
            </Box>
          ) : (
            <Box sx={{ height: 600, "& .leaflet-container": { height: "100%", background: "#0A1628" } }}>
              <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                {incidents.map((inc) => (
                  <Marker
                    key={inc._id}
                    position={[inc.location.lat, inc.location.lng]}
                    icon={createColoredIcon(SEVERITY_COLORS[inc.severity] || "#94A3B8")}
                  >
                    <Popup>
                      <Box sx={{ fontFamily: "'Barlow', sans-serif", minWidth: 200 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0A1628" }}>
                          🚨 {inc.type}
                        </Typography>
                        <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                          <Chip label={inc.severity} size="small"
                            sx={{ bgcolor: `${SEVERITY_COLORS[inc.severity]}22`, color: SEVERITY_COLORS[inc.severity], fontSize: 10, height: 18 }} />
                          <Chip label={inc.status} size="small" sx={{ fontSize: 10, height: 18 }} />
                        </Box>
                        <Typography variant="caption" display="block" sx={{ mt: 1, color: "#475569" }}>
                          📍 {inc.location.highway} · KM {inc.location.km}
                        </Typography>
                        {inc.location.landmark && (
                          <Typography variant="caption" display="block" sx={{ color: "#475569" }}>
                            🏢 {inc.location.landmark}
                          </Typography>
                        )}
                        <Typography variant="caption" display="block" sx={{ mt: 0.5, color: "#475569" }}>
                          👤 {inc.reportedBy?.name}
                        </Typography>
                        <Typography variant="caption" display="block" sx={{ color: "#94A3B8" }}>
                          {new Date(inc.createdAt).toLocaleString("en-IN")}
                        </Typography>
                        {inc.description && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5, color: "#334155", fontStyle: "italic" }}>
                            "{inc.description.slice(0, 80)}..."
                          </Typography>
                        )}
                      </Box>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Box>
          )}
        </Card>
      </Box>
    </Box>
  );
}
