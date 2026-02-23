import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#F59E0B",       // Amber - highway sign yellow
      light: "#FCD34D",
      dark: "#D97706",
      contrastText: "#0A1628",
    },
    secondary: {
      main: "#38BDF8",       // Sky blue - road marking
      light: "#7DD3FC",
      dark: "#0284C7",
      contrastText: "#0A1628",
    },
    error: {
      main: "#EF4444",
    },
    warning: {
      main: "#F97316",
    },
    success: {
      main: "#22C55E",
    },
    background: {
      default: "#060E1A",    // Deep navy night
      paper: "#0D1F35",      // Slightly lighter navy
    },
    text: {
      primary: "#F1F5F9",
      secondary: "#94A3B8",
    },
    divider: "rgba(248, 158, 11, 0.15)",
  },
  typography: {
    fontFamily: "'Rajdhani', 'Barlow', sans-serif",
    h1: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 },
    h2: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 },
    h3: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
    h4: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
    h5: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
    h6: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
    body1: { fontFamily: "'Barlow', sans-serif" },
    body2: { fontFamily: "'Barlow', sans-serif" },
    button: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600, letterSpacing: 1 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "uppercase",
          letterSpacing: "1.5px",
          fontWeight: 700,
          padding: "10px 24px",
        },
        containedPrimary: {
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#0A1628",
          "&:hover": {
            background: "linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)",
            boxShadow: "0 0 20px rgba(245, 158, 11, 0.4)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(245, 158, 11, 0.3)" },
            "&:hover fieldset": { borderColor: "rgba(245, 158, 11, 0.6)" },
            "&.Mui-focused fieldset": { borderColor: "#F59E0B" },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "#F59E0B" },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: "linear-gradient(145deg, #0D1F35 0%, #0A1A2E 100%)",
          border: "1px solid rgba(245, 158, 11, 0.15)",
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
      },
    },
  },
});

export default theme;
