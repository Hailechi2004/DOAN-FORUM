import { createTheme } from "@mui/material/styles";

// Facebook-inspired Color Palette - Clean White Theme
const colors = {
  primary: {
    main: "#1877f2", // Facebook blue
    light: "#42a5f5",
    dark: "#0c63d4",
    focus: "#1877f2",
    gradient: "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
  },
  secondary: {
    main: "#65676b", // Facebook gray text
    light: "#8a8d91",
    dark: "#50525a",
    focus: "#65676b",
  },
  info: {
    main: "#1877f2",
    focus: "#0c63d4",
    gradient: "linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)",
  },
  success: {
    main: "#42b72a", // Facebook green
    light: "#5ec458",
    dark: "#36a420",
    focus: "#42b72a",
    gradient: "linear-gradient(135deg, #42b72a 0%, #5ec458 100%)",
  },
  warning: {
    main: "#ff9800",
    light: "#ffb74d",
    dark: "#f57c00",
    focus: "#ff9800",
    gradient: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
  },
  error: {
    main: "#f02849", // Facebook red
    light: "#ff5252",
    dark: "#c62828",
    focus: "#f02849",
    gradient: "linear-gradient(135deg, #f02849 0%, #ff5252 100%)",
  },
  light: {
    main: "#f0f2f5", // Facebook background
    focus: "#e4e6eb",
  },
  dark: {
    main: "#1c1e21", // Facebook dark mode
    focus: "#242526",
  },
  white: {
    main: "#ffffff",
    focus: "#ffffff",
  },
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#e4e6eb", // Facebook border
    300: "#d0d1d5",
    400: "#bcc0c4",
    500: "#8a8d91", // Facebook secondary text
    600: "#65676b", // Facebook primary text
    700: "#50525a",
    800: "#3a3b3f",
    900: "#242526", // Facebook dark
  },
  facebook: {
    blue: "#1877f2",
    lightBlue: "#e7f3ff",
    green: "#42b72a",
    red: "#f02849",
    background: "#f0f2f5",
    hover: "#f2f3f5",
    border: "#e4e6eb",
    text: "#050505",
    secondaryText: "#65676b",
    placeholder: "#bcc0c4",
  },
  gradients: {
    primary: "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
    secondary: "linear-gradient(135deg, #65676b 0%, #8a8d91 100%)",
    info: "linear-gradient(135deg, #1877f2 0%, #0c63d4 100%)",
    success: "linear-gradient(135deg, #42b72a 0%, #5ec458 100%)",
    warning: "linear-gradient(135deg, #ff9800 0%, #ffb74d 100%)",
    error: "linear-gradient(135deg, #f02849 0%, #ff5252 100%)",
    dark: "linear-gradient(135deg, #1c1e21 0%, #242526 100%)",
  },
};

// Box shadows - Facebook style (subtle and clean)
const boxShadows = {
  none: "none",
  xs: "0 1px 2px rgba(0, 0, 0, 0.05)",
  sm: "0 1px 2px rgba(0, 0, 0, 0.1)", // Facebook card shadow
  md: "0 2px 4px rgba(0, 0, 0, 0.1), 0 8px 16px rgba(0, 0, 0, 0.1)",
  lg: "0 4px 8px rgba(0, 0, 0, 0.12), 0 12px 24px rgba(0, 0, 0, 0.12)",
  xl: "0 8px 16px rgba(0, 0, 0, 0.15), 0 16px 32px rgba(0, 0, 0, 0.15)",
  xxl: "0 12px 24px rgba(0, 0, 0, 0.18), 0 24px 48px rgba(0, 0, 0, 0.18)",
  inset: "inset 0 1px 2px rgba(0, 0, 0, 0.05)",
  navbar: "0 1px 2px rgba(0, 0, 0, 0.1)",
  card: "0 1px 2px rgba(0, 0, 0, 0.1)",
  hover: "0 2px 8px rgba(0, 0, 0, 0.15)",
  colored: {
    primary: "0 2px 8px 0 rgba(24, 119, 242, 0.3)",
    info: "0 2px 8px 0 rgba(24, 119, 242, 0.3)",
    success: "0 2px 8px 0 rgba(66, 183, 42, 0.3)",
    warning: "0 2px 8px 0 rgba(255, 152, 0, 0.3)",
    error: "0 2px 8px 0 rgba(240, 40, 73, 0.3)",
  },
};

