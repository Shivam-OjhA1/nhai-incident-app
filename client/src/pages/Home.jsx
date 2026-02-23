import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box, Typography, Button, Grid, Card, CardContent, Chip, Avatar, Divider,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ShieldIcon from "@mui/icons-material/Shield";
import SpeedIcon from "@mui/icons-material/Speed";
import MapIcon from "@mui/icons-material/Map";
import GroupsIcon from "@mui/icons-material/Groups";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import CarCrashIcon from "@mui/icons-material/CarCrash";
import LandslideIcon from "@mui/icons-material/Landslide";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";

// ── Animated Counter Hook ──────────────────────────────────────────────────────
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

// ── Intersection Observer Hook ─────────────────────────────────────────────────
const useInView = (threshold = 0.2) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
};

// ── Stat Counter Card ──────────────────────────────────────────────────────────
const StatCounter = ({ target, suffix = "", label, color, start }) => {
  const count = useCounter(target, 2200, start);
  return (
    <Box sx={{ textAlign: "center" }}>
      <Typography sx={{
        fontFamily: "'Rajdhani', sans-serif", fontSize: { xs: 40, md: 56 },
        fontWeight: 800, color, lineHeight: 1,
        textShadow: `0 0 40px ${color}55`,
      }}>
        {count.toLocaleString()}{suffix}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, letterSpacing: 1, textTransform: "uppercase", fontSize: 11 }}>
        {label}
      </Typography>
    </Box>
  );
};

// ── Feature Card ───────────────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, color, delay }) => (
  <Card sx={{
    height: "100%", position: "relative", overflow: "hidden", cursor: "default",
    transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
    animation: `fadeSlideUp 0.6s ease ${delay}s both`,
    "&:hover": {
      transform: "translateY(-6px)",
      border: `1px solid ${color}44`,
      boxShadow: `0 20px 60px ${color}22`,
    },
    "@keyframes fadeSlideUp": {
      from: { opacity: 0, transform: "translateY(30px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    },
  }}>
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
    <CardContent sx={{ p: 3 }}>
      <Avatar sx={{ bgcolor: `${color}18`, width: 52, height: 52, mb: 2, border: `1px solid ${color}33` }}>
        <Box sx={{ color, display: "flex" }}>{icon}</Box>
      </Avatar>
      <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700, mb: 1, fontFamily: "'Rajdhani', sans-serif" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>
        {desc}
      </Typography>
    </CardContent>
  </Card>
);

// ── Step Card ──────────────────────────────────────────────────────────────────
const StepCard = ({ number, title, desc, icon, isLast }) => (
  <Box sx={{ display: "flex", gap: 2.5, position: "relative" }}>
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Box sx={{
        width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
        background: "linear-gradient(135deg, #F59E0B, #D97706)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 24px rgba(245,158,11,0.4)",
        fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 20, color: "#0A1628",
      }}>
        {number}
      </Box>
      {!isLast && (
        <Box sx={{ width: 2, flex: 1, minHeight: 48, mt: 1, background: "linear-gradient(180deg, rgba(245,158,11,0.4), transparent)" }} />
      )}
    </Box>
    <Box sx={{ pb: isLast ? 0 : 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
        <Box sx={{ color: "primary.main", display: "flex", fontSize: 18 }}>{icon}</Box>
        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700, fontFamily: "'Rajdhani', sans-serif" }}>
          {title}
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.8 }}>{desc}</Typography>
    </Box>
  </Box>
);

// ── Incident Type Badge ────────────────────────────────────────────────────────
const IncidentBadge = ({ emoji, label, color }) => (
  <Box sx={{
    display: "flex", alignItems: "center", gap: 1, px: 2, py: 1,
    borderRadius: 2, border: `1px solid ${color}33`, bgcolor: `${color}0D`,
    transition: "all 0.2s", "&:hover": { bgcolor: `${color}1A`, transform: "scale(1.04)" },
  }}>
    <Typography sx={{ fontSize: 18 }}>{emoji}</Typography>
    <Typography variant="body2" sx={{ color, fontWeight: 600, fontFamily: "'Rajdhani', sans-serif", letterSpacing: 0.5 }}>
      {label}
    </Typography>
  </Box>
);

