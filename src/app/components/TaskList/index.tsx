"use client";
import React from "react";
import TaskItem, { Task } from "../TaskItem";

interface TaskListProps {
  tasks: Task[];
  onEditTask: (task: {
    taskId: string;
    newContent: string;
    isCompleted: boolean;
  }) => void;
  onRemoveTask: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onEditTask,
  onRemoveTask,
}) => {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 h-full text-center flex flex-col items-center justify-center">
        No tasks added yet.
        <br />
        Add a task to get started!
      </p>
    );
  }

  return (
    <ul className="flex flex-col list-none w-full space-y-2 custom-scrollbar flex-1 min-h-0 overflow-y-auto">
      {tasks.map((task) => (
        <TaskItem
          key={task.TaskId}
          task={task}
          onEditTask={onEditTask}
          onDelete={onRemoveTask}
        />
      ))}
    </ul>
  );
};

export default TaskList;
