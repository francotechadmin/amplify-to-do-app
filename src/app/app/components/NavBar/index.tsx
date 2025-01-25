"use client"; // If you are using Next.js 13+ with the app router and need client components
import React from "react";
import { signOut } from "aws-amplify/auth";

const NavBar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 bg-gray-900 text-white">
      <div className="text-xl font-bold">To-Do</div>
      <button
        onClick={() => signOut()}
        className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
      >
        {/* sign out icon */}
        Sign Out
      </button>
    </nav>
  );
};

export default NavBar;
