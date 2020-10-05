import { makeStyles } from "@material-ui/core/styles";
import { createStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    routerContainer: {
      paddingTop: 48,
      minHeight: "calc(100vh - 48px)",
    },
  })
);

export default useStyles;
