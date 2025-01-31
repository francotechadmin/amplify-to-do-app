"use client";
import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="text-center text-gray-500 py-4 text-xs">
      <p>
        Created by{" "}
        <a
          target="_blank"
          href="https://github.com/francotechadmin"
          className="text-blue-500"
          rel="noreferrer"
        >
          Gabriel Franco
        </a>
      </p>
    </footer>
  );
};

export default Footer;
