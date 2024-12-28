/*
Use the following code to retrieve configured secrets from SSM:

const aws = require('aws-sdk');

const { Parameters } = await (new aws.SSM())
  .getParameters({
    Names: ["STRIPE_SECRET_KEY"].map(secretName => process.env[secretName]),
    WithDecryption: true,
  })
  .promise();

Parameters will be of the form { Name: 'secretName', Value: 'secretValue', ... }[]
*/

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
const aws = require("aws-sdk");

exports.handler = async (event) => {
  try {
    const { planId, userId, email } = event.arguments.input; // AppSync resolver passes this under `event.arguments`

    const { Parameters } = await new aws.SSM()
      .getParameters({
        Names: ["STRIPE_SECRET_KEY"].map(
          (secretName) => process.env[secretName]
        ),
        WithDecryption: true,
      })
      .promise();

    const stripe = require("stripe")(Parameters[0].Value);

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: planId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      metadata: {
        userId: userId,
      },
      customer_email: email,
      success_url: "http://localhost:3000/app",
      cancel_url: "http://localhost:3000/app",
    });

    return {
      id: session.id,
    };
  } catch (error) {
    console.error("Error creating session:", error);
    throw new Error("Failed to create Stripe checkout session");
  }
};
