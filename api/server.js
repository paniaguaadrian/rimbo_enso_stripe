// Server Components
import path from "path";
import express from "express";
import dotenv from "dotenv";
import colors from "colors";
import morgan from "morgan";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";
import Stripe from "stripe";
import cors from "cors";

// Nodemailer
import nodemailer from "nodemailer";
import sgTransport from "nodemailer-sendgrid-transport";
import hbs from "nodemailer-express-handlebars";

dotenv.config();
const app = express();

app.set("trust proxy", true);

// Cors
app.use(cors());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

const stripe = new Stripe(process.env.SECRET_KEY);

app.use(express.static("."));
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/stripe/card-wallet", (req, res) => {
  res.send("Api is working...!");
});

app.post("/stripe/card-wallet", async (req, res) => {
  try {
    const { tenantsName, tenantsEmail } = req.body;

    // Stripe
    const customer = await stripe.customers.create({
      name: tenantsName,
      email: tenantsEmail,
    });

    const intent = await stripe.setupIntents.create({
      customer: customer.id,
      payment_method_options: {
        card: { request_three_d_secure: "any" },
      },
    });

    res.status(200).json(intent.client_secret);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
});

app.get("/stripe/submit-email", (req, res) => {
  res.send("Email send API..!");
});

app.post("/stripe/submit-email/en", (req, res) => {
  const {
    tenantsName,
    tenantsEmail,
    tenantsPhone,
    randomID,
    timestamps,
  } = req.body;

  const rimboEmailAddress = "info@rimbo.rent";
  const ensoEmailAddress = "hello@ensospaces.com";

  const transporter = nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API,
      },
    })
  );

  let options = {
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: "views/",
      defaultLayout: "index",
    },
    viewPath: "views/",
  };

  transporter.use("compile", hbs(options));

  // Nodemailer
  const tenantEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: tenantsEmail,
    subject: "Enso & Rimbo - Successful Registration!",
    text: "",
    attachments: [
      {
        filename: "rimbo-logo.png",
        path: "./views/images/rimbo-logo.png",
        cid: "rimbologo",
      },
      {
        filename: "Enso_Tenant General Rules & Guidelines_Eng.pdf",
        path: "./views/images/Enso_Tenant General Rules & Guidelines_Eng.pdf",
      },
    ],
    template: "index",
    context: {
      tenantsName,
    },
  };
  const rimboEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: rimboEmailAddress,
    subject: "TenantID:Enso Coliving - New Tenant Confirmation",
    text: "",
    html: `<div>
      <h2 style="color: #6aa3a1">Hello Rimbo team</h2>
      <p>Congrats! A new Tenant is joining Enso Coliving:</p>
      <ul>
      <li>
      Tenant's name : ${tenantsName}
      </li>
      <li>
      Tenant's email : ${tenantsEmail}
      </li>
      <li>
      Tenant's phone : ${tenantsPhone}
      </li>
      <li>
      T&C signed and BA provided on: ${timestamps}
      </li>
      <li>
      Tenant's ID: ${randomID}
      </li>
      </ul>
      <p>Check if the user has been successfully created in Stripe and review SEPA information.
      Follow up for a contract and documents until closed.</p>
      </div>`,
  };
  const ensoEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: ensoEmailAddress,
    subject: `Rimbo - New Tenant Confirmation | `,
    text: ` ${tenantsName}`,
    html: `<div>
      <h2 style="color: #6aa3a1">Hey there team <b>enso</b>,</h2>
      <p>Greetings and good news from Rimbo!<br/>
      There is a new tenant ready to move in with you deposit-free!</p>
      <p>The following Tenant has successfully registered on Rimbo’s platform:</p>
      <ul>
      <li>
      Tenant Full Name: ${tenantsName}
      </li>
      <li>
      Tenant Email Address: ${tenantsEmail}
      </li>
      <li>
      Tenant Phone number: ${tenantsPhone}
      </li>
      </ul>
      <p>You can sign the rental agreement with the tenant now!</p>
      <p><b>Once it’s all done, please share with us via Google Drive:</b></p>
      <ul>
      <li>
      The tenancy details as per the template
      </li>
      <li>
      The signed Rimbo annex to the rental agreement
      </li>
      </ul>
      <p>We’re excited to have ${tenantsName} join the enso/Rimbo family!</p>
      <p>If you need any further information or support from our side - please, let us know!</p>

      <h4 style='color:#6aa3a1'>Client Management</h4>
      
      <h4>Phone & WhatsApp: +34 623 063 769<br/>
      E-Mail: info@rimbo.com<br/>
      Web: <a href="http://www.rimbo.rent">rimbo.rent</a>
      </h4>
      </div>`,
  };

  transporter.sendMail(tenantEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  transporter.sendMail(rimboEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  transporter.sendMail(ensoEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  res.status(200).json();
});

app.post("/stripe/submit-email/es", (req, res) => {
  const { tenantsName, tenantsEmail, tenantsPhone, timestamps } = req.body;

  const transporter = nodemailer.createTransport(
    sgTransport({
      auth: {
        api_key: process.env.SENDGRID_API,
      },
    })
  );

  let options = {
    viewEngine: {
      extname: ".handlebars",
      layoutsDir: "views/",
      defaultLayout: "indexes",
    },
    viewPath: "views/",
  };

  transporter.use("compile", hbs(options));

  // Nodemailer
  const tenantEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: tenantsEmail,
    subject: "Enso & Rimbo - Registro completado con éxito!",
    text: "",
    attachments: [
      {
        filename: "rimbo-logo.png",
        path: "./views/images/rimbo-logo.png",
        cid: "rimbologo",
      },
      {
        filename: "Enso_Inquilino_Guia_Reglas Generales_Es.pdf",
        path: "./views/images/Enso_Inquilino_Guia_Reglas Generales_Es.pdf",
      },
    ],
    template: "indexes",
    context: {
      tenantsName,
    },
  };
  const rimboEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: tenantsEmail, // ! info@rimbo.rent
    subject: "Enso Coliving - New Tenant Confirmation",
    text: "",
    html: `<div>
      <h2 style="color: #6aa3a1">Hello Rimbo team</h2>
      <p>Congrats! A new Tenant is joining Enso Coliving:</p>
      <ul>
      <li>
      Tenant's name : ${tenantsName}
      </li>
      <li>
      Tenant's email : ${tenantsEmail}
      </li>
      <li>
      Tenant's phone : ${tenantsPhone}
      </li>
      <li>
      T&C signed and BA provided on: ${timestamps}
      </li>
      </ul>
      <p>Check if the user has been successfully created in Stripe and review SEPA information.
      Follow up for a contract and documents until closed.</p>
      </div>`,
  };
  const ensoEmail = {
    from: "Enso | Rimbo info@rimbo.rent",
    to: tenantsEmail, // ! ENSO...
    subject: `Rimbo - Nuevo Inquilino Confirmado | `,
    text: ` ${tenantsName}`,
    html: `<div>
      <h2 style="color: #6aa3a1">Hola equipo de <b>Enso</b>,</h2>
      <p>¡Saludos y buenas noticias de parte de Rimbo!<br/>
      ¡Hay un inquilino que está listo para mudarse sin depósito!</p>
      <p>El siguiente inquilino se ha registrado correctamente en nuestro sistema:</p>
      <ul>
      <li>
      Nombre Completo: ${tenantsName}
      </li>
      <li>
      Correo Electrónico: ${tenantsEmail}
      </li>
      <li>
      Número de teléfono: ${tenantsPhone}
      </li>
      </ul>
      <p>¡Podéis continuar con la firma del contrato de alquiler con el inquilino!</p>
      <p><b>Una vez que todo esté listo, por favor, compartid con nosotros en Google Drive:</b></p>
      <ul>
      <li>
      Los detalles del inquilino y del alquiler en el Tenancy Tracker
      </li>
      <li>
      El Anexo al contrato de alquiler de Rimbo
      </li>
      </ul>
      <p>¡Estamos emocionados de que ${tenantsName} se vaya a unir a la familia de
      Enso/Rimbo!</p>
      <p>En caso que necesitéis cualquier tipo de ayuda o soporte, estamos aquí para vosotros!</p>

      <h4 style='color:#6aa3a1'>Gestión de Clientes</h4>
      
      <h4>Móvil & WhatsApp: +34 623 063 769<br/>
      E-Mail: info@rimbo.com<br/>
      Web: <a href="http://www.rimbo.rent">rimbo.rent</a>
      </h4>
      </div>`,
  };

  transporter.sendMail(tenantEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  transporter.sendMail(rimboEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  transporter.sendMail(ensoEmail, (err, data) => {
    if (err) {
      console.log("There is an error here...!" + err);
    } else {
      console.log("Email sent!");
    }
  });

  res.status(200).json();
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 8080;

app.listen(
  PORT,
  console.log(
    `Server runing in ${process.env.NODE_ENV} port ${PORT}`.yellow.bold
  )
);
