"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // lightweight icons

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-md border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto pr-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- Left Section: Logo & Title --- */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo.svg"
                width={150}
                height={150}
                alt="Logo"
                priority
                className="w-40 h-auto"
              />
              <span className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                Voting System
              </span>
            </Link>
          </div>

          {/* --- Desktop Links --- */}
          <div className="hidden md:flex space-x-6">
            <Link
              href="/shareholders"
              onClick={() => {
                setSelectedTab("shareholders");
              }}
              className={`${
                selectedTab === "shareholders"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              }`}
            >
              Shareholders
            </Link>
            <Link
              href="/meetings"
              onClick={() => {
                setSelectedTab("meetings");
              }}
              className={`${
                selectedTab === "meetings"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              }`}
            >
              Meetings
            </Link>
          </div>

          {/* --- Right: Login Button (always visible) --- */}
          {/* <div className="hidden md:flex">
            <Link
              href="/login"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Login
            </Link>
          </div> */}

          {/* --- Mobile Hamburger --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="text-gray-800 dark:text-gray-200 hover:text-blue-600 dark:hover:text-blue-400 transition"
            >
              {isOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- Mobile Dropdown Menu --- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-60" : "max-h-0"
        }`}
      >
        <div className="px-4 pb-4 flex flex-col space-y-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/shareholders"
            className="block px-2 py-2 rounded-md text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setIsOpen(false)}
          >
            Shareholders
          </Link>
          <Link
            href="/meetings"
            className="block px-2 py-2 rounded-md text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            onClick={() => setIsOpen(false)}
          >
            Meetings
          </Link>
          {/* <Link
            href="/login"
            className="block px-2 py-2 rounded-md bg-blue-600 text-white text-center hover:bg-blue-700 transition"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link> */}
        </div>
      </div>
    </nav>
  );
};
