"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2 } from "lucide-react";

interface MeetingShort {
  id: string;
  title: string;
  quorumPct?: number;
  status?: string;
}

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingShort | null;
  onSuccess: () => void;
}

export default function AttendanceModal({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}: AttendanceModalProps) {
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [repType, setRepType] = useState<
    "none" | "existing" | "shareholder" | "new"
  >("none");
  const [existingRepId, setExistingRepId] = useState("");
  const [repShareholderId, setRepShareholderId] = useState("");
  const [newRepName, setNewRepName] = useState("");
  const [newRepId, setNewRepId] = useState("");
  const [loading, setLoading] = useState(false);
  const [quorumInfo, setQuorumInfo] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredShareholders = shareholders.filter(
    (s) =>
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!meeting || !isOpen) return;
    fetchData();
  }, [meeting, isOpen]);

  const fetchData = async () => {
    try {
      const resSh = await fetch("/api/shareholders?take=5000");
      const shData = await resSh.json();
      if (!resSh.ok)
        throw new Error(shData.error || "Failed to load shareholders");
      setShareholders(shData.items ?? []);

      const resRep = await fetch("/api/representatives");
      if (resRep.ok) {
        const repData = await resRep.json();
        setRepresentatives(repData.items ?? []);
      } else setRepresentatives([]);

      const resAtt = await fetch(`/api/meetings/${meeting?.id}/attendance`);
      const attData = await resAtt.json();
      if (!resAtt.ok)
        throw new Error(attData.error || "Failed to load attendance");

      setAttendance(attData.attendance ?? []);
      setQuorumInfo({
        totalShares: attData.totalShares,
        attendedShares: attData.attendedShares,
        quorumPct: attData.quorumPct,
        quorumMet: attData.quorumMet,
      });

      setSelectedIds([]);
      setExistingRepId("");
      setRepShareholderId("");
      setNewRepName("");
      setNewRepId("");
      setRepType("none");
    } catch (err: any) {
      toast.error([err.message || "Error loading attendance data"]);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAdd = async () => {
    if (!meeting) return;
    if (selectedIds.length === 0) {
      toast.error(["Select at least one shareholder"]);
      return;
    }

    setLoading(true);

    try {
      const payload: any = { shareholderIds: selectedIds };

      if (repType === "existing") {
        if (!existingRepId)
          return toast.error(["Select existing representative"]);
        payload.representativeId = existingRepId;
      } else if (repType === "shareholder") {
        if (!repShareholderId)
          return toast.error(["Select representative shareholder"]);
        payload.representativeShareholderId = repShareholderId;
      } else if (repType === "new") {
        if (!newRepName.trim())
          return toast.error(["Enter representative name"]);
        if (!newRepId.trim()) return toast.error(["Enter representative ID"]);
        payload.representativeName = newRepName.trim();
        payload.representativeId = newRepId.trim(); // new field
      }

      const res = await fetch(`/api/meetings/${meeting.id}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add attendance");

      toast.success("Attendance recorded");
      await fetchData();
      onSuccess();
    } catch (err: any) {
      toast.error([err.message || "Error saving attendance"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!meeting) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/attendance/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete attendance");
      toast.success("Attendance deleted");
      await fetchData();
      onSuccess();
    } catch (err: any) {
      toast.error([err.message || "Error deleting attendance"]);
    } finally {
      setLoading(false);
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
      max-w-4xl sm:max-w-[40vw] max-h-[90vh]
      flex flex-col
      shadow-2xl border
      bg-white/70 dark:bg-gray-800/50
      border-gray-300 dark:border-gray-700
      backdrop-blur-xl
      text-gray-800 dark:text-gray-200
      transition-all
    "
      >
        <DialogHeader className="flex-shrink-0 pb-3 border-b border-gray-300 dark:border-gray-700">
          <DialogTitle
            className="
          text-2xl font-extrabold 
          bg-gradient-to-r from-cyan-500 to-blue-600
          dark:from-cyan-300 dark:to-blue-400
          text-transparent bg-clip-text
        "
          >
            Attendance — {meeting.title}
          </DialogTitle>
          <DialogDescription className="text-gray-700 dark:text-gray-300">
            Record attendance here
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1 space-y-4 mt-2">
          {/* QUORUM BOX */}
          {quorumInfo && (
            <div
              className="
            p-4 rounded-lg text-sm 
            bg-white/50 dark:bg-gray-800/50 
            border border-gray-300 dark:border-gray-700 
            shadow-sm backdrop-blur
          "
            >
              <div>
                <strong>Total shares:</strong> {quorumInfo.totalShares}
              </div>
              <div>
                <strong>Attended shares:</strong> {quorumInfo.attendedShares}
              </div>
              <div>
                <strong>Quorum:</strong> {quorumInfo.quorumPct}%
              </div>
              <div>
                <strong>Status:</strong>{" "}
                <span
                  className={
                    quorumInfo.quorumMet ? "text-green-500" : "text-red-500"
                  }
                >
                  {quorumInfo.quorumMet ? "Met" : "Not met"}
                </span>
              </div>
            </div>
          )}

          {/* REPRESENTATIVE TYPE */}
          <div className="space-y-2 bg-white/40 dark:bg-gray-800/40 border border-gray-300 dark:border-gray-700 rounded-lg p-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-3">
              {["none", "existing", "shareholder", "new"].map((type) => (
                <label
                  key={type}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="radio"
                    checked={repType === type}
                    onChange={() => setRepType(type as any)}
                    className="accent-cyan-500"
                  />
                  <span className="capitalize">
                    {type === "none"
                      ? "No representative (attend directly)"
                      : type === "existing"
                      ? "Existing Representative"
                      : type === "shareholder"
                      ? "Shareholder Representative"
                      : "New / External Representative"}
                  </span>
                </label>
              ))}
            </div>

            {/* EXISTING REP */}
            {repType === "existing" && (
              <select
                value={existingRepId}
                onChange={(e) => setExistingRepId(e.target.value)}
                className="
              w-full p-2 rounded 
              bg-white/60 dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600
            "
              >
                <option value="">Select representative</option>
                {representatives.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                    {r.shareholderId ? ` (shareholder ${r.shareholderId})` : ""}
                  </option>
                ))}
              </select>
            )}

            {/* SHAREHOLDER REP */}
            {repType === "shareholder" && (
              <select
                value={repShareholderId}
                onChange={(e) => setRepShareholderId(e.target.value)}
                className="
              w-full p-2 rounded 
              bg-white/60 dark:bg-gray-700 
              border border-gray-300 dark:border-gray-600
            "
              >
                <option value="">Select shareholder representative</option>
                {shareholders.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </select>
            )}

            {/* NEW REP */}
            {repType === "new" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="Representative Full Name"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                  className="bg-white/60 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
                <Input
                  placeholder="Representative ID"
                  value={newRepId}
                  onChange={(e) => setNewRepId(e.target.value)}
                  className="bg-white/60 dark:bg-gray-700 border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* SEARCH SHAREHOLDERS */}
          <div className="space-y-2">
            <div className="text-sm font-medium">Search Shareholder by ID</div>
            <Input
              placeholder="Enter shareholder ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
            w-full 
            bg-white/60 dark:bg-gray-700 
            border border-gray-300 dark:border-gray-600
            placeholder:text-gray-500 dark:placeholder:text-gray-400
          "
            />

            {searchTerm && (
              <div
                className="
              border border-gray-300 dark:border-gray-700 
              rounded-lg p-2 
              max-h-60 overflow-y-auto
              bg-white/40 dark:bg-gray-800/40 backdrop-blur
            "
              >
                {filteredShareholders.length > 0 ? (
                  filteredShareholders.map((s) => (
                    <div
                      key={s.id}
                      className="
                    flex justify-between items-center 
                    p-2 rounded-md cursor-pointer 
                    hover:bg-cyan-50 dark:hover:bg-gray-700/50 
                    transition
                  "
                    >
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {s.id} — {s.shareValue} shares
                        </div>
                      </div>
                      <Checkbox
                        checked={selectedIds.includes(s.id)}
                        onCheckedChange={() => toggleSelected(s.id)}
                        className="
                      w-5 h-5 cursor-pointer
                      data-[state=checked]:bg-cyan-500 
                      data-[state=checked]:border-white
                    "
                        disabled={loading}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    No shareholders found.
                  </div>
                )}
              </div>
            )}

            {/* SELECTED SHAREHOLDERS */}
            {selectedIds.length > 0 && (
              <div className="border-t border-gray-300 dark:border-gray-700 pt-2">
                <div className="text-sm font-medium mb-1">
                  Selected Shareholders:
                </div>
                <ul className="text-sm space-y-1">
                  {shareholders
                    .filter((s) => selectedIds.includes(s.id))
                    .map((s) => (
                      <li
                        key={s.id}
                        className="flex justify-between items-center"
                      >
                        <span>
                          {s.name} ({s.id})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:bg-transparent"
                          onClick={() => toggleSelected(s.id)}
                        >
                          Remove
                        </Button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* EXISTING ATTENDEES */}
          <div>
            <div className="text-sm font-medium mb-1">Existing Attendees</div>
            <div
              className="
            max-h-48 overflow-y-auto 
            border border-gray-300 dark:border-gray-700 
            rounded-lg p-2
            bg-white/40 dark:bg-gray-800/40 backdrop-blur
          "
            >
              {attendance.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  No attendees yet.
                </div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {attendance.map((a) => (
                    <li
                      key={a.id}
                      className="
                    flex justify-between items-center 
                    px-2 py-1 rounded-md
                    hover:bg-cyan-50 dark:hover:bg-gray-700/50 
                    transition
                  "
                    >
                      <div>
                        {a.shareholderName} ({a.shareValue})
                      </div>

                      <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                        {a.representedByName ?? "-"}

                        <Button
                          variant="outline"
                          className="
                        w-8 h-8 bg-transparent text-red-400 
                        hover:text-red-600 dark:hover:text-red-400 
                        border-none hover:bg-transparent 
                      "
                          onClick={() => handleDelete(a.id)}
                          disabled={loading}
                        >
                          <Trash2 />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* FOOTER BUTTONS */}
        <div
          className="
        flex justify-end gap-2 pt-4 
        border-t border-gray-300 dark:border-gray-700 
        flex-shrink-0
      "
        >
          <Button
            variant="outline"
            className="
          bg-white/50 dark:bg-gray-700 
          border border-gray-300 dark:border-gray-600
        "
            onClick={onClose}
            disabled={loading}
          >
            Close
          </Button>

          <Button
            onClick={handleAdd}
            disabled={loading}
            className="
          flex items-center gap-2
          bg-transparent border border-cyan-400 text-cyan-500 
          hover:bg-cyan-400 hover:text-gray-900
          transition
        "
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-cyan-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}
            {loading ? "Saving..." : "Add Attendance"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
