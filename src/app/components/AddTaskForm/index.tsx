// components/AddTaskForm.tsx
"use client";
import React from "react";
import { PlusCircle } from "lucide-react";

interface AddTaskFormProps {
  newTask: string;
  setNewTask: React.Dispatch<React.SetStateAction<string>>;
  onAddTask: (e: React.FormEvent) => void;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  newTask,
  setNewTask,
  onAddTask,
}) => {
  return (
    <form
      className="flex rounded-full w-full bg-white focus-within:ring-2 ring-red-600 hover:ring-2 text-md mb-4"
      onSubmit={onAddTask}
    >
      <input
        type="text"
        placeholder="Add a new task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        className="flex-1 py-2 px-4 rounded-full text-black focus:outline-none"
      />
      <button
        type="submit"
        className="bg-red-600 text-white py-2 w-16 rounded-full hover:bg-red-400 flex items-center justify-center"
      >
        <PlusCircle size={16} />
      </button>
    </form>
  );
};

export default AddTaskForm;
