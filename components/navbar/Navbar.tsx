"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react"; // lightweight icons
import { Button } from "../ui/button";
import { Bungee_Spice } from "next/font/google";
import { ThemeToggle } from "../general/theme-toggle";

const bungeeSpice = Bungee_Spice({
  weight: ["400"],
  style: ["normal"],
  subsets: ["latin"],
});

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("");

  return (
    <nav className="sticky top-0 z-50 bg-gray-100 dark:bg-gray-900 dark:shadow-gray-700 shadow-gray-300 dark:text-neutral-100 text-gray-900 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* --- Left Section: Logo & Title --- */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center justify-between gap-2"
              onClick={() => {
                setSelectedTab("logoIcon");
              }}
            >
              <Image
                src="/logo.svg"
                width={70}
                height={70}
                alt="Logo"
                priority
                className="w-18 h-auto"
              />
              <span
                className={`text-xl font-semibold text-neutral-100 ${bungeeSpice.className}`}
                onClick={() => {
                  setSelectedTab("logoText");
                }}
              >
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
                  ? "dark:bg-gray-800 bg-gray-300"
                  : "dark:hover:bg-gray-800 hover:bg-gray-300"
              } rounded-md duration-300 transition-colors`}
            >
              <Button
                variant="link"
                size={"default"}
                className={`${
                  selectedTab === "shareholders" &&
                  "dark:text-blue-300 text-blue-800"
                } text-base hover:no-underline`}
              >
                Shareholders
              </Button>
            </Link>
            <Link
              href="/meetings"
              onClick={() => {
                setSelectedTab("meetings");
              }}
              className={`${
                selectedTab === "meetings"
                  ? "dark:bg-gray-800 bg-gray-300"
                  : "dark:hover:bg-gray-800 hover:bg-gray-300"
              } rounded-md duration-300 transition-colors`}
            >
              <Button
                variant="link"
                size={"default"}
                className={`${
                  selectedTab === "meetings" &&
                  "dark:text-blue-300 text-blue-800"
                } text-base hover:no-underline`}
              >
                Meetings
              </Button>
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

          {/* --- Right: Login Button (only visible on mobile) --- */}
          <div className="md:flex">
            <ThemeToggle />
          </div>

          {/* --- Mobile Hamburger --- */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="text-gray-900 dark:text-gray-200 transition"
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
        <div className="text-center mt-4 flex flex-col space-y-1 bg-gray-100 text-gray-900 dark:text-neutral-100 dark:bg-gray-800 shadow-gray-700 shadow-md">
          <Link
            href="/shareholders"
            className={`dark:bg-gray-700 bg-gray-300 md:rounded-md px-2 py-4 duration-300 transition-colors`}
            onClick={() => {
              setIsOpen(false);
              setSelectedTab("shareholders");
            }}
          >
            <Button
              variant="link"
              size={"default"}
              className={`${
                selectedTab === "shareholders" &&
                "dark:text-blue-300 text-blue-800"
              } text-base hover:no-underline`}
            >
              Shareholders
            </Button>
          </Link>
          <Link
            href="/meetings"
            className={`dark:bg-gray-700 bg-gray-300 md:rounded-md px-2 py-4 duration-300 transition-colors`}
            onClick={() => {
              setIsOpen(false);
              setSelectedTab("meetings");
            }}
          >
            <Button
              variant="link"
              size={"default"}
              className={`${
                selectedTab === "meetings" && "dark:text-blue-300 text-blue-800"
              } text-base hover:no-underline`}
            >
              Meetings
            </Button>
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
