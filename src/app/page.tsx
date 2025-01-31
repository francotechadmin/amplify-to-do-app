"use client";
import { useState, useEffect } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import config from "../aws-exports"; // auto-generated by Amplify
import { getCurrentUser } from "aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import NavBar from "./components/NavBar";
import TaskList from "./components/TaskList";
import WelcomeModal from "./components/WelcomeModal";
import { useSubscription } from "./hooks/useSubscriptionStatus";

// GraphQL queries and mutations
import {
  createUser,
  createTodo,
  deleteTodo,
  updateTodo,
} from "@/graphql/mutations";
import { getUser, listTodos } from "@/graphql/queries";

// Configure Amplify
const libraryOptions = { ssr: false };
Amplify.configure({ ...config, ...libraryOptions });

const client = generateClient({ authMode: "userPool" });

// ======== HELPER FUNCTIONS ========
const fetchTasks = async () => {
  const response = await client.graphql({ query: listTodos });
  const taskArray = response.data.listTodos.items.map((task) => ({
    TaskId: task.id,
    TaskContent: task.content,
    isCompleted: task.isCompleted,
    createdAt: new Date(task.createdAt),
  }));
  // Sort tasks by creation date
  return taskArray.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
};

const addTask = async (newTask: string) => {
  const user = await getCurrentUser();
  const userId = user.username;
  const response = await client.graphql({
    query: createTodo,
    variables: {
      input: { content: newTask, isCompleted: false, userID: userId },
    },
  });
  return {
    TaskId: response.data.createTodo.id,
    TaskContent: response.data.createTodo.content,
  };
};

const updateTask = async ({
  taskId,
  newContent,
}: {
  taskId: string;
  newContent: string;
}) => {
  const response = await client.graphql({
    query: updateTodo,
    variables: { input: { id: taskId, content: newContent } },
  });
  return {
    TaskId: response.data.updateTodo.id,
    TaskContent: response.data.updateTodo.content,
  };
};

const deleteTask = async (taskId: string) => {
  const response = await client.graphql({
    query: deleteTodo,
    variables: { input: { id: taskId } },
  });
  return {
    TaskId: response.data.deleteTodo.id,
    TaskContent: response.data.deleteTodo.content,
  };
};

const clearTasks = async () => {
  const response = await client.graphql({ query: listTodos });
  const tasks = response.data.listTodos.items;
  for (const task of tasks) {
    await client.graphql({
      query: deleteTodo,
      variables: { input: { id: task.id } },
    });
  }
};

const toggleComplete = async ({
  taskId,
  isCompleted,
}: {
  taskId: string;
  isCompleted: boolean;
}) => {
  const response = await client.graphql({
    query: updateTodo,
    variables: { input: { id: taskId, isCompleted: isCompleted } },
  });
  return {
    TaskId: response.data.updateTodo.id,
    TaskContent: response.data.updateTodo.content,
  };
};

const fetchUser = async (userId: string) => {
  const response = await client.graphql({
    query: getUser,
    variables: { id: userId },
  });
  return response.data;
};

const createUserMutation = async (userId: string) => {
  const response = await client.graphql({
    query: createUser,
    variables: { input: { id: userId, subscriptionStatus: "inactive" } },
  });
  return response.data.createUser.id;
};

const handleCreateUser = async (
  setShowWelcomeModal: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) return;

  try {
    // Attempt to fetch the user by their Cognito username
    const data = await fetchUser(currentUser.username);
    if (!data || !data.getUser) {
      // If the user doesn't exist, create it
      console.log("Creating user...", currentUser.username);
      await createUserMutation(currentUser.username);
      setShowWelcomeModal(true);
    }
  } catch (error) {
    console.error("Error fetching or creating user:", error);
  }
};

