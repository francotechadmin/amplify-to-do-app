/*
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

exports.handler = async (event) => {
  try {
    console.log("Received event arguments:", JSON.stringify(event.arguments));

    // 1) Parse input
    const { userId, prompt } = event.arguments.input || {};

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
