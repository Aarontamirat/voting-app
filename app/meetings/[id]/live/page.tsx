"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  CartesianGrid,
} from "recharts";
import Loader from "@/components/general/Loader";

// Presentation-friendly live voting dashboard optimized for projector / big-screen display
export default function LiveVotingPresentation() {
  const { id } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [meetingStatus, setMeetingStatus] = useState<string>("");
  const [sharesAttended, setSharesAttended] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // colors chosen for contrast and accessibility
  const colors = [
    "#0B63E5",
    "#059669",
    "#F59E0B",
    "#DC2626",
    "#7C3AED",
    "#DB2777",
    "#0891B2",
    "#3B82F6",
    "#EF4444",
    "#22C55E",
    "#8B5CF6",
    "#F87171",
    "#10B981",
  ];

  // Fetching live results and auto-refresh
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/votes`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch results");
        if (!mounted) return;
        // ensure sort stable
        const sorted = (data.results || [])
          .slice()
          .sort((a: any, b: any) => b.totalWeight - a.totalWeight);
        setResults(sorted);
        setMeetingStatus(data.meetingStatus || "");
        setSharesAttended(data.totalSharesAttended || 0);
      } catch (err: any) {
        toast.error(err.message || "Error fetching results");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchResults();
    const interval = setInterval(fetchResults, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [id]);

  // compute totals and percentages
  const totals = useMemo(() => {
    const totalWeight = results.reduce(
      (s, r) => s + (Number(r.totalWeight) || 0),
      0
    );
    return { totalWeight };
  }, [results]);

  // accessibility: announce updates for screen readers
  const liveRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!liveRef.current) return;
    const text =
      meetingStatus === "CLOSED"
        ? "Voting closed"
        : meetingStatus === "VOTINGOPEN"
        ? "Voting in progress"
        : "Meeting not open for voting";
    liveRef.current.textContent = `${text}. ${
      results.length
    } nominees. Total shares: ${totals.totalWeight.toLocaleString()}`;
  }, [meetingStatus, results, totals.totalWeight]);

  // fullscreen helpers
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

  // keyboard shortcut F to toggle fullscreen
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "f") toggleFullScreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (loading) return <Loader />;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black/90 text-white p-6 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            🗳 ምርጫ (ቀጥታ)
          </h1>
          <p className="text-lg md:text-xl text-gray-200/90">
            {meetingStatus === "CLOSED"
              ? "ምርጫ ዝግ ነው"
              : meetingStatus === "VOTINGOPEN"
              ? "ምርጫ — በመካሄድ ላይ ነው"
              : "ይህ ስብሰባ ለምርጫ ክፍት አይደለም"}
          </p>
        </div>

        <div className="text-right lg:flex items-center gap-4">
          <div className="text-base lg:text-lg text-gray-300">
            አጠቃላይ ያሉ አክስዮኖች
          </div>
          <div className="text-base lg:text-lg font-bold">
            {sharesAttended.toLocaleString()}
          </div>
        </div>

        <div className="lg:flex gap-2">
          <button
            onClick={toggleFullScreen}
            className="px-2 py-1 text-sm rounded-lg bg-white text-black font-semibold shadow-md"
            aria-pressed={isFullScreen}
          >
            {isFullScreen ? "ከሙሉ መስኮት ውጣ (F)" : "ሙሉ መስኮት (F)"}
          </button>
          <button
            onClick={() => {
              // quick refresh
              location.reload();
            }}
            className="px-2 py-1 text-sm rounded-lg bg-gray-200/10 border border-gray-300/20 text-gray-100"
          >
            ማደስ
          </button>
        </div>
      </div>

      {/* Right: Ranking cards with big numbers and progress bars */}
      <div className="space-y-3">
        {/* <h3 className="text-2xl font-semibold">ደረጃ</h3> */}

        <div className="space-y-2">
          <AnimatePresence>
            {results.map((r, idx) => {
              const weight = Number(r.totalWeight) || 0;
              const pct =
                sharesAttended > 0
                  ? Math.round((weight / sharesAttended) * 1000) / 10
                  : 0; // 1 decimal

              return (
                <motion.div
                  key={r.nomineeId || r.name}
                  layout
                  layoutId={r.nomineeId || r.name} // shared layout id for rank motion
                  initial={{ opacity: 0, y: 15, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.95 }}
                  transition={{
                    layout: { type: "spring", stiffness: 120, damping: 18 },
                    duration: 0.35,
                  }}
                  className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl shadow-md shadow-black/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <motion.div
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 20,
                        }}
                        className="text-sm md:text-base font-extrabold w-12 text-center"
                      >
                        {idx + 1}
                      </motion.div>
                      <div className="flex items-center gap-2">
                        <motion.div
                          layout
                          className="text-sm md:text-base font-semibold"
                        >
                          {r.nameAm}
                        </motion.div>
                      </div>
                    </div>
                    <div className="text-base md:text-lg font-semibold">
                      {weight.toLocaleString()}{" "}
                      {/* <span className="text-sm md:text-base">አክሲዮኖች</span> */}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{pct}%</div>
                      {/* <div className="text-sm text-gray-300">የተቆጠሩ አክሲዮኖች</div> */}
                    </div>
                  </div>

                  {/* progress bar with smooth transition */}
                  <motion.div
                    layout
                    className="w-full bg-white/8 h-3 rounded-full overflow-hidden"
                  >
                    <motion.div
                      initial={false}
                      animate={{ width: `${Math.max(pct, 0)}%` }}
                      transition={{
                        type: "spring",
                        stiffness: 120,
                        damping: 18,
                      }}
                      className="h-full rounded-full"
                      style={{ background: colors[idx % colors.length] }}
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer small controls + live region for screen readers */}
      <div className="flex items-center justify-between text-sm text-gray-300">
        <div>Auto-refresh: every 3s · Sorted by total shares</div>
        <div>
          Tip: press <span className="px-1 bg-white/10 rounded">F</span> to
          toggle fullscreen
        </div>
      </div>

      <div
        aria-live="polite"
        aria-atomic="true"
        ref={liveRef}
        className="sr-only"
      />
    </div>
  );
}
