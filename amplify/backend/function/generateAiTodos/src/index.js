/* Amplify Params - DO NOT EDIT
	API_TODODEMO_GRAPHQLAPIENDPOINTOUTPUT
	API_TODODEMO_GRAPHQLAPIIDOUTPUT
	API_TODODEMO_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */ /*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["OPENAI_API_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const OpenAI = require("openai");
const AWS = require("aws-sdk");
const { SignatureV4 } = require("@aws-sdk/signature-v4");
const { defaultProvider } = require("@aws-sdk/credential-provider-node");
const { HttpRequest } = require("@aws-sdk/protocol-http");
const { Sha256 } = require("@aws-crypto/sha256-js");

const readUser = /* GraphQL */ `
  query ReadUser($id: ID!) {
    getUser(id: $id) {
      id
      subscriptionStatus
    }
  }
`;

//Environment variables
const GRAPHQL_API_ENDPOINT = process.env.API_TODODEMO_GRAPHQLAPIENDPOINTOUTPUT;
const AWS_REGION = process.env.REGION || "us-east-2";

exports.handler = async (event, context, callback) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  try {
    console.log("Received event arguments:", JSON.stringify(event.arguments));

    // 1) Parse input
    const userId = event.identity.claims.username;

    if (!userId) {
      return { error: "Unauthorized, missing userId" };
    }

    console.log("Checking subscription status for user:", userId);

    // check user subscription status
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

    const response = await executeGraphQL(readUser, { id: userId });
    const user = response.data.getUser;
    console.log("User:", user);

    if (!user) {
      return { error: "User not found" };
    } else if (
      !user.subscriptionStatus ||
      user.subscriptionStatus !== "active"
    ) {
      return { error: "User subscription not active" };
    } else {
      console.log("User subscription is active");
    }

    const { prompt } = event.arguments.input || {};
    console.log("Prompt:", prompt);

    // 2) Initialize OpenAI

    // Retrieve the OpenAI API key from SSM
    const aws = require("aws-sdk");
    const { Parameters } = await new aws.SSM()
      .getParameters({
        Names: ["OPENAI_API_KEY"].map((secretName) => process.env[secretName]),
        WithDecryption: true,
      })
      .promise();

    const openai = new OpenAI({
      apiKey: Parameters[0].Value,
    });

    // 3) Call the OpenAI API
    const completion = openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful assistant that generates tasks. Please return tasks as a single line, comma-separated list, with no extra text or numbering.",
        },
        {
          role: "user",
          content: `Generate tasks for: ${prompt}`,
        },
      ],
    });

    // 4) Parse AI response
    const rawText = await completion.then(
      (result) => result.choices[0].message.content
    );
    console.log("Raw AI output:", rawText);

    // 5)Split on commas, then trim each piece
    const todos = rawText.split(",").map((item) => item.trim());

    // 7) Return structured tasks to the caller
    return {
      tasks: todos,
    };
  } catch (err) {
    console.error("Error generating tasks:", err);
    throw err;
  }
};
