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

const tableName = process.env.TABLE_NAME || `itemsTable-${process.env.ENV}`;

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

app.get("/items/tasks/:UserId", async (req, res) => {
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

app.post("/items/tasks", async (req, res) => {
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

app.put("/items/tasks/:UserId/:TaskId", async (req, res) => {
  const { UserId, TaskId } = req.params;
  const { TaskContent, IsCompleted } = req.body;

  if (!TaskContent && IsCompleted === undefined) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  const params = {
    TableName: tableName,
    Item: {
      UserId,
      TaskId,
      TaskContent,
      IsCompleted,
      UpdatedAt: getCurrentTimestamp(),
    },
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

app.delete("/items/tasks/:UserId/:TaskId", async (req, res) => {
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

/**************************************
 * HTTP Delete method to clear all tasks *
 ***************************************/

app.delete("/items/tasks/:UserId", async (req, res) => {
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
    if (data.Items.length === 0) {
      return res.status(200).json({ error: "No tasks found" });
    }

    const tasks = data.Items; // Get all tasks

    // Delete all tasks
    for (const task of tasks) {
      const deleteParams = {
        TableName: tableName,
        Key: { UserId, TaskId: task.TaskId },
      };
      await ddbDocClient.send(new DeleteCommand(deleteParams));
    }
    res.json({ success: "All tasks deleted" });
  } catch (err) {
    res.status(500).json({ error: "Could not delete tasks: " + err.message });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

module.exports = app;