// ======== MAIN COMPONENT ========
function Home() {
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const queryClient = useQueryClient();

  // 1) Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  // 2) Add Task
  const {
    mutateAsync: addTaskAsync,
    mutate: handleAddTask,
    isPending: addingTask,
    variables,
  } = useMutation({
    mutationFn: addTask,
    onSuccess: (variables) =>
      console.log("Task added successfully!", variables),
    onError: (error) => console.error("Error adding task:", error),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // 3) Edit Task
  const { mutate: handleEditTask } = useMutation({
    mutationFn: updateTask,
    onSuccess: (variables) =>
      console.log("Task updated successfully!", variables),
    onError: (error) => console.error("Error updating task:", error),
    onMutate: ({ taskId, newContent }) => {
      queryClient.setQueryData(["tasks"], (old: any) => {
        return old.map((task: any) =>
          task.TaskId === taskId
            ? { TaskId: taskId, TaskContent: newContent }
            : task
        );
      });
    },
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // 4) Remove Task
  const { mutate: handleRemoveTask } = useMutation({
    mutationFn: deleteTask,
    onMutate: (taskId) => {
      queryClient.setQueryData(["tasks"], (old: any) => {
        return old.filter((task: any) => task.TaskId !== taskId);
      });
    },
    onSuccess: (variables) =>
      console.log("Task removed successfully!", variables),
    onError: (error) => console.error("Error removing task:", error),
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // 5) Clear All
  const { mutateAsync: clearTasksAsync, mutate: handleClearTasks } =
    useMutation({
      mutationFn: clearTasks,
      onSuccess: () => console.log("All tasks removed successfully!"),
      onError: (error) => console.error("Error removing all tasks:", error),
      onMutate: () => {
        // Optimistically update the UI
        queryClient.setQueryData(["tasks"], []);
      },
      onSettled: async () =>
        await queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

  // 6) Toggle Task Completion
  const { mutate: handleToggleComplete } = useMutation({
    mutationFn: toggleComplete,
    onSuccess: (variables) =>
      console.log("Task completion status updated successfully!", variables),
    onError: (error) =>
      console.error("Error updating task completion status:", error),
    onMutate: ({ taskId, isCompleted }) => {
      queryClient.setQueryData(["tasks"], (old: any) => {
        return old.map((task: any) =>
          task.TaskId === taskId ? { ...task, isCompleted: isCompleted } : task
        );
      });
    },
    onSettled: async () =>
      await queryClient.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // 7) On Save AI Tasks
  const onSaveAiTasks = async (tasks: { id: string; content: string }[]) => {
    console.log("Replacing tasks with AI tasks...", tasks);
    try {
      // Clear existing tasks
      await clearTasksAsync();

      // Add each new task in reverse sequence
      for (let i = tasks.length - 1; i >= 0; i--) {
        await addTaskAsync(tasks[i].content);
      }

      console.log("All tasks saved!");
    } catch (err) {
      console.error("Error replacing tasks with AI tasks:", err);
    }
  };

  const { handleSubscribe, isCreatingSession } = useSubscription();

  // handleSubscribe is called from the SubscriptionGuard component
  const onSubscribe = async () => {
    await handleSubscribe();
  };

  // Ensure the user record exists on mount
  useEffect(() => {
    handleCreateUser(setShowWelcomeModal);
  }, []);
  console.log(`Tasks (${tasks.length}):`, tasks);

  return (
    <div className="flex flex-col justify-center flex-1 min-h-0 p-4 w-full max-w-4xl">
      {/* NAV BAR at the top */}
      <NavBar />

      {/* Optional "Welcome" overlay if user is brand new */}
      {showWelcomeModal && (
        <WelcomeModal
          onClose={() => setShowWelcomeModal(false)}
          onSubscribe={onSubscribe}
          isCreatingSession={isCreatingSession}
        />
      )}

      {/* MAIN CONTENT AREA */}
      <div className="flex flex-col items-center justify-start max-w-90 pt-8 flex-1 min-h-0">
        <TaskList
          tasks={tasks}
          pendingTasks={variables}
          addingTask={addingTask}
          isLoading={isLoading}
          onAddTask={handleAddTask}
          onEditTask={(taskId: string, newContent: string) =>
            handleEditTask({ taskId, newContent })
          }
          onRemoveTask={handleRemoveTask}
          onClearAll={handleClearTasks}
          onToggleComplete={(taskId: string) =>
            handleToggleComplete({
              taskId,
              isCompleted: !tasks.find((task) => task.TaskId === taskId)
                ?.isCompleted,
            })
          }
          onSaveAiTasks={onSaveAiTasks}
        />
      </div>

      {/* FOOTER at bottom */}
      {/* <Footer /> */}
    </div>
  );
}

// Export withAuthenticator if you want Amplify’s login flow
export default withAuthenticator(Home);
