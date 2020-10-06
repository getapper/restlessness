import React from "react";
import { MuiThemeProvider } from "@material-ui/core";
import useAppHooks from "./App.hooks";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "../scenes/Dashboard";
import ServicesList from "../scenes/ServicesList";
import EndpointsList from "../scenes/EndpointsList";
import EndpointDetails from "../scenes/EndpointDetails";
import Header from "../components/Header";

const App: React.FC = () => {
  const { classes, theme } = useAppHooks();

  return (
    <MuiThemeProvider theme={theme}>
      <Header />
      <div className={classes.routerContainer}>
        <Router>
          <Switch>
            <Route path="/endpoints/:endpointId">
              <EndpointDetails />
            </Route>
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