// ══════════════════════════════════════════════════════════════════════════════
// MAIN HOME PAGE
// ══════════════════════════════════════════════════════════════════════════════
export default function Home() {
  const navigate = useNavigate();
  const [statsRef, statsInView] = useInView(0.3);

  return (
    <Box sx={{ background: "#060E1A", minHeight: "100vh", overflowX: "hidden" }}>

      {/* ════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════ */}
      <Box sx={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>

        {/* Animated background lines (road effect) */}
        {[...Array(8)].map((_, i) => (
          <Box key={i} sx={{
            position: "absolute", left: `${5 + i * 12}%`, top: 0, bottom: 0, width: "1px",
            background: "linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.06) 40%, rgba(245,158,11,0.12) 60%, transparent 100%)",
            animation: `pulse ${2 + i * 0.3}s ease-in-out infinite alternate`,
            "@keyframes pulse": { from: { opacity: 0.3 }, to: { opacity: 1 } },
          }} />
        ))}

        {/* Glowing orbs */}
        <Box sx={{ position: "absolute", top: "15%", left: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", bottom: "10%", right: "8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        {/* Road dashes animation */}
        <Box sx={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, overflow: "hidden" }}>
          <Box sx={{
            height: "100%",
            background: "repeating-linear-gradient(90deg, #F59E0B 0px, #F59E0B 60px, transparent 60px, transparent 120px)",
            animation: "roadDash 2s linear infinite",
            "@keyframes roadDash": { from: { transform: "translateX(0)" }, to: { transform: "translateX(120px)" } },
          }} />
        </Box>

        {/* Navbar */}
        <Box sx={{
          position: "absolute", top: 0, left: 0, right: 0, px: { xs: 3, md: 8 }, py: 2.5,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid rgba(245,158,11,0.1)",
          background: "linear-gradient(180deg, rgba(6,14,26,0.95) 0%, transparent 100%)",
          backdropFilter: "blur(8px)", zIndex: 10,
        }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon sx={{ color: "primary.main", fontSize: 30 }} />
            <Box>
              <Typography sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, fontSize: 22, color: "primary.main", letterSpacing: 3, lineHeight: 1 }}>
                NHAI
              </Typography>
              <Typography sx={{ fontSize: 9, color: "text.secondary", letterSpacing: 2, textTransform: "uppercase" }}>
                Highway Incident System
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5 }}>
            <Button variant="outlined" onClick={() => navigate("/login")}
              sx={{ borderColor: "rgba(245,158,11,0.4)", color: "primary.main", fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1, "&:hover": { bgcolor: "rgba(245,158,11,0.08)", borderColor: "primary.main" } }}>
              Login
            </Button>
            <Button variant="contained" color="primary" onClick={() => navigate("/register")}
              sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1 }}>
              Register
            </Button>
          </Box>
        </Box>

        {/* Hero Content */}
        <Box sx={{ position: "relative", zIndex: 2, px: { xs: 3, md: 8, lg: 14 }, pt: 12, pb: 6 }}>
          <Box sx={{ animation: "heroFadeIn 0.8s ease both", "@keyframes heroFadeIn": { from: { opacity: 0, transform: "translateY(40px)" }, to: { opacity: 1, transform: "translateY(0)" } } }}>
            <Chip label="🛡️ Government of India — Ministry of Road Transport" size="small"
              sx={{ mb: 3, bgcolor: "rgba(245,158,11,0.1)", color: "primary.main", border: "1px solid rgba(245,158,11,0.3)", fontFamily: "'Barlow', sans-serif", letterSpacing: 0.5 }} />

            <Typography sx={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, lineHeight: 1.05,
              fontSize: { xs: 42, sm: 56, md: 72, lg: 88 },
              color: "white", mb: 1,
            }}>
              HIGHWAY
            </Typography>
            <Typography sx={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, lineHeight: 1.05,
              fontSize: { xs: 42, sm: 56, md: 72, lg: 88 },
              background: "linear-gradient(135deg, #F59E0B 0%, #FCD34D 50%, #F97316 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              backgroundClip: "text", mb: 1,
            }}>
              INCIDENT
            </Typography>
            <Typography sx={{
              fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, lineHeight: 1.05,
              fontSize: { xs: 42, sm: 56, md: 72, lg: 88 },
              color: "rgba(255,255,255,0.15)", mb: 4,
            }}>
              REPORTING
            </Typography>

            <Typography variant="h6" sx={{
              color: "text.secondary", maxWidth: 560, lineHeight: 1.8, mb: 5,
              fontFamily: "'Barlow', sans-serif", fontWeight: 400, fontSize: { xs: 15, md: 17 },
            }}>
              A real-time digital platform for NHAI field staff to report accidents, potholes,
              obstructions and hazards — keeping India's national highways safe for millions of commuters.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button variant="contained" color="primary" size="large"
                endIcon={<ArrowForwardIcon />}
                onClick={() => navigate("/register")}
                sx={{ py: 1.8, px: 4, fontSize: 15, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1.5, boxShadow: "0 0 30px rgba(245,158,11,0.35)" }}>
                Get Started
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate("/login")}
                sx={{ py: 1.8, px: 4, fontSize: 15, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1.5, borderColor: "rgba(255,255,255,0.15)", color: "text.secondary", "&:hover": { borderColor: "rgba(245,158,11,0.4)", color: "primary.main" } }}>
                Staff Login
              </Button>
            </Box>
          </Box>

          {/* Incident Type Badges */}
          <Box sx={{ mt: 6, display: "flex", flexWrap: "wrap", gap: 1.5, animation: "heroFadeIn 1s ease 0.3s both", "@keyframes heroFadeIn": { from: { opacity: 0, transform: "translateY(40px)" }, to: { opacity: 1, transform: "translateY(0)" } } }}>
            <IncidentBadge emoji="💥" label="Accident" color="#EF4444" />
            <IncidentBadge emoji="🕳️" label="Pothole" color="#F97316" />
            <IncidentBadge emoji="🔥" label="Fire" color="#EF4444" />
            <IncidentBadge emoji="🌊" label="Flood" color="#38BDF8" />
            <IncidentBadge emoji="🚧" label="Obstruction" color="#8B5CF6" />
            <IncidentBadge emoji="🚗" label="Breakdown" color="#F59E0B" />
          </Box>
        </Box>

        {/* Scroll indicator */}
        <Box sx={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, opacity: 0.4, animation: "bounce 2s infinite", "@keyframes bounce": { "0%,100%": { transform: "translateX(-50%) translateY(0)" }, "50%": { transform: "translateX(-50%) translateY(8px)" } } }}>
          <Typography sx={{ fontSize: 10, letterSpacing: 3, color: "text.secondary", textTransform: "uppercase" }}>Scroll</Typography>
          <Box sx={{ width: 1, height: 40, bgcolor: "rgba(245,158,11,0.4)" }} />
        </Box>
      </Box>

      {/* ════════════════════════════════════
          STATS SECTION
      ════════════════════════════════════ */}
      <Box ref={statsRef} sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8 }, position: "relative", borderTop: "1px solid rgba(245,158,11,0.1)", borderBottom: "1px solid rgba(245,158,11,0.1)", background: "linear-gradient(135deg, rgba(245,158,11,0.04) 0%, transparent 50%, rgba(56,189,248,0.03) 100%)" }}>
        <Grid container spacing={4} justifyContent="center">
          {[
            { target: 146000, suffix: "+", label: "KM of National Highways", color: "#F59E0B" },
            { target: 24, suffix: "/7", label: "Round-the-Clock Monitoring", color: "#38BDF8" },
            { target: 36, suffix: "+", label: "States & UTs Covered", color: "#22C55E" },
            { target: 500, suffix: "+", label: "Active Field Staff", color: "#F97316" },
          ].map((s) => (
            <Grid key={s.label} item xs={6} md={3}>
              <StatCounter {...s} start={statsInView} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ════════════════════════════════════
          FEATURES SECTION
      ════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 }, px: { xs: 3, md: 8, lg: 12 } }}>
        <Box sx={{ textAlign: "center", mb: 8 }}>
          <Chip label="Platform Features" size="small"
            sx={{ mb: 2, bgcolor: "rgba(56,189,248,0.1)", color: "secondary.main", border: "1px solid rgba(56,189,248,0.25)" }} />
          <Typography variant="h3" sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, color: "white", mb: 2 }}>
            Everything You Need
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 480, mx: "auto", lineHeight: 1.8 }}>
            Built specifically for NHAI operations — from field patrol to admin control room
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {[
            { icon: <SpeedIcon />, title: "Instant Reporting", color: "#F59E0B", delay: 0.1, desc: "Field staff can report incidents in under 60 seconds with auto GPS capture, photo upload, and severity tagging." },
            { icon: <MapIcon />, title: "Live Incident Map", color: "#38BDF8", delay: 0.2, desc: "Real-time interactive map showing all active incidents across national highways with severity color coding." },
            { icon: <NotificationsActiveIcon />, title: "Smart Status Tracking", color: "#22C55E", delay: 0.3, desc: "Full incident lifecycle — Pending → Assigned → In Progress → Resolved with timestamps and admin notes." },
            { icon: <CloudUploadIcon />, title: "Photo Evidence Upload", color: "#F97316", delay: 0.4, desc: "Cloudinary-powered image upload directly from mobile camera. Evidence stored securely for every incident." },
            { icon: <GroupsIcon />, title: "Team Assignment", color: "#8B5CF6", delay: 0.5, desc: "Admins can assign response teams or officers to any incident and track resolution in real time." },
            { icon: <ShieldIcon />, title: "Role-Based Access", color: "#EF4444", delay: 0.6, desc: "Separate portals for Field Staff and Admins with JWT-secured authentication and route protection." },
          ].map((f) => (
            <Grid key={f.title} item xs={12} sm={6} md={4}>
              <FeatureCard {...f} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 14 }, px: { xs: 3, md: 8 }, background: "linear-gradient(135deg, rgba(13,31,53,0.8) 0%, #060E1A 100%)", borderTop: "1px solid rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.08)" }}>
        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={5}>
            <Chip label="Simple Process" size="small"
              sx={{ mb: 2, bgcolor: "rgba(245,158,11,0.1)", color: "primary.main", border: "1px solid rgba(245,158,11,0.25)" }} />
            <Typography variant="h3" sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, color: "white", mb: 2, lineHeight: 1.1 }}>
              How It Works
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", lineHeight: 1.9, mb: 3 }}>
              Designed for speed — from the moment you spot an incident to the admin getting notified, the entire process takes less than 2 minutes.
            </Typography>
            <Button variant="contained" color="primary" endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/register")}
              sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1 }}>
              Start Reporting
            </Button>
          </Grid>
          <Grid item xs={12} md={7}>
            <Card sx={{ p: { xs: 3, md: 4 } }}>
              <StepCard number="01" title="Register & Login"
                icon={<VerifiedIcon />}
                desc="Create your NHAI staff account with your Employee ID, assigned highway, and contact details. Login takes 5 seconds."
                isLast={false} />
              <StepCard number="02" title="Report the Incident"
                icon={<CarCrashIcon />}
                desc="Select incident type, mark severity, capture GPS location automatically, write a description and upload a photo from your phone."
                isLast={false} />
              <StepCard number="03" title="Admin Takes Action"
                icon={<AssignmentTurnedInIcon />}
                desc="Admin sees it instantly on the dashboard and live map, assigns a response team, updates status, and adds resolution notes."
                isLast={true} />
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* ════════════════════════════════════
          INCIDENT TYPES SHOWCASE
      ════════════════════════════════════ */}
      <Box sx={{ py: { xs: 8, md: 12 }, px: { xs: 3, md: 8, lg: 12 } }}>
        <Box sx={{ textAlign: "center", mb: 7 }}>
          <Typography variant="h3" sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, color: "white", mb: 2 }}>
            Incident Categories
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 440, mx: "auto" }}>
            Report any highway hazard across 7 incident categories
          </Typography>
        </Box>
        <Grid container spacing={2.5} justifyContent="center">
          {[
            { emoji: "💥", label: "Accident", desc: "Vehicle collisions, pile-ups, injuries", color: "#EF4444" },
            { emoji: "🕳️", label: "Pothole", desc: "Road surface damage and craters", color: "#F97316" },
            { emoji: "🚗", label: "Breakdown", desc: "Stalled vehicles blocking lanes", color: "#F59E0B" },
            { emoji: "🚧", label: "Obstruction", desc: "Fallen trees, debris, blockages", color: "#8B5CF6" },
            { emoji: "🔥", label: "Fire", desc: "Vehicle or roadside fire hazards", color: "#EF4444" },
            { emoji: "🌊", label: "Flood", desc: "Waterlogging and road submersion", color: "#38BDF8" },
            { emoji: "⚠️", label: "Other", desc: "Any other highway emergency", color: "#94A3B8" },
          ].map((t) => (
            <Grid key={t.label} item xs={6} sm={4} md={3} lg={true}>
              <Card sx={{
                p: 2.5, textAlign: "center", cursor: "default", height: "100%",
                transition: "all 0.3s ease",
                "&:hover": { transform: "translateY(-8px)", border: `1px solid ${t.color}44`, boxShadow: `0 16px 48px ${t.color}22` },
              }}>
                <Typography sx={{ fontSize: 36, mb: 1 }}>{t.emoji}</Typography>
                <Typography sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: t.color, mb: 0.5, fontSize: 15 }}>
                  {t.label}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                  {t.desc}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════ */}
      <Box sx={{ py: { xs: 10, md: 16 }, px: { xs: 3, md: 8 }, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(245,158,11,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)" }} />

        <Chip label="🚀 Ready to Get Started?" sx={{ mb: 3, bgcolor: "rgba(245,158,11,0.1)", color: "primary.main", border: "1px solid rgba(245,158,11,0.3)", fontFamily: "'Barlow', sans-serif" }} />
        <Typography variant="h3" sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 800, color: "white", mb: 2, fontSize: { xs: 32, md: 52 } }}>
          Join the NHAI Safety Network
        </Typography>
        <Typography variant="body1" sx={{ color: "text.secondary", mb: 5, maxWidth: 500, mx: "auto", lineHeight: 1.8 }}>
          Help make India's highways safer. Register as field staff or login to the admin dashboard today.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button variant="contained" color="primary" size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={() => navigate("/register")}
            sx={{ py: 2, px: 5, fontSize: 16, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 2, boxShadow: "0 0 40px rgba(245,158,11,0.3)" }}>
            Register as Staff
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate("/login")}
            sx={{ py: 2, px: 5, fontSize: 16, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 2, borderColor: "rgba(245,158,11,0.35)", color: "primary.main", "&:hover": { bgcolor: "rgba(245,158,11,0.08)" } }}>
            Admin Login
          </Button>
        </Box>
      </Box>

      {/* ════════════════════════════════════
          FOOTER
      ════════════════════════════════════ */}
      <Box sx={{ py: 4, px: { xs: 3, md: 8 }, borderTop: "1px solid rgba(245,158,11,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ color: "primary.main", fontSize: 20 }} />
          <Typography sx={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, color: "primary.main", letterSpacing: 2 }}>NHAI</Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>| Highway Incident Reporting System</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          © 2024 National Highways Authority of India. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}