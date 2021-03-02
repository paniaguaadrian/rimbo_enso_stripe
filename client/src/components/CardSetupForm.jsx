// React Components
import React, { useState, useEffect } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";

// Stripe Components
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Images
import EnsoImage from "../images/enso-coliving-success.jpg";
import StripeLogo from "../images/secure-payments.png";
import RimboLogo from "../images/rimbo-logo.png";
import SpanishLogo from "../images/spanish-language.png";
import EnglishLogo from "../images/english-language.png";

// Styles
import "./CardSection.css";
import "./CardSetupForm.css";
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: "#32325d",
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: "antialiased",
      fontSize: "14px",
      "::placeholder": {
        color: "#aab7c4",
      },
    },
    invalid: {
      color: "#fa755a",
      iconColor: "#fa755a",
    },
  },
  hidePostalCode: true,
};

const CardSetupForm = () => {
  const [language, setLanguage] = useState("english");
  const [text, setText] = useState({});

  const toggleLanguage = () => {
    setLanguage((prev) => {
      if (prev === "english") return "spanish";
      return "english";
    });
  };

  useEffect(() => {
    fetch(`/${language}.json`)
      .then((res) => res.json())
      .then((data) => setText(data))
      .catch((err) => console.error(err.message));
  }, [language]);

  const [isProcessing, setProcessingTo] = useState(false);
  const [checkoutError, setCheckoutError] = useState();

  const [isSuccessfullySubmitted, setIsSuccessfullySubmitted] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const handleCardDetailsChange = (ev) => {
    ev.error ? setCheckoutError(ev.error.message) : setCheckoutError();
  };

  const handleFormSubmit = async (ev) => {
    ev.preventDefault();
    const tenantsEmail = document.getElementById("email").value;
    const tenantsName = document.getElementById("name").value;
    const tenantsPhone = document.getElementById("phone").value;
    const isAccepted = document.getElementById("terms").checked;
    const propertyManagerName = "Enso Coliving";
    const timestamps = new Date()
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    const cardElement = elements.getElement("card");
    const api_rimbo_enso_tenant = process.env.REACT_APP_API_RIMBO_ENSO_TENANT;
    const api_stripe_enso = process.env.REACT_APP_API_STRIPE_ENSO;
    const api_stripe_enso_email = process.env.REACT_APP_API_STRIPE_ENSO_EMAIL;

    setProcessingTo(true);

    // ! Development / Production API's
    // * Stripe Action
    // "http://localhost:8080/stripe/card-wallet" (D)
    // `${api_stripe_enso}` (P)
    // * Emails Action
    // "http://localhost:8080/stripe/submit-email" (D)
    // `${api_stripe_enso_email}` (P)
    // * Send data to Rimbo API
    // "http://localhost:8081/api/tenants/enso" (D)
    // `${api_rimbo_enso_tenant}` (P)

    try {
      const { data: client_secret } = await axios.post(`${api_stripe_enso}`, {
        tenantsName,
        tenantsEmail,
        tenantsPhone,
      });

      const { error } = await stripe.confirmCardSetup(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: tenantsName,
            email: tenantsEmail,
            phone: tenantsPhone,
          },
        },
      });

      if (error) {
        setCheckoutError("* Rellena todos los campos del formulario.");
        setProcessingTo(false);
        return;
      } else {
        setIsSuccessfullySubmitted(true);

        await axios.post(`${api_rimbo_enso_tenant}`, {
          tenantsName: tenantsName,
          tenantsEmail: tenantsEmail,
          tenantsPhone: tenantsPhone,
          isAccepted: isAccepted,
          propertyManagerName: propertyManagerName,
        });

        await axios.post(`${api_stripe_enso_email}`, {
          tenantsName,
          tenantsEmail,
          tenantsPhone,
          timestamps,
        });
      }
    } catch (err) {
      setCheckoutError(err.message);
    }
  };

  return (
    <>
      {!isSuccessfullySubmitted ? (
        <>
          <div className="hero-section-container">
            <div className="toggle-button-container">
              {language === "english" ? (
                <button
                  onClick={toggleLanguage}
                  className="toggle-language-button"
                >
                  <img
                    src={SpanishLogo}
                    alt="Spanish language logo"
                    className="language-logo"
                  />
                </button>
              ) : (
                <button
                  onClick={toggleLanguage}
                  className="toggle-language-button"
                >
                  <img
                    src={EnglishLogo}
                    alt="English language logo"
                    className="language-logo"
                  />
                </button>
              )}
            </div>

            <h1>
              {text.titlePartOne}{" "}
              <span className="underline-text">{text.titlePartTwo}</span>!
            </h1>
          </div>
          <main className="form-full-container">
            <div className="form-header-left">
              <p>{text.informationOne}</p>
              <p className="important_p">{text.informationTwo}</p>
              <p>{text.informationThree}</p>
              <div className="rimbo-sign">
                <h4>Powered by</h4>
                <img src={RimboLogo} alt="Rimbo Rent Logo" />
              </div>
            </div>
            <div className="form-container">
              <form onSubmit={handleFormSubmit}>
                <div className="form-element">
                  <label htmlFor="name">{text.nameLabel}</label>
                  <input
                    type="text"
                    id="name"
                    required
                    name="name"
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-element">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    placeholder="john@example.com"
                  />
                </div>
                <div className="form-element">
                  <label htmlFor="phone">{text.telLabel}</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    required
                    placeholder={text.telPlaceholder}
                  />
                </div>
                <div className="form-element">
                  <label className="stripe-label">
                    <h4 className="card-header">{text.cardTitle}</h4>
                    <p className="card-subtitle">{text.cardSubtitle}</p>
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={handleCardDetailsChange}
                    />
                  </label>
                </div>
                <div className="advice-security-container">
                  <p className="advice-security-text">{text.adviceText}</p>
                  <p></p>
                </div>
                <div className="terms-container">
                  <input type="checkbox" id="terms" required />
                  <p className="checkbox_text">
                    {text.terms1}{" "}
                    <a
                      href="/enso-terms"
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {" "}
                      {text.terms2}
                    </a>
                    ,{" "}
                    <a
                      href={text.privacy}
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {" "}
                      {text.terms3}
                    </a>
                    ,{" "}
                    <a
                      href={text.cookies}
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {text.terms4}
                    </a>{" "}
                    {text.terms5}
                  </p>
                </div>
                <div className="error-container">
                  <p className="error-message">{checkoutError}</p>
                </div>

                {isProcessing ? (
                  <Loader
                    type="Puff"
                    color="#01d2cc"
                    height={50}
                    width={50}
                    timeout={3000} //3 secs
                  />
                ) : (
                  <button
                    disabled={isProcessing || !stripe}
                    className="btn-submit-stripe"
                  >
                    {text.sendButton}
                  </button>
                )}
              </form>
              <div className="security-container">
                <img
                  className="stripe-logo"
                  src={StripeLogo}
                  alt="Stripe Security Payment Logo"
                />
              </div>
            </div>
          </main>
        </>
      ) : (
        <div className="success">
          <>
            <div className="hero-section-container">
              <h1>{text.successOne}</h1>
            </div>
            <main className="form-full-container-success">
              <div className="form-header-left-success">
                <p>{text.successTwo}</p>
                <p>{text.successThree}</p>
                <p>{text.successFour}</p>
              </div>
              <div className="success-container-right">
                <img src={EnsoImage} alt="Enso co-living logo" />
              </div>
            </main>
            <div className="rimbo-sign-success">
              <h4>Powered by</h4>
              <img src={RimboLogo} alt="Rimbo Rent Logo" />
            </div>
          </>
        </div>
      )}
    </>
  );
};

export default CardSetupForm;
