"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { set } from "zod";

interface NomineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  onSuccess: () => void;
}

export default function NomineeModal({
  isOpen,
  onClose,
  meeting,
  onSuccess,
}: NomineeModalProps) {
  const [nominees, setNominees] = useState<any[]>([]);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [selectedShareholder, setSelectedShareholder] = useState("");
  const [selectedType, setSetselectedType] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [nomineeId, setNomineeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!meeting) return;
    fetchNominees();
  }, [meeting]);

  const fetchNominees = async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/nominees`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch nominees");
      setNominees(data.items || []);
      setShareholders(data.shareholders || []);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    }
  };

  const handleAdd = async () => {
    if (!selectedShareholder)
      return toast.error("Please select a shareholder as nominee");
    setLoading(true);
    try {
      const shareholder = shareholders.find(
        (s) => s.id === selectedShareholder
      );
      if (!shareholder) throw new Error("Invalid shareholder selected");

      const method = editOpen ? "PUT" : "POST";
      const url = editOpen
        ? `/api/meetings/${meeting.id}/nominees/${nomineeId}`
        : `/api/meetings/${meeting.id}/nominees`;
      const body = JSON.stringify({
        shareholderId: shareholder.id,
        name: shareholder.name,
        nameAm: shareholder.nameAm,
        type: selectedType,
        description: newDescription || "",
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add nominee");

      toast.success("Nominee added successfully");
      setSelectedShareholder("");
      setSetselectedType("");
      setNewDescription("");
      setNomineeId("");
      setEditOpen(false);
      fetchNominees();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNominee = async (id: string) => {
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/nominees/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete nominee");
      toast.success("Nominee deleted successfully");
      fetchNominees();
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="
      max-w-lg max-h-[80vh] overflow-y-auto
      bg-gradient-to-br 
      from-white via-slate-100 to-white 
      dark:from-gray-700 dark:via-gray-800 dark:to-gray-700
      text-gray-900 dark:text-gray-100
      border border-slate-300 dark:border-gray-700
    "
      >
        <DialogHeader>
          <DialogTitle>Nominees – {meeting?.title}</DialogTitle>

          <DialogDescription className="text-gray-600 dark:text-gray-300">
            Manage nominees here
          </DialogDescription>
        </DialogHeader>

        {/* BODY */}
        <div className="space-y-4 mt-2">
          {/* Existing nominees */}
          <div className="space-y-2">
            {nominees.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300 italic">
                No nominees yet
              </p>
            )}

            {nominees.map((n) => (
              <div
                key={n.id}
                className="
              border border-slate-300 dark:border-gray-700 
              bg-white dark:bg-gray-800 
              p-3 rounded-lg 
              flex justify-between items-center
            "
              >
                <div>
                  <p className="font-semibold text-gray-900 dark:text-gray-100">
                    {n.name} ({n.type})
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {n.description}
                  </p>
                </div>

                <div className="flex gap-2">
                  {/* Edit */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const isOpen = selectedShareholder === n.shareholderId;
                      setSelectedShareholder(isOpen ? "" : n.shareholderId);
                      setSetselectedType(isOpen ? "" : n.type);
                      setNomineeId(isOpen ? "" : n.id);
                      setNewDescription(isOpen ? "" : n.description);
                      setEditOpen(!isOpen);
                    }}
                    className="
                  bg-white dark:bg-gray-700 
                  text-gray-900 dark:text-gray-100
                  border border-slate-300 dark:border-gray-700
                  hover:bg-slate-200 dark:hover:bg-gray-600
                "
                  >
                    Edit
                  </Button>

                  {/* Delete */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteNominee(n.id)}
                    disabled={deleteLoading}
                    className="
                  bg-red-600 hover:bg-red-700 
                  text-white dark:text-gray-100
                "
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new nominee */}
          <div className="border-t border-slate-300 dark:border-gray-700 pt-3">
            <p className="font-medium mb-1">Add New Nominee</p>

            {/* Select nominee from shareholders */}
            <Select
              value={selectedShareholder}
              onValueChange={setSelectedShareholder}
            >
              <SelectTrigger
                className="
              w-full mt-1 
              bg-white dark:bg-gray-800 
              border border-slate-300 dark:border-gray-700
            "
              >
                <SelectValue placeholder="Select Shareholder" />
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {shareholders.map((s) => (
                  <SelectItem
                    key={s.id}
                    value={s.id}
                    className="whitespace-nowrap"
                  >
                    {s.name} ({s.nameAm} {Number(s.shareValue)} shares)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Select Type of Nominee */}
            <Select value={selectedType} onValueChange={setSetselectedType}>
              <SelectTrigger
                className="
              w-full mt-2
              bg-white dark:bg-gray-800
              border border-slate-300 dark:border-gray-700
            "
              >
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>

              <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                <SelectItem value="first">Type-1</SelectItem>
                <SelectItem value="second">Type-2</SelectItem>
              </SelectContent>
            </Select>

            {/* Description */}
            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="
            mt-2 
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
            onClick={onClose}
            className="
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100
          border border-slate-300 dark:border-gray-700
        "
          >
            Close
          </Button>

          <Button
            className="
          flex items-center gap-2 
          bg-transparent 
          border border-cyan-400 
          text-cyan-500 
          hover:bg-cyan-400 hover:text-gray-900
          dark:text-cyan-300 dark:hover:text-gray-900
        "
            onClick={handleAdd}
            disabled={loading}
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

            {editOpen
              ? "Update Nominee"
              : loading
              ? "Adding..."
              : "Add Nominee"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
