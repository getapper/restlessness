import { makeStyles } from "@material-ui/core/styles";
import { createStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      height: "calc(100vh - 48px)",
      padding: "2rem",
      boxSizing: "border-box",
    },
    scheduleEdit: {
      marginTop: "2rem",
      padding: "2rem",
    },
  })
);

export default useStyles;
