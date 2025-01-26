"use client";
import React, { useState, useEffect } from "react";
import TaskItem, { Task } from "../TaskItem";

interface TaskListProps {
  tasks: Omit<Task, "isCompleted">[]; // incoming tasks may not have isCompleted
  isLoading: boolean;
  onAddTask: (content: string) => void;
  // If you store 'isCompleted' in your backend, pass an update function here:
  // onUpdateTask: (taskId: string, newData: Partial<Task>) => void;

  // For now, we keep editing/deleting in the same style as your original
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
  // Local state to handle "completed" status in the UI
  const [localTasks, setLocalTasks] = useState<Task[]>([]);

  // Sync localTasks with incoming tasks whenever `tasks` changes
  useEffect(() => {
    // Initialize them with isCompleted = false (or any default)
    const mapped = tasks.map((t) => ({
      ...t,
      isCompleted: false,
    }));
    setLocalTasks(mapped);
  }, [tasks]);

  // Toggle the 'isCompleted' for a particular task
  const handleToggleComplete = (taskId: string) => {
    setLocalTasks((prev) =>
      prev.map((t) =>
        t.TaskId === taskId ? { ...t, isCompleted: !t.isCompleted } : t
      )
    );
    // If you want to persist this in the backend, call onUpdateTask(taskId, { isCompleted: ... })
  };

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
        {localTasks.length === 0 && !isLoading ? (
          <p className="text-gray-500">No tasks added yet.</p>
        ) : (
          localTasks.map((task) => (
            <TaskItem
              key={task.TaskId}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={onRemoveTask}
            />
          ))
        )}
      </ul>

      {/* OPTIONAL EDIT BUTTON
          If you still want to allow prompt-based editing, you can do something like: */}
      <div className="hidden">
        {localTasks.map((task) => (
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
      {localTasks.length > 0 && (
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
