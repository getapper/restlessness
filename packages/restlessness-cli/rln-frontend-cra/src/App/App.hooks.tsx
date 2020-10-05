import { useEffect, useMemo } from "react";
import { light, dark } from "themes";
import { useSelector } from "react-redux";
import { getPaletteType } from "redux-store/slices/ui/selectors";
import { appTitle } from "../config";
import useStyles from "./App.styles";

const useAppHooks = () => {
  const classes = useStyles();
  const paletteType = useSelector(getPaletteType);
  const theme = useMemo(() => {
    return paletteType === "dark"
      ? {
          ...dark,
        }
      : {
          ...light,
        };
  }, [paletteType]);

  useEffect(() => {
    document.title = appTitle();
  }, []);

  return {
    classes,
    theme,
  };
};

export default useAppHooks;
