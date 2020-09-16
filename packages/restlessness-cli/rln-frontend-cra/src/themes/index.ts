import { createMuiTheme } from "@material-ui/core";
import merge from "lodash.merge";

const themeBase = {
  palette: {
    secondary: {
      main: "#57B1B5",
    },
    success: {
      main: "#1DC435",
    },
    error: {
      main: "#F74F4F",
    },
    text: {
      secondary: "#B9EBED",
    },
  },
  typography: {
    h1: {
      fontSize: "3rem",
    },
    h2: {
      fontSize: "1.125rem",
    },
    h3: {
      fontSize: "4.25rem",
    },
    h4: {
      fontSize: "2.25rem",
    },
    h5: {
      fontSize: "1.3125rem",
    },
    h6: {
      fontSize: "2.5rem",
    },
    subtitle1: {
      fontSize: "1.5rem",
    },
    subtitle2: {
      fontSize: "0.75rem",
    },
    body1: {
      fontSize: "1rem",
    },
    body2: {
      fontSize: "1rem",
    },
    button: {
      fontSize: "1rem",
    },
    caption: {
      fontSize: "0.875rem",
    },
  },
};

export const light = createMuiTheme(
  merge({}, themeBase, {
    palette: {
      type: "light",
      primary: {
        main: "#5982C5",
      },
      secondary: {
        contrastText: "#08415C",
      },
      text: {
        hint: "#999999",
      },
      info: {
        main: "#EADE2B",
      },
      background: {
        default: "#F2F2F2",
        paper: "#FFFFFF",
        sidebar: "#4A4A4A",
      },
      divider: "#DDDDDD",
    },
  })
);

export const dark = createMuiTheme(
  merge({}, themeBase, {
    palette: {
      type: "dark",
      primary: {
        main: "#DF9B24",
      },
      secondary: {
        contrastText: "#FFF",
      },
      text: {
        primary: "#FFFFFF",
        hint: "rgba(255, 255, 255, 0.4)",
      },
      info: {
        main: "#B1B1B1",
      },
      background: {
        default: "#071212",
        paper: "#0B1D1D",
        sidebar: "#0B1D1D",
      },
      divider: "#183233",
    },
  })
);
