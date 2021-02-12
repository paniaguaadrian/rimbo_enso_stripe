// React Components
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { Route } from "react-router-dom";
import reportWebVitals from "./reportWebVitals";

// Styles
import "./index.css";

// Custom Components
import App from "./App";

ReactDOM.render(
  <Router>
    <Route exact path="/enso-coliving/tenant" component={App} />
  </Router>,
  document.getElementById("root")
);

reportWebVitals();
