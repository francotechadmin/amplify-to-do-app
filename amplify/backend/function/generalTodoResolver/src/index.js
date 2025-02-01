/* Amplify Params - DO NOT EDIT
	API_TODODEMO_GRAPHQLAPIIDOUTPUT
	API_TODODEMO_TODOTABLE_ARN
	API_TODODEMO_TODOTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */ const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.API_TODODEMO_TODOTABLE_NAME;

// Function to batch write todos
async function batchCreateTodos(todos, userId, sub) {
  console.log(
    `[batchCreateTodos] Start - User: ${userId}, Todos:`,
    JSON.stringify(todos)
  );

  if (!todos || todos.length === 0) {
    console.warn("[batchCreateTodos] No todos provided.");
    throw new Error("No todos provided.");
  }

  const putRequests = todos.map((todo) => ({
    PutRequest: {
      Item: {
        id: AWS.util.uuid.v4(),
        content: todo.content,
        createdAt: new Date().toISOString(),
        isCompleted: todo.isCompleted,
        owner: `${sub}::${userId}`,
        updatedAt: new Date().toISOString(),
        userID: todo.userID,
        __typename: "Todo",
      },
    },
  }));

  const params = { RequestItems: { [TABLE_NAME]: putRequests } };

  try {
    console.log(
      "[batchCreateTodos] DynamoDB Batch Write Params:",
      JSON.stringify(params)
    );
    await dynamoDb.batchWrite(params).promise();
    console.log("[batchCreateTodos] Success - Todos created successfully");
    return putRequests.map((req) => req.PutRequest.Item);
  } catch (error) {
    console.error("[batchCreateTodos] Error:", error);
    throw new Error("Failed to batch create todos.");
  }
}

// Function to clear all todos for a user
async function clearTodos(userId) {
  console.log(`[clearTodos] Start - User: ${userId}`);

  const params = {
    TableName: TABLE_NAME,
    IndexName: "byUser",
    KeyConditionExpression: "userID = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    console.log("[clearTodos] Fetching todos to delete.");
    const data = await dynamoDb.query(params).promise();
    if (!data.Items || data.Items.length === 0) {
      console.warn("[clearTodos] No todos found for user.");
      return [];
    }

    const deleteRequests = data.Items.map((item) => ({
      DeleteRequest: { Key: { id: item.id } },
    }));

    const batchWriteParams = { RequestItems: { [TABLE_NAME]: deleteRequests } };
    console.log("[clearTodos] Deleting todos:", JSON.stringify(deleteRequests));

    await dynamoDb.batchWrite(batchWriteParams).promise();
    console.log("[clearTodos] Success - Todos deleted successfully");
    return data.Items;
  } catch (error) {
    console.error("[clearTodos] Error:", error);
    throw new Error("Failed to clear todos.");
  }
}

// Resolvers
const resolvers = {
  Mutation: {
    batchCreateTodos: async (ctx) => {
      console.log("[batchCreateTodos] Resolver invoked.", JSON.stringify(ctx));
      const userId = ctx.identity?.username;
      const sub = ctx.identity?.claims?.sub;
      if (!userId) {
        console.warn("[batchCreateTodos] Unauthorized request.");
        throw new Error("Unauthorized: Missing user identity.");
      }
      return await batchCreateTodos(ctx.arguments.input.todos, userId, sub);
    },
    clearTodos: async (ctx) => {
      console.log("[clearTodos] Resolver invoked.", JSON.stringify(ctx));
      const userId = ctx.identity?.username;
      if (!userId) {
        console.warn("[clearTodos] Unauthorized request.");
        throw new Error("Unauthorized: Missing user identity.");
      }
      return await clearTodos(userId);
    },
  },
};

// Entry point handler
exports.handler = async (event) => {
  console.log("[Handler] Incoming Event:", JSON.stringify(event, null, 2));
  try {
    const typeHandler = resolvers[event.typeName];
    if (typeHandler) {
      const resolver = typeHandler[event.fieldName];
      if (resolver) {
        console.log(
          `[Handler] Resolving field '${event.fieldName}' in type '${event.typeName}'`
        );
        const result = await resolver(event);
        console.log("[Handler] Resolver success:", JSON.stringify(result));
        return result;
      }
    }
    throw new Error("Resolver not found.");
  } catch (error) {
    console.error("[Handler] Error:", error);
    throw new Error(`Error processing request: ${error.message}`);
  }
};
