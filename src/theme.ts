import { createTheme } from "@mui/material/styles";

// Brand Palette
// #6D214F  → Deep Plum (Primary)
// #E5989B  → Soft Rose (Secondary / Accent)
// #FFF8F0  → Warm Cream (Background)
// #F4C95D  → Golden Yellow (Highlight / Warning)

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6D214F",
      light: "#8f2f68",
      dark: "#4e1739",
      contrastText: "#FFF8F0",
    },
    secondary: {
      main: "#E5989B",
      light: "#f5bcbf",
      dark: "#c97579",
      contrastText: "#2d0f1e",
    },
    background: {
      default: "#FFF8F0",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#2d0f1e",
      secondary: "#7a5060",
    },
    warning: {
      main: "#F4C95D",
      dark: "#d4a83a",
      contrastText: "#2d0f1e",
    },
    error: {
      main: "#e53e3e",
    },
    success: {
      main: "#38a169",
    },
    info: {
      main: "#E5989B",
    },
    divider: "#f0d0d8",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 900 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 800 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          padding: "10px 24px",
          fontWeight: 700,
          transition: "all 0.3s ease-in-out",
          textTransform: "none",
        },
        contained: {
          background: "linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)",
          color: "#FFF8F0",
          boxShadow: "0 4px 14px rgba(109, 33, 79, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #4e1739 0%, #6D214F 100%)",
            transform: "translateY(-2px)",
            boxShadow: "0 8px 20px rgba(109, 33, 79, 0.35)",
          },
        },
        outlined: {
          borderColor: "#6D214F",
          color: "#6D214F",
          "&:hover": {
            backgroundColor: "rgba(109, 33, 79, 0.06)",
            borderColor: "#6D214F",
          },
        },
        text: {
          color: "#6D214F",
          "&:hover": {
            backgroundColor: "rgba(109, 33, 79, 0.06)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderRadius: "18px",
          border: "1px solid #fce8ec",
          boxShadow: "0 2px 8px rgba(109, 33, 79, 0.08)",
          transition: "all 0.25s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(109, 33, 79, 0.12)",
            transform: "translateY(-1px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #fce8ec",
          boxShadow: "0 2px 12px rgba(109, 33, 79, 0.06)",
          color: "#2d0f1e",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#4e1739",
          color: "#FFF8F0",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            "& fieldset": {
              borderColor: "#f0d0d8",
            },
            "&:hover fieldset": {
              borderColor: "#E5989B",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#6D214F",
              borderWidth: "2px",
            },
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "#6D214F",
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: "8px",
          fontWeight: 600,
        },
        colorPrimary: {
          backgroundColor: "rgba(109, 33, 79, 0.1)",
          color: "#6D214F",
        },
        colorSecondary: {
          backgroundColor: "rgba(229, 152, 155, 0.15)",
          color: "#c97579",
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderTop: "1px solid #fce8ec",
          boxShadow: "0 -4px 16px rgba(109, 33, 79, 0.08)",
        },
      },
    },
    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          color: "#b08090",
          "&.Mui-selected": {
            color: "#6D214F",
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          backgroundColor: "#6D214F",
          color: "#FFF8F0",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: "99px",
          backgroundColor: "#fce8ec",
        },
        bar: {
          background: "linear-gradient(90deg, #6D214F, #E5989B)",
          borderRadius: "99px",
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: "#6D214F",
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        switchBase: {
          "&.Mui-checked": {
            color: "#6D214F",
            "& + .MuiSwitch-track": {
              backgroundColor: "#E5989B",
            },
          },
        },
      },
    },
  },
});
