import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  batchCreateTodos,
  batchReplaceTodos,
  clearTodos,
} from "@/graphql/mutations";
import { useEffect, useRef, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const client = generateClient({ authMode: "userPool" });

const batchCreateTodosQuery = async (
  tasks: { TaskId: string; TaskContent: string }[]
) => {
  console.log("Batch Creating Todos:", tasks);
  const user = await getCurrentUser();
  const userId = user.username;
  const todoArray = tasks.map((task) => ({
    id: task.TaskId, // Send client-assigned ID
    content: task.TaskContent,
    isCompleted: false,
    userID: userId,
  }));

  const response = await client.graphql({
    query: batchCreateTodos,
    variables: { input: { todos: todoArray } },
  });

  return response.data.batchCreateTodos;
};

const batchReplaceTodosQuery = async (
  tasks: { TaskId: string; TaskContent: string }[]
) => {
  console.log("Batch Replacing Todos:", tasks);
  const user = await getCurrentUser();
  const userId = user.username;
  const todoArray = tasks.map((task) => ({
    id: task.TaskId,
    content: task.TaskContent,
    isCompleted: false,
    userID: userId,
  }));

  const response = await client.graphql({
    query: batchReplaceTodos,
    variables: { input: { todos: todoArray } },
  });

  return response.data.batchReplaceTodos;
};

const clearTasksQuery = async () => {
  await client.graphql({
    query: clearTodos,
    variables: {},
  });
};

export function useMutateTasks() {
  const queryClient = useQueryClient();
  const [pendingTodos, setPendingTodos] = useState<
    {
      TaskId: string;
      TaskContent: string;
      isCompleted: boolean;
      createdAt: Date;
    }[]
  >([]);
  const pendingBatchRef = useRef<typeof pendingTodos>([]);
  const BATCH_INTERVAL = 500; // Batch processing interval

  // 🔥 **Batch Processing Effect**
  useEffect(() => {
    const interval = setInterval(() => {
      if (pendingBatchRef.current.length > 0) {
        processBatch();
      }
    }, BATCH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const processBatch = async () => {
    const batch = [...pendingBatchRef.current]; // Copy pending todos
    pendingBatchRef.current = []; // Reset queue
    setPendingTodos([]); // Clear UI queue

    try {
      const response = await batchCreateTodosQuery(batch); // API Call
      console.log("Batch created todos:", response);
      console.log("Current todos:", queryClient.getQueryData(["tasks"]));
    } catch (error) {
      console.error("Batch task creation failed:", error);
      // ❌ Rollback failed optimistic tasks
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.filter((t: any) => !batch.some((bt) => bt.TaskId === t.TaskId))
      );
    }
  };

  // 🚀 **Optimistic Add Task**
  const addTask = (content: string) => {
    console.log("Adding task:", content);
    const clientId = uuidv4(); // Generate a unique client ID

    const optimisticTodo = {
      TaskId: clientId,
      TaskContent: content,
      isCompleted: false,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Update UI immediately
    queryClient.setQueryData(["tasks"], (old: any) => [
      optimisticTodo,
      ...(old || []),
    ]);

    // Add task to pending batch
    pendingBatchRef.current.push(optimisticTodo);
    setPendingTodos([...pendingBatchRef.current]);
  };

  // 🚀 **Optimistic Bulk Replace Tasks**
  const bulkReplaceTasks = async (tasks: { content: string }[]) => {
    console.log("Replacing tasks with:", tasks);
    const clientId = uuidv4(); // Generate a unique client ID
    const optimisticTodos = tasks.map((task, index) => ({
      TaskId: `${clientId}-${index}`, // Ensure unique ID for each task
      TaskContent: task.content,
      isCompleted: false,
      createdAt: new Date(),
      isOptimistic: true,
    }));
    // Update UI immediately
    queryClient.setQueryData(["tasks"], () => [...optimisticTodos]);

    try {
      const response = await batchReplaceTodosQuery(optimisticTodos); // API Call
      console.log("Batch created todos:", response);
      console.log("Current todos:", queryClient.getQueryData(["tasks"]));
    } catch (error) {
      console.error("Batch task creation failed:", error);
      // ❌ Rollback failed optimistic tasks
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.filter(
          (t: any) => !optimisticTodos.some((ot) => ot.TaskId === t.TaskId)
        )
      );
    }
  };

  // 🔥 **Mutations for Adding Tasks**
  const { mutate: createTask } = useMutation({
    mutationFn: async (content: string) => {
      const user = await getCurrentUser();
      const userId = user.username;

      return await client.graphql({
        query: createTodo,
        variables: { input: { content, isCompleted: false, userID: userId } },
      });
    },
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      const optimisticTodo = {
        TaskId: uuidv4(),
        TaskContent: content,
        isCompleted: false,
        createdAt: new Date(),
      };
      queryClient.setQueryData(["tasks"], (old: any) => [
        optimisticTodo,
        ...(old || []),
      ]);
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
  });

  // 🔥 **Mutations for Updating, Deleting, Toggling**
  const { mutate: editTask } = useMutation({
    mutationFn: async ({
      taskId,
      newContent,
    }: {
      taskId: string;
      newContent: string;
    }) => {
      return await client.graphql({
        query: updateTodo,
        variables: { input: { id: taskId, content: newContent } },
      });
    },
    onMutate: async ({ taskId, newContent }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.map((t: any) =>
          t.TaskId === taskId ? { ...t, TaskContent: newContent } : t
        )
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
  });

  const { mutate: removeTask } = useMutation({
    mutationFn: async (taskId: string) => {
      return await client.graphql({
        query: deleteTodo,
        variables: { input: { id: taskId } },
      });
    },
    onMutate: async (taskId) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.filter((t: any) => t.TaskId !== taskId)
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
  });

  const { mutate: clearTasks } = useMutation({
    mutationFn: async () => {
      return await clearTasksQuery();
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], () => []);
      return { previousTasks };
    },
  });

  return {
    addTask,
    bulkReplaceTasks,
    createTask,
    editTask,
    removeTask,
    pendingTodos, // Can be used in UI to show "sending..." state
    clearTasks,
  };
}
