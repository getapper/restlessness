import { makeStyles } from "@material-ui/core/styles";
import { createStyles, Theme } from "@material-ui/core";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      padding: "2rem",
    },
  })
);

export default useStyles;
