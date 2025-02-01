// hooks/useFetchTasks.ts
import { useQuery } from "@tanstack/react-query";
import { generateClient } from "aws-amplify/api";
import { listTodos } from "@/graphql/queries";

const client = generateClient({ authMode: "userPool" });

const fetchTasksQuery = async () => {
  const response = await client.graphql({ query: listTodos });

  if (!response.data?.listTodos?.items) return [];
  const taskArray = response.data.listTodos.items.map((task: any) => ({
    TaskId: task.id,
    TaskContent: task.content,
    isCompleted: task.isCompleted,
    createdAt: new Date(task.createdAt),
  }));
  return taskArray.sort(
    (a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime()
  );
};

export function useFetchTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasksQuery,
  });
}