// Typography - Facebook style
const typography = {
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightSemiBold: 600,
  fontWeightBold: 700,
  h1: {
    fontWeight: 700,
    fontSize: "2.5rem",
    lineHeight: 1.2,
    letterSpacing: "-0.01562em",
    color: "#050505",
  },
  h2: {
    fontWeight: 700,
    fontSize: "2rem",
    lineHeight: 1.3,
    letterSpacing: "-0.00833em",
    color: "#050505",
  },
  h3: {
    fontWeight: 700,
    fontSize: "1.75rem",
    lineHeight: 1.4,
    color: "#050505",
  },
  h4: {
    fontWeight: 600,
    fontSize: "1.5rem",
    lineHeight: 1.5,
    color: "#050505",
  },
  h5: {
    fontWeight: 600,
    fontSize: "1.25rem",
    lineHeight: 1.6,
    color: "#050505",
  },
  h6: {
    fontWeight: 600,
    fontSize: "1.125rem",
    lineHeight: 1.7,
    color: "#050505",
  },
  subtitle1: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.75,
    color: "#050505",
  },
  subtitle2: {
    fontSize: "0.875rem",
    fontWeight: 500,
    lineHeight: 1.57,
    color: "#65676b",
  },
  body1: {
    fontSize: "0.9375rem",
    fontWeight: 400,
    lineHeight: 1.5,
    color: "#050505",
  },
  body2: {
    fontSize: "0.8125rem",
    fontWeight: 400,
    lineHeight: 1.43,
    color: "#65676b",
  },
  button: {
    fontSize: "0.9375rem",
    fontWeight: 600,
    lineHeight: 1.75,
    textTransform: "none", // Facebook doesn't use uppercase
  },
  caption: {
    fontSize: "0.75rem",
    fontWeight: 400,
    lineHeight: 1.66,
    color: "#65676b",
  },
  overline: {
    fontSize: "0.75rem",
    fontWeight: 600,
    lineHeight: 2.66,
    textTransform: "uppercase",
    color: "#65676b",
  },
};

