import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemIcon,
  ListItemText, Avatar, Chip, Divider, useMediaQuery, useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MapIcon from "@mui/icons-material/Map";
import ReportIcon from "@mui/icons-material/Report";
import LogoutIcon from "@mui/icons-material/Logout";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const adminLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardIcon /> },
    { label: "Live Map", path: "/map", icon: <MapIcon /> },
  ];

  const staffLinks = [
    { label: "Report Incident", path: "/report", icon: <ReportIcon /> },
  ];

  const links = user?.role === "admin" ? adminLinks : staffLinks;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const NavLinks = () => (
    <>
      {links.map((link) => (
        <Button
          key={link.path}
          startIcon={link.icon}
          onClick={() => { navigate(link.path); setDrawerOpen(false); }}
          sx={{
            color: location.pathname === link.path ? "primary.main" : "text.secondary",
            borderBottom: location.pathname === link.path ? "2px solid" : "2px solid transparent",
            borderColor: "primary.main",
            borderRadius: 0,
            px: 2, py: 1,
            "&:hover": { color: "primary.main" },
          }}
        >
          {link.label}
        </Button>
      ))}
    </>
  );

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(90deg, #060E1A 0%, #0D1F35 100%)",
        borderBottom: "1px solid rgba(245,158,11,0.2)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WarningAmberIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 700, letterSpacing: 2 }}>
            NHAI
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
            | Highway Incident System
          </Typography>
        </Box>

        {/* Desktop Links */}
        {!isMobile && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <NavLinks />
          </Box>
        )}

        {/* Right Side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            avatar={<Avatar sx={{ bgcolor: "primary.main", color: "background.default", fontSize: 12 }}>
              {user?.name?.[0]}
            </Avatar>}
            label={isMobile ? user?.role?.toUpperCase() : `${user?.name} · ${user?.role?.toUpperCase()}`}
            size="small"
            sx={{ borderColor: "rgba(245,158,11,0.3)", color: "text.secondary", display: { xs: "none", sm: "flex" } }}
            variant="outlined"
          />
          {isMobile ? (
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "primary.main" }}>
              <MenuIcon />
            </IconButton>
          ) : (
            <Button
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              size="small"
              sx={{ color: "error.main", "&:hover": { bgcolor: "rgba(239,68,68,0.1)" } }}
            >
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: "background.paper", width: 260, borderLeft: "1px solid rgba(245,158,11,0.2)" } }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 700 }}>Menu</Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>{user?.name}</Typography>
        </Box>
        <Divider sx={{ borderColor: "rgba(245,158,11,0.15)" }} />
        <List>
          {links.map((link) => (
            <ListItem key={link.path} disablePadding>
              <ListItemButton onClick={() => { navigate(link.path); setDrawerOpen(false); }}
                selected={location.pathname === link.path}
                sx={{ "&.Mui-selected": { bgcolor: "rgba(245,158,11,0.1)", color: "primary.main" } }}>
                <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
          <Divider sx={{ my: 1, borderColor: "rgba(245,158,11,0.15)" }} />
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout} sx={{ color: "error.main" }}>
              <ListItemIcon sx={{ color: "error.main", minWidth: 40 }}><LogoutIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}
