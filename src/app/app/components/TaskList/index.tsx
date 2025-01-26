"use client";
import React, { useState, useEffect } from "react";
import TaskItem, { Task } from "../TaskItem";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onAddTask: (content: string) => void;
  onEditTask: (taskId: string, newContent: string) => void;
  onRemoveTask: (taskId: string) => void;
  onClearAll: () => void;
  onToggleComplete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onAddTask,
  onEditTask,
  onRemoveTask,
  onClearAll,
  onToggleComplete,
}) => {
  const [newTask, setNewTask] = useState("");

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 gap-4 p-4">
      {/* CREATE NEW TASK */}
      <form
        className="flex rounded-full w-full bg-white focus-within:ring-2 ring-red-600 hover:ring-2"
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
          className="flex-1 p-3 rounded-full text-black focus:outline-none active:outline-none"
        />
        <button
          type="submit"
          className="bg-red-600 text-white p-2 w-20 rounded-full hover:bg-red-400"
        >
          Add
        </button>
      </form>

      {isLoading && <div className="text-gray-600">Loading tasks...</div>}

      {/* TASKS LIST */}
      {/* 
        Make this UL scrollable:
         - `overflow-y-auto`: enable vertical scroll
         - `max-h-72`: limit container height to ~18rem
         - `custom-scrollbar`: apply our custom scrollbar styles
      */}
      <ul className="flex flex-col list-none w-full space-y-2 custom-scrollbar flex-1 min-h-0 overflow-y-auto">
        {tasks.length === 0 && !isLoading ? (
          <p className="text-gray-500">No tasks added yet.</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.TaskId}
              task={task}
              onToggleComplete={onToggleComplete}
              onDelete={onRemoveTask}
            />
          ))
        )}
      </ul>

      {/* OPTIONAL EDIT BUTTON
          If you still want to allow prompt-based editing, you can do something like: */}
      <div className="hidden">
        {tasks.map((task) => (
          <button
            key={task.TaskId}
            onClick={() => {
              const newContent = prompt("Edit task", task.TaskContent);
              if (newContent) {
                onEditTask(task.TaskId, newContent);
              }
            }}
          >
            Edit
          </button>
        ))}
      </div>

      {/* CLEAR ALL */}
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
