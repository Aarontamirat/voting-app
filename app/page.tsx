

import Image from "next/image";
import { Github, TwitterIcon, Linkedin } from "lucide-react";

export default function Home() {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto p-10">
        <h1 className="text-4xl font-bold text-center">Welcome to Voting App</h1>
        <p className="text-center text-xl text-gray-800">
          A Next.js app for managing shareholder meetings and voting.
        </p>
        <div className="flex items-center justify-center mt-8">
          <a href="https://github.com/Aarontamirat" target="_blank" rel="noreferrer">
            <Github className="h-10 w-10 text-blue-500" />
          </a>
          <a href="https://twitter.com/shadcn_" target="_blank" rel="noreferrer" className="ml-4">
            <TwitterIcon className="h-10 w-10 text-blue-500" />
          </a>
          <a href="https://linkedin.com/in/Aarontamirat" target="_blank" rel="noreferrer" className="ml-4">
            <Linkedin className="h-10 w-10 text-blue-500" />
          </a>
        </div>
      </div>
    </div>
  );
}
