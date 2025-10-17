'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'recharts';
import Loader from '@/components/general/Loader';

// Presentation-friendly live voting dashboard optimized for projector / big-screen display
export default function LiveVotingPresentation() {
  const { id } = useParams();
  const [results, setResults] = useState<any[]>([]);
  const [meetingStatus, setMeetingStatus] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // colors chosen for contrast and accessibility
  const colors = ['#0B63E5', '#059669', '#F59E0B', '#DC2626', '#7C3AED', '#DB2777', '#0891B2'];

  // Fetching live results and auto-refresh
  useEffect(() => {
    if (!id) return;
    let mounted = true;

    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/meetings/${id}/votes`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch results');
        if (!mounted) return;
        // ensure sort stable
        const sorted = (data.results || []).slice().sort((a: any, b: any) => b.totalWeight - a.totalWeight);
        setResults(sorted);
        setMeetingStatus(data.meetingStatus || '');
      } catch (err: any) {
        toast.error(err.message || 'Error fetching results');
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
    const totalWeight = results.reduce((s, r) => s + (Number(r.totalWeight) || 0), 0);
    return { totalWeight };
  }, [results]);

  // accessibility: announce updates for screen readers
  const liveRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!liveRef.current) return;
    const text =
      meetingStatus === 'CLOSED'
        ? 'Voting closed'
        : meetingStatus === 'VOTINGOPEN'
        ? 'Voting in progress'
        : 'Meeting not open for voting';
    liveRef.current.textContent = `${text}. ${results.length} nominees. Total shares: ${totals.totalWeight.toLocaleString()}`;
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
      if (e.key.toLowerCase() === 'f') toggleFullScreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (loading) return <Loader />;

  return (
    <div ref={containerRef} className="min-h-screen bg-black/90 text-white p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">🗳 Live Voting</h1>
          <p className="text-xl md:text-2xl text-gray-200/90">{meetingStatus === 'CLOSED' ? 'Voting Closed' : meetingStatus === 'VOTINGOPEN' ? 'Voting — In Progress' : 'Meeting Not Open for Voting'}</p>
        </div>

        <div className="flex flex-col items-end gap-3">
          <div className="text-right">
            <div className="text-sm text-gray-300">Total Shares Counted</div>
            <div className="text-3xl md:text-4xl font-bold">{totals.totalWeight.toLocaleString()}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={toggleFullScreen}
              className="px-4 py-2 rounded-lg bg-white text-black font-semibold shadow-md"
              aria-pressed={isFullScreen}
            >
              {isFullScreen ? 'Exit Fullscreen (F)' : 'Fullscreen (F)'}
            </button>
            <button
              onClick={() => {
                // quick refresh
                location.reload();
              }}
              className="px-4 py-2 rounded-lg bg-gray-200/10 border border-gray-300/20 text-gray-100"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left: Big horizontal bar chart (large, readable) */}
        <div className="md:col-span-2 bg-white/5 rounded-2xl p-4" style={{ minHeight: 420 }}>
          <h2 className="text-2xl font-semibold mb-2">Results</h2>
          {results.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-300">No votes yet</div>
          ) : (
            <div className="h-[600px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={results}
                  layout="vertical"
                  margin={{ top: 10, right: 40, left: 20, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.08} />
                  <XAxis type="number" tickLine={false} axisLine={false} stroke="#cbd5e1" />
                  <YAxis dataKey="name" type="category" width={180} tickLine={false} axisLine={false} stroke="#cbd5e1" />
                  <Tooltip cursor={{ fill: 'rgba(255,255,255,0.06)' }} contentStyle={{ background: '#0b1220', borderRadius: 8 }} />
                  <Bar dataKey="totalWeight" barSize={28} radius={[8, 8, 8, 8]} isAnimationActive={false}>
                    {results.map((r, i) => (
                      <Cell key={`cell-${i}`} fill={colors[i % colors.length]} />
                    ))}
                    <LabelList
                      dataKey="totalWeight"
                      position="right"
                      formatter={(val: any) => (val !== null && val !== undefined ? val.toLocaleString() : '')}
                      style={{ fontWeight: 700 }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Right: Ranking cards with big numbers and progress bars */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold">Ranking</h3>

          <div className="space-y-2">
            <AnimatePresence>
              {results.map((r, idx) => {
                const weight = Number(r.totalWeight) || 0;
                const pct = totals.totalWeight > 0 ? Math.round((weight / totals.totalWeight) * 1000) / 10 : 0; // 1 decimal
                return (
                  <motion.div
                    key={r.nomineeId || r.name}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col gap-2 bg-white/5 p-3 rounded-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl font-extrabold w-12 text-center">{idx + 1}</div>
                        <div>
                          <div className="text-lg md:text-xl font-semibold">{r.name}</div>
                          <div className="text-sm text-gray-300">{weight.toLocaleString()} shares</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{pct}%</div>
                        <div className="text-sm text-gray-300">of counted shares</div>
                      </div>
                    </div>

                    {/* progress bar */}
                    <div className="w-full bg-white/8 h-3 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${Math.max(pct, 0)}%`, background: colors[idx % colors.length] }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer small controls + live region for screen readers */}
      <div className="flex items-center justify-between text-sm text-gray-300">
        <div>Auto-refresh: every 3s · Sorted by total shares</div>
        <div>Tip: press <span className="px-1 bg-white/10 rounded">F</span> to toggle fullscreen</div>
      </div>

      <div aria-live="polite" aria-atomic="true" ref={liveRef} className="sr-only" />
    </div>
  );
}
