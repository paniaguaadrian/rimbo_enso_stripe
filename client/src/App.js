// Custom Components
import CardSetupForm from "./components/CardSetupForm";
import NavbarComponent from "./components/NavbarComponent";

// Stripe Components
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

// Styles
import "./App.css";

// Stripe
const stripePromise = loadStripe("pk_test_r37z8vhuXVT8y17zrNPMRQ7d00XhEDZvQO");

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
