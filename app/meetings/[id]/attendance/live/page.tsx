"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loader from "@/components/general/Loader";
import { Button } from "@/components/ui/button";

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
            // add them to newArrivals
            setNewArrivals((prev) => [...prev, ...newOnes]);

            // remove them after 4 seconds
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

  const { totalShares, attendedShares, attendance, quorumPct, quorumMet } =
    data;
  const attendedCount = attendance.length;
  // const quorumTarget = (totalShares * quorumPct) / 100;
  const progressPct = Math.min((attendedShares / totalShares) * 100, 100);
  const gaugeColor = quorumMet ? "#00b84d" : "#0094ff";

  return (
    <div
      ref={containerRef}
      className={`min-h-screen bg-gradient-to-r from-gray-800 ${
        quorumMet ? "via-[#011604]" : "via-gray-950 "
      } to-gray-800 text-blue-900 py-8 px-6`}
    >
      {/* 🔳 BACKGROUND IMAGE */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20 pointer-events-none"
        style={{ backgroundImage: "url('/bg-live.png')" }}
      />

      {/* 🔳 DARK OVERLAY TO MAKE IT DIM */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-8xl mx-auto text-center space-y-6"
      >
        {/* HEADER */}
        <div>
          <div className="">
            <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-700 to-green-500 bg-clip-text text-transparent drop-shadow-sm">
              የአቴንዳንስ መከታተያ (ቀጥታ)
            </h1>

            <p className="text-neutral-50 mt-6 uppercase tracking-widest text-sm sm:text-base md:text-lg lg:text-xl">
              የአሁን ሰዓት ባለአክሲዮኖች ተሳትፎ ዕይታ
            </p>
          </div>
          <div className="float-right">
            <div className="lg:flex gap-2">
              <Button
                onClick={toggleFullScreen}
                aria-pressed={isFullScreen}
                className="bg-transparent backdrop-blur-md border-2 border-blue-900 shadow-xl rounded-2xl text-center hover:shadow-2xl hover:shadow-blue-900/20 transition"
              >
                {isFullScreen ? "Esc" : "F"}
              </Button>
            </div>
          </div>
        </div>

        {/* GAUGE SECTION */}
        <div className="relative flex flex-col items-center justify-center mt-12">
          <motion.div
            className="relative w-72 h-72 md:w-96 md:h-96"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 70 }}
          >
            {/* Rotating halo glow */}
            <motion.div
              className={`absolute inset-0 rounded-full bg-gradient-to-r ${
                quorumMet
                  ? " from-blue-900 via-green-500 to-blue-900"
                  : "from-green-900 via-blue-500 to-green-900"
              }  blur-3xl opacity-30`}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />

            {/* Circular Gauge */}
            <CircularProgressbar
              className="font-mono"
              value={progressPct}
              text={`${
                progressPct < 10
                  ? progressPct.toFixed(2)
                  : progressPct < 26
                  ? progressPct.toFixed(1)
                  : progressPct.toFixed(0)
              }%`}
              styles={buildStyles({
                textColor: gaugeColor,
                pathColor: gaugeColor,
                trailColor: "#c5c7cb",
                textSize: "18px",
                pathTransitionDuration: 2,
                strokeLinecap: "butt",
              })}
            />

            {/* Center Glow */}
            <motion.div
              className={`absolute inset-10 rounded-full ${
                quorumMet ? "bg-green-200/20" : "bg-blue-200/20"
              } blur-2xl`}
              animate={{ opacity: [0.1, 0.9, 0.1] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>

          {/* STATUS TEXT */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-10 text-2xl font-semibold ${
              quorumMet ? "text-green-600" : "text-neutral-100"
            }`}
          >
            {quorumMet
              ? "Meeting Quorum Reached"
              : "Waiting for more Attendees ..."}
          </motion.p>
        </div>

        {/* FLOATING WELCOME MESSAGES */}
        <div className="absolute top-70 left-1/5 -translate-x-1/2 z-50 pointer-events-none">
          <AnimatePresence>
            {newArrivals.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  opacity: 0,
                  y: 30,
                  scale: 0.85,
                  filter: "blur(5px)",
                }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  y: [-10, -60, -120, -200],
                  x: [0, -10, 10, -5, 0], // little smoke drift
                  scale: [0.8, 1, 1.05, 1],
                  filter: ["blur(2px)", "blur(0px)", "blur(0px)", "blur(4px)"],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4.2, ease: "easeOut" }}
                className="relative w-fit mx-auto"
              >
                {/* The animated wavy blob background */}
                <svg
                  className="absolute inset-0 w-full h-full -z-10"
                  viewBox="0 0 200 80"
                  preserveAspectRatio="none"
                >
                  <motion.path
                    fill="rgba(255,255,255,0.15)"
                    stroke="rgba(255,255,255,0.25)"
                    strokeWidth="2"
                    animate={{
                      d: [
                        "M10,20 Q50,0 100,20 T190,20 Q150,60 100,50 T10,20",
                        "M10,30 Q50,10 100,25 T190,35 Q150,70 100,55 T10,30",
                        "M10,20 Q50,0 100,20 T190,20 Q150,60 100,50 T10,20",
                      ],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </svg>

                <div className="px-8 py-4 text-white text-2xl font-bold select-none backdrop-blur-xl">
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
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-16"
        >
          {[
            { label: "Total Shares", value: totalShares },
            { label: "Total Shareholders", value: totalShareholders },
            { label: "Attendees", value: attendedCount },
            { label: "Total Attendee Shares", value: attendedShares },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-transparent backdrop-blur-md border-2 border-blue-900 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-blue-900/20 transition"
            >
              <p className="sm:text-sm md:text-lg 2xl:text-2xl uppercase 2xl:tracking-wide font-bold text-blue-400 whitespace-nowrap">
                {item.label}
              </p>

              <motion.p
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 + idx * 0.3 }}
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-mono font-bold mt-5 text-neutral-200"
              >
                {item.value.toLocaleString()}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
