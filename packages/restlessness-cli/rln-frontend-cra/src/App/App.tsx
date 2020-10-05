import React from "react";
import { MuiThemeProvider, AppBar, Toolbar } from "@material-ui/core";
import useAppHooks from "./App.hooks";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "../scenes/Dashboard";
import ServicesList from "../scenes/ServicesList";
import EndpointsList from "../scenes/EndpointsList";
import AppBreadcrumbs from "../components/AppBreadcrumbs";

const App: React.FC = () => {
  const { classes, theme } = useAppHooks();

  return (
    <MuiThemeProvider theme={theme}>
      <AppBar>
        <Toolbar variant="dense">
          <AppBreadcrumbs />
        </Toolbar>
      </AppBar>
      <div className={classes.routerContainer}>
        <Router>
          <Switch>
            <Route path="/endpoints">
              <EndpointsList />
            </Route>
            <Route path="/services">
              <ServicesList />
            </Route>
            <Route path="/">
              <Dashboard />
            </Route>
          </Switch>
        </Router>
      </div>
    </MuiThemeProvider>
  );
};

export default App;
