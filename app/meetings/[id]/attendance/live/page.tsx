"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loader from "@/components/general/Loader";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/general/theme-toggle";
import Image from "next/image";

export default function LiveAttendancePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [totalShareholders, setTotalShareholders] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const prevAttendanceRef = useRef<any[]>([]);

  useEffect(() => {
    if (!id) return;

    const fetchAttendance = async () => {
      try {
        const [attendanceRes, shareholdersRes] = await Promise.all([
          fetch(`/api/meetings/${id}/attendance`),
          fetch(`/api/shareholders`),
        ]);

        const attendanceData = await attendanceRes.json();
        const shareholdersData = await shareholdersRes.json();

        if (!attendanceRes.ok)
          throw new Error(attendanceData.error || "Failed to load attendance");

        setData(attendanceData);
        setTotalShareholders(
          shareholdersData.total || shareholdersData.length || 0
        );

        // Detect newly arrived attendees
        if (prevAttendanceRef.current.length > 0) {
          const prevIds = new Set(
            prevAttendanceRef.current.map((a: any) => a.id)
          );
          const newOnes = attendanceData.attendance.filter(
            (a: any) => !prevIds.has(a.id)
          );

          if (newOnes.length > 0) {
            setNewArrivals((prev) => [...prev, ...newOnes]);

            setTimeout(() => {
              setNewArrivals((prev) =>
                prev.filter((x) => !newOnes.includes(x))
              );
            }, 4000);
          }
        }

        prevAttendanceRef.current = attendanceData.attendance;
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const toggleFullScreen = () => {
    const el = containerRef.current || document.documentElement;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
      setIsFullScreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullScreen(false);
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") toggleFullScreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!data) return <Loader />;

  const {
    totalShares,
    attendedShares,
    attendance,
    quorumPct,
    quorumMet,
    required,
  } = data;
  const attendedCount = attendance.length;
  const progressPct = Math.min((attendedShares / totalShares) * 100, 100);

  const gaugeColor = quorumMet
    ? "#02a337" // green-400
    : "#0d45ff"; // blue-400

  return (
    <div
      ref={containerRef}
      className="
        min-h-screen 
        bg-white
        dark:bg-gradient-to-r
        text-gray-900
        dark:from-gray-900 dark:via-black dark:to-gray-900 
        dark:text-gray-100
        relative
        py-8 px-6
      "
    >
      {/* Background */}
      <div
        className="
          absolute inset-0 
          bg-cover bg-center bg-no-repeat 
          opacity-15 dark:opacity-10 
          pointer-events-none
        "
        // style={{ backgroundImage: "url('/bg-live.png')" }}/
      />

      {/* Dark Overlay (soft) */}
      <div className="absolute inset-0 bg-white dark:bg-black/50 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-8xl mx-auto text-center space-y-6 relative z-10"
      >
        {/* HEADER */}
        <div className="w-full relative flex flex-col items-center md:flex-row md:items-center md:justify-center gap-6 md:gap-28">
          {/* LOGO LEFT */}
          <div className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={80}
              height={80}
              className="w-28 object-contain"
              priority
            />
          </div>

          {/* TITLE + SUBTITLE */}
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 to-green-500 bg-clip-text text-transparent text-center">
              የአቴንዳንስ መከታተያ (ቀጥታ)
            </h1>

            <p className="text-gray-700 dark:text-gray-300 mt-4 md:mt-2 uppercase tracking-widest text-sm md:text-lg text-center">
              የአሁን ሰዓት ባለአክሲዮኖች ተሳትፎ ዕይታ
            </p>
          </div>

          {/* FULLSCREEN BUTTON */}
          <div className="flex flex-col items-center gap-2 md:gap-4 md:flex-row">
            {isFullScreen && <ThemeToggle />}
            <Button
              onClick={toggleFullScreen}
              className="bg-transparent border-2 hover:bg-blue-900 dark:hover:bg-blue-900 border-blue-900 dark:border-blue-400 text-blue-900 dark:text-blue-300 hover:text-blue-100 rounded-2xl shadow-lg px-6"
            >
              {isFullScreen ? "Esc" : "F"}
            </Button>
          </div>
        </div>

        {/* GAUGE */}
        <div className="relative flex flex-col items-center justify-center mt-12">
          <motion.div
            className="relative w-72 h-72 md:w-96 md:h-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                quorumMet
                  ? "from-blue-800 via-green-500 to-blue-800"
                  : "from-green-800 via-blue-500 to-green-800"
              } blur-3xl opacity-25 dark:opacity-20`}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />

            <CircularProgressbar
              value={progressPct}
              text={`${progressPct.toFixed(
                progressPct < 100 ? (progressPct < 34 ? 2 : 1) : 0
              )}%`}
              styles={buildStyles({
                textColor: gaugeColor,
                pathColor: gaugeColor,
                trailColor: "#a1a4ad",
                textSize: "18px",
                strokeLinecap: "butt",
              })}
              className="font-semibold"
            />

            <motion.div
              className="absolute inset-10 rounded-full bg-blue-300/10 dark:bg-blue-200/10 blur-2xl"
              animate={{ opacity: [0.1, 0.9, 0.1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>

          <p
            className={`mt-6 text-2xl font-semibold ${
              quorumMet ? "text-green-700" : "text-gray-700 dark:text-gray-200"
            }`}
          >
            {quorumMet
              ? "Meeting Quorum Reached"
              : "Waiting for more Attendees ..."}
          </p>
        </div>

        {/* FLOATING WELCOME */}
        <div className="absolute top-72 left-1/5 -translate-x-1/2 z-50 pointer-events-none">
          <AnimatePresence>
            {newArrivals.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30, scale: 0.85 }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-10, -60, -120, -200],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4.2 }}
                className="relative w-fit mx-auto"
              >
                <svg
                  className="absolute inset-0 w-full h-full -z-10"
                  viewBox="0 0 200 80"
                >
                  <motion.path
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    animate={{
                      d: [
                        "M10,20 Q50,0 100,20 T190,20",
                        "M10,30 Q50,10 100,25 T190,35",
                        "M10,20 Q50,0 100,20 T190,20",
                      ],
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  />
                </svg>

                <div
                  className="
                  px-8 py-4 
                  text-2xl font-bold 
                  text-white 
                  select-none 
                  backdrop-blur-xl 
                  bg-black/40 dark:bg-white/20
                "
                >
                  Welcome {p.shareholderName}!
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mt-10"
        >
          {[
            { label: "Total Shares", value: totalShares },
            { label: "Shareholders", value: totalShareholders },
            { label: "Attendees", value: attendedCount },
            { label: "Attendee Shares", value: attendedShares },
            { label: "Quorum Shares", value: required },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="
                backdrop-blur-md 
                border-2 
                border-blue-900 dark:border-blue-400
                rounded-2xl p-6 text-center 
                bg-white/20 dark:bg-black/30 
                shadow-xl 
              "
            >
              <p
                className="
                text-blue-600 dark:text-blue-300 text-base md:text-md lg:text-xl
                font-bold uppercase tracking-wide
              "
              >
                {item.label}
              </p>

              <p
                className="
                text-3xl lg:text-4xl 2xl:text-5xl 
                font-mono font-bold mt-5 
                text-gray-900 dark:text-gray-100
              "
              >
                {item.label === "Quorum Shares"
                  ? item.value.toFixed(2)
                  : item.value}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
