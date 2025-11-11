"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Loader from "@/components/general/Loader";

export default function LiveAttendancePage() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [totalShareholders, setTotalShareholders] = useState(0);

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
      } catch (err: any) {
        toast.error(err.message);
      }
    };

    fetchAttendance();
    const interval = setInterval(fetchAttendance, 3000);
    return () => clearInterval(interval);
  }, [id]);

  if (!data) return <Loader />;

  const { totalShares, attendedShares, attendance, quorumPct, quorumMet } =
    data;
  const attendedCount = attendance.length;
  // const quorumTarget = (totalShares * quorumPct) / 100;
  const progressPct = Math.min((attendedShares / totalShares) * 100, 100);
  const gaugeColor = quorumMet ? "#00b84d" : "#0094ff";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-gray-200 text-gray-800 py-12 px-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto text-center space-y-10"
      >
        {/* HEADER */}
        <div>
          <h1 className="text-4xl md:text-6xl font-extrabold bg-gradient-to-r from-sky-600 to-blue-700 bg-clip-text text-transparent drop-shadow-sm">
            የአቴንዳንስ መከታተያ (ቀጥታ)
          </h1>
          <p className="text-gray-500 mt-2 uppercase tracking-widest text-sm">
            የአሁን ሰዓት ባለአክሲዮኖች ተሳትፎ ዕይታ
          </p>
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
              className="absolute inset-0 rounded-full bg-gradient-to-r from-sky-300 via-blue-400 to-sky-300 blur-3xl opacity-30"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            />

            {/* Circular Gauge */}
            <CircularProgressbar
              value={progressPct}
              text={`${progressPct.toFixed(2)}%`}
              styles={buildStyles({
                textColor: gaugeColor,
                pathColor: gaugeColor,
                trailColor: "#e5e7eb",
                textSize: "18px",
                pathTransitionDuration: 1.5,
                strokeLinecap: "round",
              })}
            />

            {/* Center Glow */}
            <motion.div
              className="absolute inset-10 rounded-full bg-sky-200/30 blur-2xl"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 3 }}
            />
          </motion.div>

          {/* Status Text */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`mt-8 text-2xl font-semibold ${
              quorumMet ? "text-green-600" : "text-sky-600"
            }`}
          >
            {quorumMet
              ? "ምልአተ ጉባኤ ሞልቷል — ስብሰባው ለመካሄድ ዝግጁ ነው"
              : "ተጨማሪ ተሳታፊዎችን በመጠበቅ ላይ ..."}
          </motion.p>
        </div>

        {/* STATS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16"
        >
          {[
            { label: "አጠቃላይ ሼሮች", value: totalShares },
            { label: "አጠቃላይ ባለአክስዮኖች", value: totalShareholders },
            { label: "ተሳታፊዎች", value: attendedCount },
            { label: "የተሳታፊዎች አክስዮን ብዛት", value: attendedShares },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-white/80 backdrop-blur-md border border-blue-100 shadow-xl rounded-2xl p-6 text-center hover:shadow-2xl hover:shadow-blue-100 transition"
            >
              <p className="text-xs uppercase tracking-widest text-gray-500">
                {item.label}
              </p>
              <motion.p
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ repeat: Infinity, duration: 2 + idx * 0.3 }}
                className="text-3xl md:text-4xl font-mono font-bold mt-2 text-blue-700"
              >
                {item.value.toLocaleString()}
              </motion.p>
            </motion.div>
          ))}
        </motion.div>

        {/* ATTENDEE LIST */}
        <div className="mt-12 bg-white/70 border border-blue-100 rounded-2xl shadow-md p-8 max-h-[60vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-blue-700 mb-6">
            የተሳታፊዎች ዝርዝር (ቀጥታ)
          </h2>
          <AnimatePresence>
            {attendance.map((a: any, i: number) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: i * 0.02 }}
                className="flex justify-between items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-sky-50 rounded-lg border border-blue-100 mb-2"
              >
                <span className="text-sm font-medium text-gray-700">
                  {a.shareholderNameAm}
                </span>
                <span className="text-sm text-sky-600 font-mono">
                  {Number(a.shareValue).toLocaleString()} ሼሮች
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