// Create theme - Facebook-inspired
const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
      contrastText: "#ffffff",
    },
    secondary: {
      main: colors.secondary.main,
      light: colors.secondary.light,
      dark: colors.secondary.dark,
    },
    info: {
      main: colors.info.main,
      light: colors.primary.light,
      dark: colors.primary.dark,
    },
    success: {
      main: colors.success.main,
      light: colors.success.light,
      dark: colors.success.dark,
    },
    warning: {
      main: colors.warning.main,
      light: colors.warning.light,
      dark: colors.warning.dark,
    },
    error: {
      main: colors.error.main,
      light: colors.error.light,
      dark: colors.error.dark,
    },
    dark: {
      main: colors.dark.main,
    },
    grey: colors.grey,
    background: {
      default: colors.facebook.background, // #f0f2f5
      paper: "#ffffff",
    },
    text: {
      primary: colors.facebook.text, // #050505
      secondary: colors.facebook.secondaryText, // #65676b
      disabled: colors.facebook.placeholder,
    },
    divider: colors.facebook.border, // #e4e6eb
  },
  typography,
  shape: {
    borderRadius: 8, // Facebook uses 8px border radius
  },
  shadows: [
    "none",
    boxShadows.xs,
    boxShadows.sm,
    boxShadows.sm,
    boxShadows.md,
    boxShadows.md,
    boxShadows.md,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.lg,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
    boxShadows.xxl,
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: colors.facebook.background,
          color: colors.facebook.text,
          scrollbarColor: "#bcc0c4 #f0f2f5",
          "&::-webkit-scrollbar": {
            width: 12,
            height: 12,
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f2f5",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#bcc0c4",
            borderRadius: 6,
            border: "3px solid #f0f2f5",
            "&:hover": {
              backgroundColor: "#8a8d91",
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9375rem",
          padding: "8px 16px",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: "translateY(-1px)",
          },
        },
        contained: {
          boxShadow: "none",
          "&:hover": {
            boxShadow: "none",
          },
        },
        containedPrimary: {
          backgroundColor: colors.primary.main,
          color: "#ffffff",
          "&:hover": {
            backgroundColor: colors.primary.dark,
          },
          "&:active": {
            backgroundColor: colors.primary.dark,
            transform: "translateY(0)",
          },
        },
        outlined: {
          borderColor: colors.facebook.border,
          color: colors.facebook.text,
          "&:hover": {
            backgroundColor: colors.facebook.hover,
            borderColor: colors.facebook.border,
          },
        },
        text: {
          color: colors.facebook.secondaryText,
          "&:hover": {
            backgroundColor: colors.facebook.hover,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: boxShadows.card,
          border: `1px solid ${colors.facebook.border}`,
          overflow: "visible",
          backgroundColor: "#ffffff",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 16,
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: `1px solid ${colors.facebook.border}`,
          boxShadow: "none",
        },
        elevation0: {
          boxShadow: "none",
        },
        elevation1: {
          boxShadow: boxShadows.sm,
        },
        elevation2: {
          boxShadow: boxShadows.md,
        },
        elevation3: {
          boxShadow: boxShadows.lg,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: boxShadows.navbar,
          backgroundColor: "#ffffff",
          color: colors.facebook.text,
          borderBottom: `1px solid ${colors.facebook.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          boxShadow: "none",
          backgroundColor: "#ffffff",
          borderRight: `1px solid ${colors.facebook.border}`,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: "2px 8px",
          padding: "8px 12px",
          transition: "background-color 0.2s",
          "&.Mui-selected": {
            backgroundColor: colors.facebook.lightBlue,
            color: colors.primary.main,
            fontWeight: 600,
            "&:hover": {
              backgroundColor: colors.facebook.lightBlue,
            },
            "& .MuiListItemIcon-root": {
              color: colors.primary.main,
            },
          },
          "&:hover": {
            backgroundColor: colors.facebook.hover,
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: colors.facebook.secondaryText,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: "0.9375rem",
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: "small",
      },
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 8,
            backgroundColor: colors.facebook.hover,
            "& fieldset": {
              borderColor: "transparent",
            },
            "&:hover fieldset": {
              borderColor: colors.facebook.border,
            },
            "&.Mui-focused": {
              backgroundColor: "#ffffff",
              "& fieldset": {
                borderColor: colors.primary.main,
                borderWidth: 1,
              },
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: "0.8125rem",
        },
        filled: {
          backgroundColor: colors.facebook.hover,
          color: colors.facebook.text,
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontSize: "1rem",
          fontWeight: 600,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: "50%",
          padding: 8,
          transition: "background-color 0.2s",
          "&:hover": {
            backgroundColor: colors.facebook.hover,
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.facebook.border,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.dark.main,
          fontSize: "0.75rem",
          fontWeight: 500,
          borderRadius: 6,
          padding: "6px 12px",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: boxShadows.lg,
          borderRadius: 8,
          border: `1px solid ${colors.facebook.border}`,
          marginTop: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: "2px 8px",
          padding: "8px 12px",
          "&:hover": {
            backgroundColor: colors.facebook.hover,
          },
          "&.Mui-selected": {
            backgroundColor: colors.facebook.lightBlue,
            "&:hover": {
              backgroundColor: colors.facebook.lightBlue,
            },
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: boxShadows.xxl,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: "1.25rem",
          fontWeight: 700,
          padding: "20px 24px",
          borderBottom: `1px solid ${colors.facebook.border}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "24px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "16px 24px",
          borderTop: `1px solid ${colors.facebook.border}`,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.facebook.border}`,
        },
        indicator: {
          backgroundColor: colors.primary.main,
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.9375rem",
          minHeight: 48,
          color: colors.facebook.secondaryText,
          "&.Mui-selected": {
            color: colors.primary.main,
          },
          "&:hover": {
            backgroundColor: colors.facebook.hover,
          },
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: "0.625rem",
          fontWeight: 600,
          height: 18,
          minWidth: 18,
          padding: "0 4px",
        },
      },
    },
  },
});

// Export theme and colors
export { colors, boxShadows };
export default theme;
