"use client"; // If you are using Next.js 13+ with the app router and need client components
import React from "react";
import { signOut } from "aws-amplify/auth";
import { PenLine, LogOut } from "lucide-react";
const NavBar: React.FC = () => {
  return (
    <nav className="flex items-center justify-between w-full px-6 py-4 text-white">
      {/* <div style={{ width: "20px" }}></div> */}
      <div className="text-3xl font-bold flex items-center gap-2">
        To-Do List <PenLine size={28} />
      </div>
      <button onClick={() => signOut()} className="text-red px-3 py-1 rounded">
        {/* sign out icon */}
        <LogOut color="red" size={22} />
      </button>
    </nav>
  );
};

export default NavBar;
