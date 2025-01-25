"use client";
import React, { useState } from "react";

interface Task {
  TaskId: string;
  TaskContent: string;
}

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onAddTask: (content: string) => void;
  onEditTask: (taskId: string, newContent: string) => void;
  onRemoveTask: (taskId: string) => void;
  onClearAll: () => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onAddTask,
  onEditTask,
  onRemoveTask,
  onClearAll,
}) => {
  const [newTask, setNewTask] = useState("");

  return (
    <div className="flex flex-col gap-8 items-center sm:items-start w-full max-w-xl">
      {/* <h1 className="text-4xl font-bold">To-Do List</h1> */}

      <form
        className="flex gap-4 w-full"
        onSubmit={(e) => {
          e.preventDefault();
          if (!newTask.trim()) return;
          onAddTask(newTask);
          setNewTask("");
        }}
      >
        <input
          type="text"
          placeholder="Add a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="flex-1 border border-gray-300 p-2 rounded text-black"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add
        </button>
      </form>

      {isLoading && <div className="text-gray-600">Loading tasks...</div>}

      <ul className="list-disc pl-5 w-full">
        {tasks.length === 0 && !isLoading ? (
          <p className="text-gray-500">No tasks added yet.</p>
        ) : (
          tasks.map((task) => (
            <li
              key={task.TaskId}
              className="p-2 flex items-center justify-between"
            >
              <span>{task.TaskContent}</span>
              <div className="space-x-3">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    const newContent = prompt("Edit task", task.TaskContent);
                    if (newContent) {
                      onEditTask(task.TaskId, newContent);
                    }
                  }}
                  className="text-blue-500 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => onRemoveTask(task.TaskId)}
                  className="text-red-500 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))
        )}
      </ul>

      {tasks.length > 0 && (
        <button
          onClick={() => onClearAll()}
          className="text-red-500 hover:underline"
        >
          Clear all tasks
        </button>
      )}
    </div>
  );
};

export default TaskList;
