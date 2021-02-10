// Custom Components
import CardSetupForm from "./components/CardSetupForm";
import NavbarComponent from "./components/NavbarComponent";

// Stripe Components
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Styles
import "./App.css";

// Stripe
const stripePromise = loadStripe("pk_live_6p9ee84PINDA4OOZm6akKRFN004xTau8S7");

const App = () => {
  return (
    <main className="App">
      <div>
        <NavbarComponent />
        <div>
          <Elements stripe={stripePromise}>
            <CardSetupForm />
          </Elements>
        </div>
      </div>
    </main>
  );
};

export default App;
