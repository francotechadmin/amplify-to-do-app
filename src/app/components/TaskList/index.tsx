"use client";
import React, { useState } from "react";
import TaskItem, { Task } from "../TaskItem";
import { PlusCircle, Sparkles } from "lucide-react";
import AiFeatureModal from "../AIModal";
interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
  onAddTask: (content: string) => void;
  onEditTask: (task: {
    taskId: string;
    newContent: string;
    isCompleted: boolean;
  }) => void;
  onRemoveTask: (taskId: string) => void;
  onClearAll: () => void;
  onSaveAiTasks: (tasks: { id: string; content: string }[]) => void;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onAddTask,
  onEditTask,
  onRemoveTask,
  onClearAll,
  onSaveAiTasks,
}) => {
  const [newTask, setNewTask] = useState("");
  const [showAiModal, setShowAiModal] = useState(false);

  return (
    <div className="flex flex-col w-full h-full flex-1 gap-4 px-2">
      {/* CREATE NEW TASK */}
      <form
        className="flex rounded-full w-full bg-white focus-within:ring-2 ring-red-600 hover:ring-2 text-md"
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
          className="flex-1 py-2 px-4 rounded-full text-black focus:outline-none active:outline-none"
        />
        <button
          type="submit"
          className="bg-red-600 text-white py-2 w-16 rounded-full hover:bg-red-400 flex items-center justify-center"
        >
          <PlusCircle size={16} />
        </button>
      </form>
      <button
        onClick={() => setShowAiModal(true)}
        className="bg-red-600 text-white py-1 rounded-full hover:bg-red-400 flex items-center justify-center gap-2 relative pr-4 pl-3"
      >
        <span>Generate Tasks</span>
        <span className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
          PRO
        </span>
        <Sparkles size={14} />
      </button>
      <AiFeatureModal
        open={showAiModal}
        onClose={() => setShowAiModal(false)}
        onSave={onSaveAiTasks}
      />
      {isLoading && <div className="text-gray-600">Loading tasks...</div>}
      {/* TASKS LIST */}
      <ul className="flex flex-col list-none w-full space-y-2 custom-scrollbar flex-1 min-h-0 overflow-y-auto">
        {tasks.length === 0 && !isLoading ? (
          <p className="text-gray-500 h-full text-center flex flex-col items-center justify-center">
            No tasks added yet.
            <br />
            Add a task to get started!
          </p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.TaskId}
              task={task}
              onEditTask={onEditTask}
              onDelete={onRemoveTask}
            />
          ))
        )}
      </ul>
      {/* Display hidden edit buttons */}
      <div className="hidden">
        {tasks.map((task) => (
          <button
            key={task.TaskId}
            onClick={() => {
              const newContent = prompt("Edit task", task.TaskContent);
              if (newContent) {
                onEditTask({
                  taskId: task.TaskId,
                  newContent,
                  isCompleted: task.isCompleted || false,
                });
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
