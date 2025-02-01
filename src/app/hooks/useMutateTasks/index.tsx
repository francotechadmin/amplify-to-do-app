import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import {
  createTodo,
  deleteTodo,
  updateTodo,
  batchCreateTodos,
  clearTodos,
} from "@/graphql/mutations";
import { listTodos } from "@/graphql/queries";
import { useEffect, useRef, useState } from "react";

const client = generateClient({ authMode: "userPool" });

const batchCreateTodosQuery = async (tasks: { TaskContent: string }[]) => {
  console.log("batchCreateTodosQuery", tasks);
  const user = await getCurrentUser();
  const userId = user.username;
  const todoArray = tasks.map((task) => ({
    content: task.TaskContent,
    isCompleted: false,
    userID: userId,
  }));
  console.log("todoArray", todoArray);
  const response = await client.graphql({
    query: batchCreateTodos,
    variables: {
      input: {
        todos: todoArray,
      },
    },
  });
  return response.data.batchCreateTodos;
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
  const pendingBatchRef = useRef<
    {
      TaskId: string;
      TaskContent: string;
      isCompleted: boolean;
      createdAt: Date;
    }[]
  >([]);
  const BATCH_INTERVAL = 500; // Time in ms before sending batch request

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
      queryClient.setQueryData(["tasks"], (old: any) => {
        if (!old) return response; // If no existing tasks, return new batch

        // 🔥 Merge each server-created task with its optimistic version
        return old.map((todo: any) => {
          const matchingNewTodo = response.find(
            (serverTodo: any) =>
              serverTodo.content === todo.content && todo.isOptimistic
          );
          return matchingNewTodo
            ? {
                TaskID: matchingNewTodo.id,
                TaskContent: todo.content,
                isCompleted: todo.isCompleted,
                createdAt: todo.createdAt,
              }
            : todo;
        });
      });
    } catch (error) {
      console.error("Batch task creation failed:", error);

      // ❌ Remove failed optimistic tasks (rollback)
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.filter((t: any) => !batch.some((bt) => bt.TaskId === t.id))
      );
    } finally {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    }
  };

  // 🚀 **Optimistic Add Task**
  const addTask = (content: string) => {
    console.log("Adding task:", content);
    const tempId = `temp-${Date.now()}-${Math.random()}`; // Temporary ID
    const optimisticTodo = {
      TaskId: tempId,
      TaskContent: content,
      isCompleted: false,
      createdAt: new Date(),
      isOptimistic: true,
    };

    // Update UI immediately with optimistic todo
    queryClient.setQueryData(["tasks"], (old: any) => [
      optimisticTodo,
      ...(old || []),
    ]);

    // Add task to pending batch
    pendingBatchRef.current.push(optimisticTodo);
    setPendingTodos([...pendingBatchRef.current]);
  };

  // 🔥 **Mutations for Updating, Deleting, Toggling**
  const { mutate: editTask } = useMutation({
    mutationFn: async ({
      taskId,
      newContent,
      isCompleted,
    }: {
      taskId: string;
      newContent: string;
      isCompleted: boolean;
    }) => {
      return await client.graphql({
        query: updateTodo,
        variables: {
          input: { id: taskId, content: newContent, isCompleted: isCompleted },
        },
      });
    },
    onMutate: async ({ taskId, newContent }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData(["tasks"]);
      queryClient.setQueryData(["tasks"], (old: any) =>
        old.map((t: any) =>
          t.id === taskId ? { ...t, content: newContent } : t
        )
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
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
        old.filter((t: any) => t.id !== taskId)
      );
      return { previousTasks };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(["tasks"], context?.previousTasks);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const { mutate: clearTasks } = useMutation({
    mutationFn: async () => {
      return await client.graphql({
        query: clearTodos,
        variables: {},
      });
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
    editTask,
    removeTask,
    pendingTodos, // Can be used in UI to show "sending..." state
    clearTasks,
  };
}
