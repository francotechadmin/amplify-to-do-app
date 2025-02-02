"use client";
import React from "react";
import { Trash, Check } from "lucide-react";

// If your Task interface from the backend doesn't track "isCompleted",
// you can optionally add it here just for local UI state.
export interface Task {
  TaskId: string;
  TaskContent: string;
  isCompleted?: boolean; // optional, for local usage
}

interface TaskItemProps {
  task: Task;
  onEditTask: (task: {
    taskId: string;
    newContent: string;
    isCompleted: boolean;
  }) => void;
  onDelete: (taskId: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEditTask, onDelete }) => {
  return (
    <li className="p-2 flex items-center justify-between">
      {/* LEFT: Circle checkbox + task text */}
      <div className="flex items-center gap-3">
        {/* Circle checkbox */}
        <button
          onClick={() =>
            onEditTask({
              taskId: task.TaskId,
              newContent: task.TaskContent,
              isCompleted: !task.isCompleted,
            })
          }
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
          }`}
        >
          {/* Checkmark only if completed */}
          {task.isCompleted && <Check size={14} />}
        </button>

        {/* Task text with strikethrough if completed */}
        <span className={task.isCompleted ? "line-through text-gray-500" : ""}>
          {task.TaskContent}
        </span>
      </div>

      {/* RIGHT: Delete button with trash icon */}
      <button
        onClick={() => onDelete(task.TaskId)}
        className="text-red-500 hover:text-red-700"
      >
        {/* A simple trashcan icon */}
        <Trash size={18} />
      </button>
    </li>
  );
};

export default TaskItem;
