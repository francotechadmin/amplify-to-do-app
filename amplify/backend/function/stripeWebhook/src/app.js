/* Amplify Params - DO NOT EDIT
	API_TODODEMO_GRAPHQLAPIENDPOINTOUTPUT
	API_TODODEMO_GRAPHQLAPIIDOUTPUT
	API_TODODEMO_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const express = require("express");
const aws = require("aws-sdk");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { HttpRequest } = require("@aws-sdk/protocol-http");
const { Sha256 } = require("@aws-crypto/sha256-js");

// Environment variables
const GRAPHQL_API_ENDPOINT = process.env.API_TODODEMO_GRAPHQLAPIENDPOINTOUTPUT;
const GRAPHQL_API_KEY = process.env.API_TODODEMO_GRAPHQLAPIKEYOUTPUT;
const AWS_REGION = process.env.REGION || "us-east-2";

// Declare a new Express app

const app = express();

app.use(
  bodyParser.json({
    verify: function (req, res, buf) {
      req.rawBody = buf.toString();
    },
  })
);

// If this route becomes complex, consider environment checks or additional middlewares
app.use((req, res, next) => {
  if (req.originalUrl === "/") {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Enable AWS middleware
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Initialize variables
let stripe;
let endpointSecret;

// Asynchronously load secrets from SSM
async function initializeSecrets() {
  console.log("Loading secrets from SSM...");
  try {
    const ssm = new aws.SSM();
    const { Parameters } = await ssm
      .getParameters({
        Names: [
          process.env.STRIPE_SECRET_KEY,
          process.env.STRIPE_WEBHOOK_SECRET,
        ],
        WithDecryption: true,
      })
      .promise();

    const secretMap = {};
    for (const param of Parameters) {
      secretMap[param.Name] = param.Value;
    }

    console.log("Secrets loaded successfully:", secretMap);

    stripe = require("stripe")(secretMap[process.env.STRIPE_SECRET_KEY]);
    endpointSecret = secretMap[process.env.STRIPE_WEBHOOK_SECRET];
    console.log("Stripe initialized with secret key and webhook secret.");
  } catch (error) {
    console.error("Error loading secrets from SSM:", error);
    process.exit(1); // Exit if secrets cannot be loaded
  }
}

// Declare mutation to update a user's subscription status
const updateUser = /* GraphQL */ `
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      subscriptionStatus
    }
  }
`;

/**
 * Sign and execute a GraphQL operation against AppSync using SigV4.
 * @param {string} query - The GraphQL query or mutation string.
 * @param {object} variables - The variables for the GraphQL operation.
 * @returns {Promise<object>} - The JSON response from AppSync.
 */
async function executeGraphQL(query, variables) {
  console.log("Preparing to execute GraphQL operation:");
  console.log("Query:", query);
  console.log("Variables:", JSON.stringify(variables, null, 2));

  const endpoint = new URL(GRAPHQL_API_ENDPOINT);

  const requestToBeSigned = new HttpRequest({
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      host: endpoint.host,
    },
    hostname: endpoint.host,
    body: JSON.stringify({ query, variables }),
    path: endpoint.pathname,
  });

  const signer = new SignatureV4({
    credentials: defaultProvider(),
    region: AWS_REGION,
    service: "appsync",
    sha256: Sha256,
  });

  let signed;
  try {
    signed = await signer.sign(requestToBeSigned);
    console.log("Request successfully signed with IAM credentials.");
  } catch (signError) {
    console.error("Error signing the request:", signError);
    throw signError;
  }

  console.log(
    "Sending signed request to AppSync endpoint:",
    GRAPHQL_API_ENDPOINT
  );
  const response = await fetch(GRAPHQL_API_ENDPOINT, {
    method: signed.method,
    headers: signed.headers,
    body: signed.body,
  });

  const json = await response.json();
  console.log("GraphQL Response:", JSON.stringify(json, null, 2));

  if (!response.ok || json.errors) {
    console.error(
      "GraphQL responded with errors:",
      JSON.stringify(json.errors, null, 2)
    );
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }

  console.log("GraphQL operation executed successfully.");
  return json;
}

async function executeGraphQLwithApiKey(query, variables) {
  console.log("Preparing to execute GraphQL operation:");
  console.log("Query:", query);
  console.log("Variables:", JSON.stringify(variables, null, 2));

  const endpoint = new URL(GRAPHQL_API_ENDPOINT);

  const response = await fetch(GRAPHQL_API_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": GRAPHQL_API_KEY,
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = await response.json();
  console.log("GraphQL Response:", JSON.stringify(json, null, 2));

  if (!response.ok || json.errors) {
    console.error(
      "GraphQL responded with errors:",
      JSON.stringify(json.errors, null, 2)
    );
    throw new Error(`GraphQL Error: ${JSON.stringify(json.errors)}`);
  }

  console.log("GraphQL operation executed successfully.");
  return json;
}

// Webhook handler
app.post(
  "/stripeWebhook",
  // Stripe requires the raw body to construct the event
  express.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("Webhook received");

    let event = req.body;
    // Verify the event if endpointSecret is defined
    if (endpointSecret) {
      const signature = req.headers["stripe-signature"];
      try {
        event = stripe.webhooks.constructEvent(
          req.rawBody,
          signature,
          endpointSecret
        );
        console.log("Stripe event verified successfully.");
      } catch (err) {
        console.error(
          "⚠️  Webhook signature verification failed:",
          err.message
        );
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }
    }

    console.log("Stripe Event Type:", event.type);
    console.log(
      "Stripe Event Object:",
      JSON.stringify(event.data.object, null, 2)
    );

    const eventType = event.type;
    const stripeObject = event.data.object;
    let input = {};

    if (eventType === "checkout.session.completed") {
      const customerId = stripeObject.metadata.userId;
      input = { id: customerId, subscriptionStatus: "active" };
    } else if (eventType === "customer.subscription.deleted") {
      const customerId = stripeObject.metadata.userId;
      input = { id: customerId, subscriptionStatus: "inactive" };
    } else if (eventType === "customer.subscription.updated") {
      const customerId = stripeObject.metadata.userId;
      input = { id: customerId, subscriptionStatus: stripeObject.status };
    } else {
      console.log(`Unhandled event type: ${eventType}`);
      return res.status(200).send("Event received and ignored.");
    }

    console.log("Updating user subscription status with input:", input);

    try {
      const updatedUser = await executeGraphQL(updateUser, {
        input,
      });
      console.log(
        "User subscription status updated successfully:",
        JSON.stringify(updatedUser, null, 2)
      );
      return res.status(200).send("Webhook processed successfully");
    } catch (err) {
      console.error("Error updating user subscription status:", err);
      return res.status(500).send("Error updating user subscription status");
    }
  }
);

// Start the app after loading secrets
(async () => {
  console.log("Initializing application...");
  await initializeSecrets();
  app.listen(3000, () => {
    console.log("App started and listening on port 3000");
  });
})();

module.exports = app;
