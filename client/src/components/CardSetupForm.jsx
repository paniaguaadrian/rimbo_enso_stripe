// React Components
import React, { useState } from "react";
import axios from "axios";
import Loader from "react-loader-spinner";

// Stripe Components
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";

// Images
import EnsoImage from "../images/enso-coliving-success.jpg";
import StripeLogo from "../images/secure-payments.png";
import RimboLogo from "../images/rimbo-logo.png";

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
    // "http://localhost:8081/api/enso/tenants" (D)
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
            <h1>
              ¡Alquila esta habitación{" "}
              <span className="underline-text">sin pagar fianza</span>!
            </h1>
          </div>
          <main className="form-full-container">
            <div className="form-header-left">
              <p>
                Desde Enso estamos muy contentos de que quieras formar parte de
                esta gran familia, y como buena familia, nos gusta cuidar de los
                nuestros.
              </p>
              <p className="important_p">
                Alquiler sin fianza, para que te gastes el dinero en lo que tú
                quieras.
              </p>
              <p>
                Con Enso puedes mudarte de manera rápida, fácil y asequible.
                Solo tendrás que rellenar este pequeño formulario con tus
                datos... Y LISTO
              </p>
              <div className="rimbo-sign">
                <h4>Powered by</h4>
                <img src={RimboLogo} alt="Rimbo Rent Logo" />
              </div>
            </div>
            <div className="form-container">
              <form onSubmit={handleFormSubmit}>
                <div className="form-element">
                  <label htmlFor="name">Nombre completo</label>
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
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    required
                    placeholder="Tu número de contacto"
                  />
                </div>
                <div className="form-element">
                  <label className="stripe-label">
                    <h4 className="card-header">Detalles tarjeta</h4>
                    <CardElement
                      options={CARD_ELEMENT_OPTIONS}
                      onChange={handleCardDetailsChange}
                    />
                  </label>
                </div>
                <div className="advice-security-container">
                  <p className="advice-security-text">
                    * Solo preautorización, limitada por importe hasta 1 mes de
                    alquiler
                  </p>
                  <p></p>
                </div>
                <div className="terms-container">
                  <input type="checkbox" id="terms" required />
                  <p className="checkbox_text">
                    Enviando tus datos aceptas las{" "}
                    <a
                      href="/enso-coliving/terms-and-conditions"
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {" "}
                      Condiciones Generales
                    </a>
                    ,{" "}
                    <a
                      href="https://rimbo.rent/politica-privacidad/"
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {" "}
                      Política de Privacidad
                    </a>
                    ,{" "}
                    <a
                      href="https://rimbo.rent/politica-cookies/"
                      target="_blank"
                      rel="noreferrer"
                      className="link-tag"
                    >
                      {" "}
                      Política de Cookies{" "}
                    </a>{" "}
                    de Rimbo Rent.
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
                    Enviar mis datos
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
              <h1>¡Ya eres parte de Enso!</h1>
            </div>
            <main className="form-full-container-success">
              <div className="form-header-left-success">
                <p>En unos momentos Guille te enviará el contrato.</p>
                <p>
                  Si tienes alguna duda, el equipo de Enso está disponible para
                  ti.
                </p>
                <p>Ahora toca disfrutar de la mejor experiencia de tu vida.</p>
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
