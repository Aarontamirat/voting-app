"use client";

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "@/components/general/Loader";

const COLORS = [
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

export default function LiveVotingPresentation() {
  const { id } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [meetingStatus, setMeetingStatus] = useState<string>("");
  const [firstPassers, setFirstPassers] = useState<number>(0);
  const [secondPassers, setSecondPassers] = useState<number>(0);
  const [sharesAttended, setSharesAttended] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const liveRef = useRef<HTMLDivElement | null>(null);

  // Fetch live results every 3 seconds
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/votes`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch results");
        if (!mounted) return;

        const sortedResults = (data.results || []).slice();
        setResults(sortedResults);
        setMeetingStatus(data.meetingStatus || "");
        setFirstPassers(data.meetingFirstPassers || 0);
        setSecondPassers(data.meetingSecondPassers || 0);
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

  // Compute display order: top 6 Type1 + top 3 Type2 at the top
  const displayResults = useMemo(() => {
    if (!results || results.length === 0) return [];

    const type1Nominees = results
      .filter((r) => r.type === "first")
      .sort((a, b) => b.totalWeight - a.totalWeight);

    const type2Nominees = results
      .filter((r) => r.type === "second")
      .sort((a, b) => b.totalWeight - a.totalWeight);

    const topType1 = type1Nominees.slice(0, firstPassers);
    const topType2 = type2Nominees.slice(0, secondPassers);

    // Merge top winners and sort by weight
    const top9 = [...topType1, ...topType2].sort(
      (a, b) => b.totalWeight - a.totalWeight
    );

    const topIds = new Set(top9.map((r) => r.nomineeId));

    const remaining = results
      .filter((r) => !topIds.has(r.nomineeId))
      .sort((a, b) => b.totalWeight - a.totalWeight);

    return [...top9, ...remaining];
  }, [results]);

  const totals = useMemo(() => {
    const totalWeight = results.reduce(
      (s, r) => s + (Number(r.totalWeight) || 0),
      0
    );
    return { totalWeight };
  }, [results]);

  // accessibility: announce updates for screen readers
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

  if (loading) return <Loader />;

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black/90 text-white px-6 pb-6 flex flex-col gap-6"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0 flex space-x-2 md:space-x-4 ">
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
            onClick={() => location.reload()}
            className="px-2 py-1 text-sm rounded-lg bg-gray-200/10 border border-gray-300/20 text-gray-100"
          >
            ማደስ
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayResults.map((r, idx) => {
            const weight = Number(r.totalWeight) || 0;
            const pct =
              sharesAttended > 0
                ? Math.round((weight / sharesAttended) * 1000) / 10
                : 0;

            return (
              <motion.div
                key={r.nomineeId}
                layout
                layoutId={r.nomineeId}
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{
                  layout: { type: "spring", stiffness: 120, damping: 18 },
                  duration: 0.35,
                }}
                className={`flex flex-col gap-2 p-3 rounded-xl shadow-md shadow-black/20 ${
                  idx < firstPassers + secondPassers
                    ? "bg-green-300/20"
                    : "bg-white/5"
                }`}
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
                      <span
                        className={`px-1 text-xs rounded ${
                          r.type === "first" ? "bg-blue-600" : "bg-green-600"
                        }`}
                      >
                        {r.type === "first" ? "Type 1" : "Type 2"}
                      </span>
                    </div>
                  </div>

                  <div className="text-base md:text-lg font-semibold">
                    {weight.toLocaleString()}
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold">{pct}%</div>
                  </div>
                </div>

                <motion.div
                  layout
                  className="w-full bg-white/8 h-3 rounded-full overflow-hidden"
                >
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.max(pct, 0)}%` }}
                    transition={{ type: "spring", stiffness: 120, damping: 18 }}
                    className="h-full rounded-full"
                    style={{ background: COLORS[idx % COLORS.length] }}
                  />
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

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
