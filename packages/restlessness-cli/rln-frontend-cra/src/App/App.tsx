import React from "react";
import { MuiThemeProvider } from "@material-ui/core";
import useAppHooks from "./App.hooks";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import Dashboard from "../scenes/Dashboard";
import ServicesList from "../scenes/ServicesList";
import ServiceCreate from "../scenes/ServiceCreate";
import EndpointsList from "../scenes/EndpointsList";
import EndpointDetails from "../scenes/EndpointDetails";
import Header from "../components/Header";
import EndpointCreate from "../scenes/EndpointCreate";
import ModelsList from "../scenes/ModelsList";
import ModelCreate from "../scenes/ModelCreate";
import Swagger from "../scenes/Swagger";
import InfosDetails from "../scenes/InfosDetails";
import SchedulesList from "scenes/SchedulesList";
import ScheduleCreate from "scenes/ScheduleCreate";

const App: React.FC = () => {
  const { classes, theme } = useAppHooks();

  return (
    <MuiThemeProvider theme={theme}>
      <Header />
      <div className={classes.routerContainer}>
        <Router>
          <Switch>
            <Route path="/endpoints/create">
              <EndpointCreate />
            </Route>
            <Route path="/endpoints/:endpointId">
              <EndpointDetails />
            </Route>
            <Route path="/endpoints">
              <EndpointsList />
            </Route>
            <Route path="/services/create">
              <ServiceCreate />
            </Route>
            <Route path="/services">
              <ServicesList />
            </Route>
            <Route path="/models/create">
              <ModelCreate />
            </Route>
            <Route path="/models">
              <ModelsList />
            </Route>
            <Route path="/swagger">
              <Swagger />
            </Route>
            <Route path="/infos">
              <InfosDetails />
            </Route>
            <Route path="/schedules/create">
              <ScheduleCreate />
            </Route>
            <Route path="/schedules">
              <SchedulesList />
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
