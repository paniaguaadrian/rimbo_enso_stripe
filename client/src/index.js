import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from "react-router-dom";

import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

ReactDOM.render(
  <Router>
    <Route exact path="/enso-coliving/tenant" component={App} />
  </Router>,
  document.getElementById("root")
);

reportWebVitals();
