import Image from "next/image";
import { Github, TwitterIcon, Linkedin } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="
    min-h-screen 
    flex items-center justify-center p-2 sm:p-6 
    bg-gradient-to-br 
    from-gray-100 via-white to-gray-200 
    dark:from-gray-800 dark:via-gray-900 dark:to-gray-800
    transition-colors
  "
    >
      <div className="max-w-3xl w-full text-center space-y-8">
        {/* Title */}
        <h1
          className="
        text-5xl font-extrabold 
        bg-gradient-to-r from-cyan-500 to-blue-600 
        dark:from-cyan-300 dark:to-blue-400 
        text-transparent bg-clip-text 
        drop-shadow-lg animate-pulse
      "
        >
          Shareholder Voting System
        </h1>

        {/* Subtitle */}
        <p
          className="
        text-lg leading-relaxed 
        text-gray-700 dark:text-gray-300 
      "
        >
          Manage meetings, register shareholders, monitor attendance, and
          conduct secure weighted voting — all in one futuristic, seamless
          interface.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-10">
          {/* Card */}
          <div
            className="
          p-6 rounded-2xl shadow-xl 
          backdrop-blur-md border 
          transition-all
          bg-white/60 border-gray-300 
          hover:border-cyan-400 hover:shadow-cyan-500/30
          dark:bg-gray-800/50 dark:border-gray-700
        "
          >
            <h3
              className="
            text-xl font-semibold 
            text-cyan-600 dark:text-cyan-400 mb-2
          "
            >
              Meetings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Create, manage, and monitor shareholder meetings in real-time.
            </p>
          </div>

          <div
            className="
          p-6 rounded-2xl shadow-xl 
          backdrop-blur-md border 
          transition-all
          bg-white/60 border-gray-300 
          hover:border-cyan-400 hover:shadow-cyan-500/30
          dark:bg-gray-800/50 dark:border-gray-700
        "
          >
            <h3
              className="
            text-xl font-semibold 
            text-cyan-600 dark:text-cyan-400 mb-2
          "
            >
              Voting
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Weighted voting system that ensures transparency and fairness.
            </p>
          </div>

          <div
            className="
          p-6 rounded-2xl shadow-xl 
          backdrop-blur-md border 
          transition-all
          bg-white/60 border-gray-300 
          hover:border-cyan-400 hover:shadow-cyan-500/30
          dark:bg-gray-800/50 dark:border-gray-700
        "
          >
            <h3
              className="
            text-xl font-semibold 
            text-cyan-600 dark:text-cyan-400 mb-2
          "
            >
              Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Generate detailed reports for meetings, votes, and attendance.
            </p>
          </div>
        </div>

        <div className="mt-12 flex justify-center space-x-6">
          <a
            href="https://github.com/Aarontamirat"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-full
          border shadow-md 
          bg-white/60 border-gray-300 
          hover:border-cyan-400 
          hover:shadow-cyan-500/40
          dark:bg-gray-800/50 dark:border-gray-700 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.091.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.455-1.158-1.11-1.466-1.11-1.466-.908-.621.069-.609.069-.609 1.004.07 1.532 1.034 1.532 1.034.892 1.53 2.341 1.088 2.91.833.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .269.18.58.688.482A10.02 10.02 0 0022 12.017C22 6.484 17.523 2 12 2z"
              />
            </svg>
          </a>

          <a
            href="https://linkedin.com/in/Aarontamirat"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-full
          border shadow-md 
          bg-white/60 border-gray-300 
          hover:border-cyan-400 
          hover:shadow-cyan-500/40
          dark:bg-gray-800/50 dark:border-gray-700 transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-cyan-600 dark:text-cyan-400"
              fill="currentColor"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-4 0v7h-4v-7a6 6 0 016-6z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M2 9h4v12H2z"
              />
              <circle cx="4" cy="4" r="2" strokeWidth={1.5} />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
