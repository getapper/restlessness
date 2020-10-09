import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "swagger-ui-react/swagger-ui.css";
import App from "./App/App";
import { Provider } from "react-redux";
import * as serviceWorker from "./serviceWorker";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor, history } from "redux-store";
import { CircularProgress } from "@material-ui/core";
import { ConnectedRouter } from "connected-react-router";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<CircularProgress />} persistor={persistor}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </PersistGate>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
