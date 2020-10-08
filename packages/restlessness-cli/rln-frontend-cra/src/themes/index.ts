import { createMuiTheme } from "@material-ui/core";
import merge from "lodash.merge";

const themeBase = {
  typography: {
    h1: {
      fontSize: "3rem",
    },
    h2: {
      fontSize: "2rem",
    },
    h3: {
      fontSize: "1.75rem",
    },
    h4: {
      fontSize: "1.5rem",
    },
    h5: {
      fontSize: "1.3125rem",
    },
    h6: {
      fontSize: "1.25rem",
    },
    subtitle1: {
      fontSize: "1.2rem",
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

export const light = createMuiTheme(merge({}, themeBase));

export const dark = createMuiTheme(merge({}, themeBase));
