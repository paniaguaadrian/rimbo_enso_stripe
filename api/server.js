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

app.post("/stripe/submit-email", (req, res) => {
  const { tenantsName, tenantsEmail, tenantsPhone, timestamps } = req.body;

  // Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASSWORD,
    },
  });

  // Nodemailer
  const tenantEmail = {
    from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
    to: tenantsEmail, // tenant's email
    subject: "Enso&Rimbo - Successful Registration!",
    text: "",
    html: `<div>
      <h3 style='color:#6aa3a1'>Hi ${tenantsName},</h3>
      <p>Greetings from Rimbo and thank you for registering with Enso!</p>
      <p><b>Important:</b> Please, read the attached ‘Tenant’s guide to Rimbo’: How to make the most out of Rimbo.</p>
      <p><b>Enso coliving</b> joined forces with Rimbo to help you move you into your new home quick and easy - and deposit-free!</p>
      <p>With Rimbo, you ‘check in’ without paying cash deposit, and pay for any damages or unpaid rent only when you check out.</p>
      <p>It sounds great, doesn't it?<br/>
      Well - it’s true and you’re now part of the enso-Rimbo family!</p>
      <p>Enso’s team will be in touch with you with the following steps.</p>
      <p>Good luck with your move and enjoy your new home!</p>
      <p>Warm regards,</p>

      <h4 style='color:#6aa3a1'>Rimbo Rent</h4>
      
      <h4>Phone & WhatsApp: +34 623 063 769<br/>
      E-Mail: info@rimbo.com<br/>
      E-Mail:>Web: <a href="http://www.rimbo.rent">rimbo.rent</a>
      </h4>

      </div>`,
  };

  const rimboEmail = {
    from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
    to: tenantsEmail, // info@rimbo.rent
    subject: "Enso Coliving - Tenancy ID - New Tenant Confirmation",
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
    from: "Rimbo Rent | Enso co-living <process.env.EMAIL>",
    to: tenantsEmail, // enso...
    subject: `New tenant at Enso : ${tenantsEmail} | `,
    text: ` ${tenantsName}`,
    html: `<div>
      <h2 style="color: #6aa3a1">Hey there team enso,</h2>
      <p>Greetings and good news from Rimbo!<br/>
      There is a new tenant ready to move in with you deposit-free!</p>
      <p>The following Tenant has successfully registered on Rimbo’s platform:</p>
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
      <p>You can sign the rental agreement with the tenant now!</p>
      <p>Once it’s all done, please share with us via Google Drive:</p>
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
      E-Mail:>Web: <a href="http://www.rimbo.rent">rimbo.rent</a>
      </h4>
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
