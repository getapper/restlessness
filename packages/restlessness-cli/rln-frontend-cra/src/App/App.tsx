import React from "react";
import {
  MuiThemeProvider,
  AppBar,
  Toolbar,
  Breadcrumbs,
  Link,
  Typography,
} from "@material-ui/core";
import useAppHooks from "./App.hooks";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import ServicesList from "../scenes/ServicesList";

const App: React.FC = () => {
  const { classes, theme } = useAppHooks();

  return (
    <MuiThemeProvider theme={theme}>
      <AppBar>
        <Toolbar variant="dense">
          <Breadcrumbs aria-label="breadcrumb">
            <Link color="inherit" href="/">
              Material-UI
            </Link>
            <Link color="inherit" href="/getting-started/installation/">
              Core
            </Link>
            <Typography color="textPrimary">Breadcrumb</Typography>
          </Breadcrumbs>
        </Toolbar>
      </AppBar>
      <div className={classes.routerContainer}>
        <Router>
          <Switch>
            <Route path="/">
              <ServicesList />
            </Route>
          </Switch>
        </Router>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
