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
import TermsAndConditions from "./components/TermsAndConditions/TermsAndConditions";

ReactDOM.render(
  <Router>
    <Route exact path="/enso-coliving/tenant" component={App} />
    <Route
      exact
      path="/enso-coliving/terms-and-conditions"
      component={TermsAndConditions}
    />
  </Router>,
  document.getElementById("root")
);

reportWebVitals();
