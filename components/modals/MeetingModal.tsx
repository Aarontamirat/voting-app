"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit";
  initialData?: any;
  onSuccess: () => void;
}

export default function MeetingModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: MeetingModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [quorum, setQuorum] = useState("");
  const [status, setStatus] = useState("Pending");
  const [firstPassers, setFirstPassers] = useState("");
  const [secondPassers, setSecondPassers] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.title);
      setDate(new Date(initialData.date).toISOString().slice(0, 16));
      setLocation(initialData.location);
      setQuorum(initialData.quorumPct.toString());
      setStatus(initialData.status);
      setFirstPassers(initialData.firstPassers);
      setSecondPassers(initialData.secondPassers);
    } else {
      setTitle("");
      setDate("");
      setLocation("");
      setQuorum("");
      setStatus("Pending");
      setFirstPassers("");
      setSecondPassers("");
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    const frontendErrors: string[] = [];
    if (!title.trim()) frontendErrors.push("Title is required");
    if (!date) frontendErrors.push("Date is required");
    if (!location.trim()) frontendErrors.push("Location is required");
    if (!quorum || isNaN(Number(quorum)))
      frontendErrors.push("Valid quorum is required");

    if (frontendErrors.length > 0) {
      toast.error(frontendErrors.join("\n"));
      return;
    }

    setLoading(true);
    try {
      const url =
        mode === "add" ? "/api/meetings" : `/api/meetings/${initialData.id}`;
      const method = mode === "add" ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          date,
          location,
          quorum,
          status,
          firstPassers,
          secondPassers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle Zod validation errors (array of issues) or string message
        if (data.error && Array.isArray(data.error)) {
          toast.error(
            data.error.map((e: any) => e.message || JSON.stringify(e))
          );
        } else if (data.error) {
          toast.error([data.error]);
        } else {
          toast.error(["Unknown server error"]);
        }
        return;
      }

      // toast.success(`Meeting ${mode === 'add' ? 'created' : 'updated'} successfully`);
      toast.success([
        `Meeting ${mode === "add" ? "created" : "updated"} successfully`,
      ]);
      // onClose();
      onSuccess();
    } catch (err: any) {
      toast.error([err.message || "Network error"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
      max-w-lg 
      bg-gradient-to-br 
      from-white via-slate-100 to-white 
      dark:from-gray-700 dark:via-gray-800 dark:to-gray-700
      text-gray-900 dark:text-gray-100
      border border-slate-300 dark:border-gray-700
    "
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add New Meeting" : "Edit Meeting"}
          </DialogTitle>

          <DialogDescription className="text-gray-600 dark:text-gray-300">
            {mode === "add" ? "Add a new meeting" : "Edit a meeting"}
          </DialogDescription>
        </DialogHeader>

        {/* FORM */}
        <div className="space-y-4 mt-2">
          {/* TITLE */}
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>

          {/* DATE */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Date & Time
            </label>
            <Input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>

          {/* LOCATION */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>

          {/* QUORUM */}
          <div>
            <label className="block text-sm font-medium mb-1">Quorum</label>
            <Input
              value={quorum}
              onChange={(e) => setQuorum(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>

          {/* FIRST PASSERS */}
          <div>
            <label
              htmlFor="firstPassersNumber"
              className="block text-sm font-medium mb-1"
            >
              Amount of passers from the 1st group
            </label>
            <Input
              id="firstPassersNumber"
              value={firstPassers}
              onChange={(e) => setFirstPassers(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>

          {/* SECOND PASSERS */}
          <div>
            <label
              htmlFor="secondPassersNumber"
              className="block text-sm font-medium mb-1"
            >
              Amount of passers from the 2nd group
            </label>
            <Input
              id="secondPassersNumber"
              value={secondPassers}
              onChange={(e) => setSecondPassers(e.target.value)}
              className="
            bg-white dark:bg-gray-800 
            border border-slate-300 dark:border-gray-700
          "
            />
          </div>
        </div>

        {/* FOOTER */}
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            className="
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100
          border border-slate-300 dark:border-gray-700
        "
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="
          flex items-center gap-2 
          bg-transparent 
          border border-cyan-400 
          text-cyan-500 
          hover:bg-cyan-400 hover:text-gray-900
          dark:text-cyan-300 dark:hover:text-gray-900
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
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                ></path>
              </svg>
            )}

            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
