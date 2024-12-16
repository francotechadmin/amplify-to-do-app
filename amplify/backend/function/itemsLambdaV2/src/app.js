const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DeleteCommand,
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const awsServerlessExpressMiddleware = require("aws-serverless-express/middleware");
const bodyParser = require("body-parser");
const express = require("express");
const { v4: uuidv4 } = require("uuid"); // For generating TaskId
const dayjs = require("dayjs"); // For timestamp management

const ddbClient = new DynamoDBClient({ region: process.env.TABLE_REGION });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const tableName = process.env.TABLE_NAME || "TodoTable";

// declare a new express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

// Helper function to generate current timestamp
const getCurrentTimestamp = () => dayjs().toISOString();

/************************************
 * HTTP Get method to list tasks for a user *
 ************************************/

app.get("/tasks/:UserId", async (req, res) => {
  const { UserId } = req.params;

  const params = {
    TableName: tableName,
    KeyConditionExpression: "UserId = :userId",
    ExpressionAttributeValues: {
      ":userId": UserId,
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    res.json(data.Items);
  } catch (err) {
    res.status(500).json({ error: "Could not retrieve tasks: " + err.message });
  }
});

/*****************************************
 * HTTP Post method to add a new task *
 *****************************************/

app.post("/tasks", async (req, res) => {
  const { UserId, TaskContent } = req.body;

  if (!UserId || !TaskContent) {
    return res
      .status(400)
      .json({ error: "UserId and TaskContent are required" });
  }

  const newTask = {
    UserId,
    TaskId: uuidv4(),
    TaskContent,
    IsCompleted: false,
    CreatedAt: getCurrentTimestamp(),
    UpdatedAt: getCurrentTimestamp(),
  };

  const params = {
    TableName: tableName,
    Item: newTask,
  };

  try {
    await ddbDocClient.send(new PutCommand(params));
    res.json({ success: "Task added", task: newTask });
  } catch (err) {
    res.status(500).json({ error: "Could not add task: " + err.message });
  }
});

/*****************************************
 * HTTP Put method to update a task *
 *****************************************/

app.put("/tasks/:UserId/:TaskId", async (req, res) => {
  const { UserId, TaskId } = req.params;
  const { TaskContent, IsCompleted } = req.body;

  if (!TaskContent && IsCompleted === undefined) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const updateExpression = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  if (TaskContent) {
    updateExpression.push("#tc = :taskContent");
    expressionAttributeValues[":taskContent"] = TaskContent;
    expressionAttributeNames["#tc"] = "TaskContent";
  }

  if (IsCompleted !== undefined) {
    updateExpression.push("#ic = :isCompleted");
    expressionAttributeValues[":isCompleted"] = IsCompleted;
    expressionAttributeNames["#ic"] = "IsCompleted";
  }

  updateExpression.push("#ua = :updatedAt");
  expressionAttributeValues[":updatedAt"] = getCurrentTimestamp();
  expressionAttributeNames["#ua"] = "UpdatedAt";

  const params = {
    TableName: tableName,
    Key: { UserId, TaskId },
    UpdateExpression: "SET " + updateExpression.join(", "),
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
    ReturnValues: "ALL_NEW",
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    res.json({ success: "Task updated", task: data.Attributes });
  } catch (err) {
    res.status(500).json({ error: "Could not update task: " + err.message });
  }
});

/**************************************
 * HTTP Delete method to remove a task *
 ***************************************/

app.delete("/tasks/:UserId/:TaskId", async (req, res) => {
  const { UserId, TaskId } = req.params;

  const params = {
    TableName: tableName,
    Key: { UserId, TaskId },
  };

  try {
    await ddbDocClient.send(new DeleteCommand(params));
    res.json({ success: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete task: " + err.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

module.exports = app;
