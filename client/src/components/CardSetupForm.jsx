// React Components
import React, { useState } from "react";
import axios from "axios";

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
    const cardElement = elements.getElement("card");
    const api_rimbo = process.env.REACT_APP_API_RIMBO;
    const api_stripe_enso = process.env.REACT_APP_API_STRIPE_ENSO;

    setProcessingTo(true);

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

        await axios.post(`${api_rimbo}`, {
          tenantsName: tenantsName,
          tenantsEmail: tenantsEmail,
          tenantsPhone: tenantsPhone,
          isAccepted: isAccepted,
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
                Estamos muy ilusionados de que hayas decidido formar parte de
                Enso y somos conscientes de que para ti es muy importante
                mudarte de una manera fácil, ágil y asequible.
              </p>
              <p>
                Por esto en Enso nuestras habitaciones no necesitan fianza en
                efectivo.
              </p>
              <p>
                Con nosotros no tienes que adelantar la fianza. Cuando hagas
                check-out, se te cargará únicamente en caso de que haya impagos
                o daños causados por tu parte.
              </p>
              <p>
                Te pediremos algunos datos personales y también tu tarjeta de
                débito. No te cobraremos nada ni bloqueamos tu tarjeta. Estos
                datos se guardarán hasta que finalice el alquiler.
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

                {/* <div className="charge-container">
                  <p className="charge-text">Importe a pagar ahora:</p>
                  <p className="charge-text">0.00 €</p>
                </div> */}

                <div className="terms-container">
                  <input type="checkbox" id="terms" required />
                  <p className="checkbox_text">
                    Enviando tus datos aceptas las{" "}
                    <a
                      href="https://rimbo.rent/terminos-y-condiciones/"
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
                <button
                  disabled={isProcessing || !stripe}
                  className="btn-submit-stripe"
                >
                  {isProcessing ? "Enviando..." : "Enviar mis datos"}
                </button>
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
              <h1>¡Ya hemos registrado tus datos!</h1>
            </div>
            <main className="form-full-container-success">
              <div className="form-header-left-success">
                <p>A partir de ahora....</p>
                <p>Ten en cuenta...</p>
                <p>Si tienes alguna duda...</p>
                <p>Bienvenido a ...</p>
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
