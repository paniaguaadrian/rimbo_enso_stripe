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
    const { tenantsName, tenantsEmail, tenantsPhone } = req.body;

    // Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD,
      },
    });

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

    // Nodemailer
    const tenantEmail = {
      from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
      to: tenantsEmail, // tenant's email
      subject: `¡Tarjeta registrada correctamente ${tenantsName} !`,
      text: "",
      html: `<div>
      <h3 style='color:#6aa3a1'>Buenas noticias ${tenantsName}</h3>
      <p>¡Tu tarjeta se ha registrado correctamente! Ya puedes continuar con la firma de tu contrato de alquiler.</p>
      <p>¡Estás a un solo paso de mudarte a tu nuevo piso! Contacta con tu agente inmobiliario/propietario para conocer los siguientes pasos.</p>
      <p>Atentamente,</p>
      <h4 style='color:#6aa3a1'>Rimbo Rent</h4>
      </div>`,
    };

    const rimboEmail = {
      from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
      to: tenantsEmail, // info@rimbo.rent
      subject: `New tenant at Enso : ${tenantsEmail} | `,
      text: ` ${tenantsName} Customer: id ${customer.id}`,
      html: `<div>
      <h2 style="color: #6aa3a1">New tenant from Enso confirm his/her payment options.</h2>
      <h3>Tenant's Information:</h3>
      <ul>
      <li>
      Tenant's name : ${tenantsName}
      </li>
      <li>
      Tenant's email : ${tenantsEmail}
      </li>
      <li>
      Tenant's customerID (From Stripe) : ${customer.id}
      </li>
      <li>
      Tenant's phone : ${tenantsPhone}
      </li>
      </ul>
      </div>`,
    };

    const ensoEmail = {
      from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
      to: tenantsEmail, // enso...
      subject: `New tenant at Enso : ${tenantsEmail} | `,
      text: ` ${tenantsName} Customer: id ${customer.id}`,
      html: `<div>
      <h2 style="color: #6aa3a1">New tenant from Enso confirm his/her payment options with Rimbo Rent.</h2>
      <h3>Tenant's Information:</h3>
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
      </ul>
      </div>`,
    };

    transporter.sendMail(tenantEmail, (err, data) => {
      if (err) {
        console.log("There is an error here...!");
      } else {
        console.log("Email sent!");
      }
    });

    transporter.sendMail(rimboEmail, (err, data) => {
      if (err) {
        console.log("There is an error here...!");
      } else {
        console.log("Email sent!");
      }
    });

    transporter.sendMail(ensoEmail, (err, data) => {
      if (err) {
        console.log("There is an error here...!");
      } else {
        console.log("Email sent!");
      }
    });

    res.status(200).json(intent.client_secret);
  } catch (error) {
    res.status(500).json({ statusCode: 500, message: error.message });
  }
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
