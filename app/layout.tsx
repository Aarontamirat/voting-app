import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar/Navbar";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Voting App",
  description: "Shareholders Voting System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-neutral-100 dark:bg-gradient-to-br dark:from-gray-800 dark:via-gray-900 dark:to-gray-800`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          value={{ light: "light", dark: "dark" }}
          enableSystem
        >
          <Navbar />
          {children}
          <Toaster
            position="top-center"
            richColors
            duration={3000} // 3 seconds timeout for the toast messages
            closeButton
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
