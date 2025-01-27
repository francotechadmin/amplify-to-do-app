import React from "react";
import Link from "next/link";
import Image from "next/image";

function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen  text-white p-8">
      {/* Title Section */}
      <div className="text-center max-w-4xl mb-12">
        <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight">
          Organize Your Life with{" "}
          <span className="text-red-500">To-Do List</span>
        </h1>
      </div>
      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between max-w-6xl gap-12">
        {/* Text Section */}
        <div className="text-center lg:text-center max-w-2xl w-64 md:w-96">
          <p className="text-lg sm:text-xl text-gray-400 mb-8">
            Stay focused and achieve your goals with our modern, minimalistic
            To-Do app. Track tasks, boost productivity, and take control of your
            time.
          </p>
          {/* Call-to-action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center ">
            <Link
              href="/app"
              className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all"
            >
              Get Started
            </Link>
            <a
              href="#features"
              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg text-lg font-medium transition-all"
            >
              Learn More
            </a>
          </div>
        </div>
        {/* Hero Image */}
        <div className="relative max-w-md lg:max-w-lg hidden lg:block justify-self-center align-self-center border rounded">
          <Image
            src="/sc.png"
            alt="To-Do Pro App"
            height={500}
            width={300}
            objectFit="contain"
          />
        </div>
      </div>

      {/* Features Section */}
      {/* <section id="features" className="mt-16 w-full max-w-5xl text-gray-300">
        <h2 className="text-4xl font-bold text-center text-gray-100 mb-8">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              Simple Interface
            </h3>
            <p>
              Enjoy an intuitive and distraction-free design that keeps you
              focused.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              Task Tracking
            </h3>
            <p>
              Easily track your tasks and organize them by priority or
              categories.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              Mobile Friendly
            </h3>
            <p>
              Use it on any device with seamless performance on mobile and
              desktop.
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              Secure Data
            </h3>
            <p>
              Your tasks are stored securely with top-notch encryption and
              reliability.
            </p>
          </div>
        </div>
      </section> */}

      {/* Footer Section */}
      <footer className="mt-16 text-gray-500">
        <p>
          Built with ❤️ by{" "}
          <a
            target="_blank"
            href="https://github.com/francotechadmin"
            className="text-blue-400 hover:underline"
          >
            Gabriel Franco
          </a>
        </p>
      </footer>
    </div>
  );
}

export default LandingPage;
