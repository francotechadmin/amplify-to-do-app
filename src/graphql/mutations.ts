/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createCheckoutSession = /* GraphQL */ `mutation CreateCheckoutSession($input: CreateCheckoutSessionInput!) {
  createCheckoutSession(input: $input) {
    id
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateCheckoutSessionMutationVariables,
  APITypes.CreateCheckoutSessionMutation
>;
export const createTodo = /* GraphQL */ `mutation CreateTodo(
  $input: CreateTodoInput!
  $condition: ModelTodoConditionInput
) {
  createTodo(input: $input, condition: $condition) {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTodoMutationVariables,
  APITypes.CreateTodoMutation
>;
export const updateTodo = /* GraphQL */ `mutation UpdateTodo(
  $input: UpdateTodoInput!
  $condition: ModelTodoConditionInput
) {
  updateTodo(input: $input, condition: $condition) {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTodoMutationVariables,
  APITypes.UpdateTodoMutation
>;
export const deleteTodo = /* GraphQL */ `mutation DeleteTodo(
  $input: DeleteTodoInput!
  $condition: ModelTodoConditionInput
) {
  deleteTodo(input: $input, condition: $condition) {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteTodoMutationVariables,
  APITypes.DeleteTodoMutation
>;
export const createUser = /* GraphQL */ `mutation CreateUser(
  $input: CreateUserInput!
  $condition: ModelUserConditionInput
) {
  createUser(input: $input, condition: $condition) {
    id
    subscriptionStatus
    freeQueriesUsed
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateUserMutationVariables,
  APITypes.CreateUserMutation
>;
export const updateUser = /* GraphQL */ `mutation UpdateUser(
  $input: UpdateUserInput!
  $condition: ModelUserConditionInput
) {
  updateUser(input: $input, condition: $condition) {
    id
    subscriptionStatus
    freeQueriesUsed
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateUserMutationVariables,
  APITypes.UpdateUserMutation
>;
export const deleteUser = /* GraphQL */ `mutation DeleteUser(
  $input: DeleteUserInput!
  $condition: ModelUserConditionInput
) {
  deleteUser(input: $input, condition: $condition) {
    id
    subscriptionStatus
    freeQueriesUsed
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.DeleteUserMutationVariables,
  APITypes.DeleteUserMutation
>;
export const generateAiTodos = /* GraphQL */ `mutation GenerateAiTodos($input: GenerateAiTodosInput!) {
  generateAiTodos(input: $input) {
    tasks
    __typename
  }
}
` as GeneratedMutation<
  APITypes.GenerateAiTodosMutationVariables,
  APITypes.GenerateAiTodosMutation
>;
export const batchCreateTodos = /* GraphQL */ `mutation BatchCreateTodos($input: BatchCreateInput!) {
  batchCreateTodos(input: $input) {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.BatchCreateTodosMutationVariables,
  APITypes.BatchCreateTodosMutation
>;
export const batchReplaceTodos = /* GraphQL */ `mutation BatchReplaceTodos($input: BatchCreateInput!) {
  batchReplaceTodos(input: $input) {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.BatchReplaceTodosMutationVariables,
  APITypes.BatchReplaceTodosMutation
>;
export const clearTodos = /* GraphQL */ `mutation ClearTodos {
  clearTodos {
    id
    content
    isCompleted
    createdAt
    updatedAt
    userID
    owner
    __typename
  }
}
` as GeneratedMutation<
  APITypes.ClearTodosMutationVariables,
  APITypes.ClearTodosMutation
>;
