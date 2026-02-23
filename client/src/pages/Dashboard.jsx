import { useState, useEffect } from "react";
import {
  Box, Grid, Card, CardContent, Typography, Chip, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Select, MenuItem, FormControl, InputLabel, IconButton,
  CircularProgress, TextField, InputAdornment, Dialog, DialogContent,
  DialogTitle, Divider, Avatar, Tooltip, Badge, Drawer, Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import RouteIcon from "@mui/icons-material/Route";
import PhotoIcon from "@mui/icons-material/Photo";
import NoteAltIcon from "@mui/icons-material/NoteAlt";
import GroupsIcon from "@mui/icons-material/Groups";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneIcon from "@mui/icons-material/Phone";
import { useNavigate } from "react-router-dom";
import { API } from "../context/AuthContext";
import toast from "react-hot-toast";

const STATUS_COLORS = {
  Pending:      { color: "#F59E0B", bg: "rgba(245,158,11,0.12)" },
  Assigned:     { color: "#38BDF8", bg: "rgba(56,189,248,0.12)" },
  "In Progress":{ color: "#F97316", bg: "rgba(249,115,22,0.12)" },
  Resolved:     { color: "#22C55E", bg: "rgba(34,197,94,0.12)" },
};

const SEVERITY_COLORS = {
  Low: "#22C55E", Medium: "#F59E0B", High: "#F97316", Critical: "#EF4444",
};

const TYPE_EMOJI = {
  Accident: "💥", Pothole: "🕳️", Breakdown: "🚗", 
  Obstruction: "🚧", Fire: "🔥", Flood: "🌊", Other: "⚠️",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, icon, color, subtitle }) => (
  <Card sx={{ height: "100%", position: "relative", overflow: "hidden" }}>
    <Box sx={{ position: "absolute", right: -8, top: -8, opacity: 0.06, fontSize: 90 }}>{icon}</Box>
    <CardContent sx={{ p: 3 }}>
      <Typography variant="body2" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 11, mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="h3" sx={{ color, fontWeight: 700, lineHeight: 1 }}>{value ?? "—"}</Typography>
      {subtitle && <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>{subtitle}</Typography>}
    </CardContent>
  </Card>
);

