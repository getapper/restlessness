import { makeStyles } from "@material-ui/core/styles";
import { createStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: "2rem",
    },
    buttonContainer: {
      padding: "1rem",
      marginTop: "1rem",
    },
  })
);

export default useStyles;