// ─── Detail Row ───────────────────────────────────────────────────────────────
const DetailRow = ({ icon, label, value, valueColor }) => (
  <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1 }}>
    <Box sx={{ color: "primary.main", mt: 0.2, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 1, fontSize: 10 }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: valueColor || "text.primary", fontWeight: 500 }}>{value || "—"}</Typography>
    </Box>
  </Box>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", type: "", severity: "" });
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState(null);

  // Detail Modal State
  const [selected, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [assignedTeam, setAssignedTeam] = useState("");
  const [modalStatus, setModalStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.type) params.append("type", filter.type);
      if (filter.severity) params.append("severity", filter.severity);
      const [incRes, statRes] = await Promise.all([
        API.get(`/incidents?${params}`),
        API.get("/incidents/stats"),
      ]);
      setIncidents(incRes.data.data);
      setStats(statRes.data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [filter]);

  // Open detail modal
  const openModal = (inc) => {
    setSelected(inc);
    setAdminNotes(inc.adminNotes || "");
    setAssignedTeam(inc.assignedTeam || "");
    setModalStatus(inc.status);
    setImgError(false);
    setDeleteConfirm(false);
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setSelected(null); };

  // Update status from table dropdown
  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await API.put(`/admin/incidents/${id}`, { status });
      toast.success(`Status updated to ${status}`);
      fetchData();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  // Save from modal (status + team + notes)
  const saveModal = async () => {
    setSaving(true);
    try {
      await API.put(`/admin/incidents/${selected._id}`, {
        status: modalStatus,
        assignedTeam,
        adminNotes,
      });
      toast.success("Incident updated successfully!");
      fetchData();
      closeModal();
    } catch {
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // Delete incident
  const deleteIncident = async () => {
    try {
      await API.delete(`/admin/incidents/${selected._id}`);
      toast.success("Incident deleted!");
      fetchData();
      closeModal();
    } catch {
      toast.error("Failed to delete incident");
    }
  };

  const filtered = incidents.filter(
    (i) =>
      i.location?.highway?.toLowerCase().includes(search.toLowerCase()) ||
      i.type?.toLowerCase().includes(search.toLowerCase()) ||
      i.reportedBy?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: "calc(100vh - 64px)", background: "#060E1A", p: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>

        {/* ── Header ── */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ color: "primary.main", fontWeight: 700 }}>Admin Dashboard</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              National Highways Authority of India — Incident Control
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button startIcon={<MapIcon />} variant="outlined" color="secondary"
              onClick={() => navigate("/map")} sx={{ borderColor: "rgba(56,189,248,0.4)" }}>
              Live Map
            </Button>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchData} sx={{ color: "primary.main", border: "1px solid rgba(245,158,11,0.3)" }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Stat Cards ── */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={3}>
            <StatCard title="Total Incidents" value={stats?.totalIncidents} icon={<TrendingUpIcon />} color="#F1F5F9" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Pending" value={stats?.pendingIncidents} icon={<PendingIcon />} color="#F59E0B" subtitle="Awaiting action" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Resolved" value={stats?.resolvedIncidents} icon={<CheckCircleIcon />} color="#22C55E" subtitle="Closed incidents" />
          </Grid>
          <Grid item xs={6} sm={3}>
            <StatCard title="Critical" value={stats?.criticalIncidents} icon={<WarningIcon />} color="#EF4444" subtitle="High priority" />
          </Grid>
        </Grid>

        {/* ── Filters ── */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <TextField
                  size="small" fullWidth placeholder="Search highway, type, reporter, description..."
                  value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary", fontSize: 18 }} /></InputAdornment> }}
                />
              </Grid>
              {[
                { label: "Status", key: "status", options: ["Pending", "Assigned", "In Progress", "Resolved"] },
                { label: "Type", key: "type", options: ["Accident", "Pothole", "Breakdown", "Obstruction", "Fire", "Flood", "Other"] },
                { label: "Severity", key: "severity", options: ["Low", "Medium", "High", "Critical"] },
              ].map((f) => (
                <Grid item xs={6} sm={2.5} key={f.key}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>{f.label}</InputLabel>
                    <Select value={filter[f.key]} label={f.label}
                      onChange={(e) => setFilter({ ...filter, [f.key]: e.target.value })}
                      sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.2)" } }}>
                      <MenuItem value="">All</MenuItem>
                      {f.options.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              ))}
              <Grid item xs={6} sm={1}>
                <Button size="small" onClick={() => { setFilter({ status: "", type: "", severity: "" }); setSearch(""); }}
                  sx={{ color: "text.secondary" }}>Clear</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ── Incidents Table ── */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(245,158,11,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ color: "text.primary" }}>
                Incidents
                <Chip label={filtered.length} size="small" sx={{ ml: 1.5, bgcolor: "rgba(245,158,11,0.15)", color: "primary.main", fontWeight: 700, height: 20 }} />
              </Typography>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Click <VisibilityIcon sx={{ fontSize: 12, verticalAlign: "middle" }} /> to view full details
              </Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 6 }}>
                <CircularProgress sx={{ color: "primary.main" }} />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ "& th": { bgcolor: "rgba(245,158,11,0.05)", color: "text.secondary", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", border: "none" } }}>
                      <TableCell>Incident</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Reported By</TableCell>
                      <TableCell>Photo</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Update</TableCell>
                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} sx={{ textAlign: "center", color: "text.secondary", py: 6 }}>
                          No incidents found
                        </TableCell>
                      </TableRow>
                    ) : filtered.map((inc) => (
                      <TableRow key={inc._id}
                        sx={{ "&:hover": { bgcolor: "rgba(245,158,11,0.03)" }, "& td": { border: "none", borderBottom: "1px solid rgba(255,255,255,0.04)" } }}>

                        {/* Type */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 18 }}>{TYPE_EMOJI[inc.type]}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{inc.type}</Typography>
                          </Box>
                        </TableCell>

                        {/* Severity */}
                        <TableCell>
                          <Chip label={inc.severity} size="small"
                            sx={{ bgcolor: `${SEVERITY_COLORS[inc.severity]}18`, color: SEVERITY_COLORS[inc.severity], fontWeight: 700, fontSize: 11, height: 22 }} />
                        </TableCell>

                        {/* Description Preview */}
                        <TableCell sx={{ maxWidth: 160 }}>
                          <Tooltip title={inc.description || "No description"} arrow>
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {inc.description || "—"}
                            </Typography>
                          </Tooltip>
                        </TableCell>

                        {/* Location */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "secondary.main", fontWeight: 600 }}>{inc.location?.highway}</Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>KM {inc.location?.km}</Typography>
                          {inc.location?.landmark && (
                            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", fontStyle: "italic" }}>
                              {inc.location.landmark.slice(0, 20)}...
                            </Typography>
                          )}
                        </TableCell>

                        {/* Reporter */}
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Avatar sx={{ width: 26, height: 26, bgcolor: "primary.dark", fontSize: 11 }}>
                              {inc.reportedBy?.name?.[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="caption" sx={{ color: "text.primary", display: "block", fontWeight: 600 }}>{inc.reportedBy?.name}</Typography>
                              <Typography variant="caption" sx={{ color: "text.secondary" }}>{inc.reportedBy?.employeeId}</Typography>
                            </Box>
                          </Box>
                        </TableCell>

                        {/* Photo thumbnail */}
                        <TableCell>
                          {inc.photo ? (
                            <Box
                              component="img"
                              src={inc.photo}
                              alt="incident"
                              onClick={() => openModal(inc)}
                              sx={{ width: 48, height: 40, objectFit: "cover", borderRadius: 1, cursor: "pointer", border: "1px solid rgba(245,158,11,0.3)", "&:hover": { opacity: 0.8 } }}
                              onError={(e) => { e.target.style.display = "none"; }}
                            />
                          ) : (
                            <Box sx={{ width: 48, height: 40, borderRadius: 1, border: "1px dashed rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <PhotoIcon sx={{ fontSize: 16, color: "text.secondary", opacity: 0.4 }} />
                            </Box>
                          )}
                        </TableCell>

                        {/* Date */}
                        <TableCell>
                          <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            {new Date(inc.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
                            {new Date(inc.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                          </Typography>
                        </TableCell>

                        {/* Status Chip */}
                        <TableCell>
                          <Chip label={inc.status} size="small"
                            sx={{ bgcolor: STATUS_COLORS[inc.status]?.bg, color: STATUS_COLORS[inc.status]?.color, fontWeight: 700, fontSize: 11, height: 22 }} />
                        </TableCell>

                        {/* Quick Status Update */}
                        <TableCell>
                          <FormControl size="small" sx={{ minWidth: 120 }}>
                            <Select value={inc.status}
                              onChange={(e) => updateStatus(inc._id, e.target.value)}
                              disabled={updating === inc._id}
                              sx={{ fontSize: 12, "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.2)" }, height: 32 }}>
                              {["Pending", "Assigned", "In Progress", "Resolved"].map((s) => (
                                <MenuItem key={s} value={s} sx={{ fontSize: 12 }}>{s}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>

                        {/* View Details Button */}
                        <TableCell>
                          <Tooltip title="View Full Details">
                            <IconButton size="small" onClick={() => openModal(inc)}
                              sx={{ color: "primary.main", border: "1px solid rgba(245,158,11,0.3)", "&:hover": { bgcolor: "rgba(245,158,11,0.1)" } }}>
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* ══════════════════════════════════════════
          INCIDENT DETAIL MODAL
      ══════════════════════════════════════════ */}
      <Dialog open={modalOpen} onClose={closeModal} maxWidth="md" fullWidth
        PaperProps={{ sx: { bgcolor: "background.paper", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 2 } }}>

        {selected && (
          <>
            {/* Modal Header */}
            <DialogTitle sx={{ p: 0 }}>
              <Box sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                p: 2.5, borderBottom: "1px solid rgba(245,158,11,0.15)",
                background: "linear-gradient(135deg, rgba(245,158,11,0.08), transparent)",
              }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Typography sx={{ fontSize: 28 }}>{TYPE_EMOJI[selected.type]}</Typography>
                  <Box>
                    <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700, lineHeight: 1.2 }}>
                      {selected.type} Incident
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 0.5 }}>
                      <Chip label={selected.severity} size="small"
                        sx={{ bgcolor: `${SEVERITY_COLORS[selected.severity]}18`, color: SEVERITY_COLORS[selected.severity], fontWeight: 700, fontSize: 10, height: 20 }} />
                      <Chip label={selected.status} size="small"
                        sx={{ bgcolor: STATUS_COLORS[selected.status]?.bg, color: STATUS_COLORS[selected.status]?.color, fontWeight: 700, fontSize: 10, height: 20 }} />
                    </Box>
                  </Box>
                </Box>
                <IconButton onClick={closeModal} sx={{ color: "text.secondary" }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 0 }}>
              <Grid container>

                {/* ── LEFT PANEL — Info ── */}
                <Grid item xs={12} md={6} sx={{ p: 3, borderRight: { md: "1px solid rgba(245,158,11,0.1)" } }}>

                  {/* Description */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>
                      📝 Description
                    </Typography>
                    <Box sx={{ mt: 1, p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.06)" }}>
                      <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.7 }}>
                        {selected.description || "No description provided"}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: "rgba(245,158,11,0.08)", mb: 2 }} />

                  {/* Location Details */}
                  <Typography variant="caption" sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>
                    📍 Location
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <DetailRow icon={<RouteIcon fontSize="small" />} label="Highway" value={selected.location?.highway} valueColor="#38BDF8" />
                    <DetailRow icon={<LocationOnIcon fontSize="small" />} label="KM Mark" value={`KM ${selected.location?.km}`} />
                    {selected.location?.landmark && (
                      <DetailRow icon={<LocationOnIcon fontSize="small" />} label="Landmark" value={selected.location.landmark} />
                    )}
                    <DetailRow icon={<LocationOnIcon fontSize="small" />} label="GPS Coordinates"
                      value={`${selected.location?.lat}, ${selected.location?.lng}`} />
                    <Box sx={{ mt: 1 }}>
                      <Button size="small" variant="outlined"
                        onClick={() => window.open(`https://maps.google.com/?q=${selected.location?.lat},${selected.location?.lng}`, "_blank")}
                        sx={{ fontSize: 11, borderColor: "rgba(56,189,248,0.4)", color: "secondary.main", py: 0.5 }}>
                        🗺️ Open in Google Maps
                      </Button>
                    </Box>
                  </Box>

                  <Divider sx={{ borderColor: "rgba(245,158,11,0.08)", my: 2 }} />

                  {/* Reporter Info */}
                  <Typography variant="caption" sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>
                    👤 Reported By
                  </Typography>
                  <Box sx={{ mt: 1, p: 2, bgcolor: "rgba(255,255,255,0.03)", borderRadius: 1.5, border: "1px solid rgba(255,255,255,0.06)" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                      <Avatar sx={{ bgcolor: "primary.dark", width: 36, height: 36, fontSize: 14 }}>
                        {selected.reportedBy?.name?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>{selected.reportedBy?.name}</Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>ID: {selected.reportedBy?.employeeId}</Typography>
                      </Box>
                    </Box>
                    {selected.reportedBy?.phone && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 14, color: "text.secondary" }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>{selected.reportedBy.phone}</Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <DetailRow icon={<AccessTimeIcon fontSize="small" />} label="Reported At"
                      value={new Date(selected.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} />
                    {selected.resolvedAt && (
                      <DetailRow icon={<CheckCircleIcon fontSize="small" />} label="Resolved At"
                        value={new Date(selected.resolvedAt).toLocaleString("en-IN")} valueColor="#22C55E" />
                    )}
                  </Box>
                </Grid>

                {/* ── RIGHT PANEL — Photo + Admin Actions ── */}
                <Grid item xs={12} md={6} sx={{ p: 3 }}>

                  {/* Photo */}
                  <Typography variant="caption" sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>
                    📷 Incident Photo
                  </Typography>
                  <Box sx={{ mt: 1, mb: 3 }}>
                    {selected.photo && !imgError ? (
                      <Box
                        component="img"
                        src={selected.photo}
                        alt="Incident"
                        onError={() => setImgError(true)}
                        sx={{ width: "100%", maxHeight: 220, objectFit: "cover", borderRadius: 2, border: "1px solid rgba(245,158,11,0.2)", cursor: "pointer" }}
                        onClick={() => window.open(selected.photo, "_blank")}
                      />
                    ) : (
                      <Box sx={{
                        width: "100%", height: 120, borderRadius: 2,
                        border: "2px dashed rgba(255,255,255,0.1)",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1,
                      }}>
                        <PhotoIcon sx={{ fontSize: 32, color: "text.secondary", opacity: 0.3 }} />
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>No photo uploaded</Typography>
                      </Box>
                    )}
                    {selected.photo && !imgError && (
                      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5, textAlign: "center" }}>
                        Click photo to open full size
                      </Typography>
                    )}
                  </Box>

                  <Divider sx={{ borderColor: "rgba(245,158,11,0.08)", mb: 2 }} />

                  {/* Admin Actions */}
                  <Typography variant="caption" sx={{ color: "primary.main", textTransform: "uppercase", letterSpacing: 1.5, fontSize: 10, fontWeight: 700 }}>
                    🛠️ Admin Actions
                  </Typography>

                  <Stack spacing={2} sx={{ mt: 1.5 }}>
                    {/* Update Status */}
                    <FormControl fullWidth size="small">
                      <InputLabel sx={{ "&.Mui-focused": { color: "primary.main" } }}>Update Status</InputLabel>
                      <Select value={modalStatus} label="Update Status" onChange={(e) => setModalStatus(e.target.value)}
                        sx={{ "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(245,158,11,0.3)" }, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#F59E0B" } }}>
                        {["Pending", "Assigned", "In Progress", "Resolved"].map((s) => (
                          <MenuItem key={s} value={s}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: STATUS_COLORS[s]?.color }} />
                              {s}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    {/* Assign Team */}
                    <TextField size="small" fullWidth label="Assign Team / Officer"
                      placeholder="e.g. Response Team A, Raman Singh"
                      value={assignedTeam} onChange={(e) => setAssignedTeam(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start"><GroupsIcon sx={{ color: "primary.main", fontSize: 18 }} /></InputAdornment> }}
                    />

                    {/* Admin Notes */}
                    <TextField size="small" fullWidth label="Admin Notes"
                      placeholder="Add internal notes, action taken, follow-up required..."
                      multiline rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)}
                      InputProps={{ startAdornment: <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1 }}><NoteAltIcon sx={{ color: "primary.main", fontSize: 18 }} /></InputAdornment> }}
                    />

                    {/* Save Button */}
                    <Button variant="contained" color="primary" fullWidth
                      startIcon={saving ? <CircularProgress size={16} sx={{ color: "background.default" }} /> : <SaveIcon />}
                      onClick={saveModal} disabled={saving} sx={{ py: 1.2 }}>
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>

                    {/* Delete Button */}
                    {!deleteConfirm ? (
                      <Button variant="outlined" color="error" fullWidth startIcon={<DeleteIcon />}
                        onClick={() => setDeleteConfirm(true)}
                        sx={{ borderColor: "rgba(239,68,68,0.4)", "&:hover": { bgcolor: "rgba(239,68,68,0.08)" } }}>
                        Delete Incident
                      </Button>
                    ) : (
                      <Box sx={{ p: 2, bgcolor: "rgba(239,68,68,0.08)", borderRadius: 1.5, border: "1px solid rgba(239,68,68,0.3)" }}>
                        <Typography variant="body2" sx={{ color: "error.main", mb: 1.5, textAlign: "center" }}>
                          ⚠️ Are you sure? This cannot be undone.
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button size="small" variant="contained" color="error" fullWidth onClick={deleteIncident}>
                            Yes, Delete
                          </Button>
                          <Button size="small" variant="outlined" fullWidth onClick={() => setDeleteConfirm(false)}
                            sx={{ borderColor: "rgba(255,255,255,0.2)", color: "text.secondary" }}>
                            Cancel
                          </Button>
                        </Box>
                      </Box>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}