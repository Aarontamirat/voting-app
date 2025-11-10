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
      <DialogContent className="DialogContent max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nominees - {meeting?.title}</DialogTitle>
          <DialogDescription>Manage nominees here</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Existing nominees list */}
          <div className="space-y-2">
            {nominees.length === 0 && (
              <p className="text-sm text-gray-500 italic">No nominees yet</p>
            )}
            {nominees.map((n) => (
              <div
                key={n.id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div className="">
                  <p className="font-medium">
                    {n.name} ({n.type})
                  </p>
                  <p className="text-sm text-gray-600">{n.description}</p>
                </div>
                <div className="flex gap-2">
                  {/* edit nominee */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const isOpen = selectedShareholder === n.shareholderId;
                      setSelectedShareholder(isOpen ? "" : n.shareholderId);
                      setSetselectedType(isOpen ? "" : n.type);
                      setNomineeId(isOpen ? "" : n.id);
                      setNewDescription(isOpen ? "" : n.description);
                      setEditOpen(isOpen ? false : true);
                    }}
                  >
                    Edit
                  </Button>

                  {/* remove nominee */}
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      handleDeleteNominee(n.id);
                    }}
                    disabled={deleteLoading}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new nominee section */}
          <div className="border-t pt-2">
            <p className="font-medium mb-1">Add New Nominee</p>

            {/* Select nominee from shareholders */}
            <Select
              value={selectedShareholder}
              onValueChange={setSelectedShareholder}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Shareholder" />
              </SelectTrigger>
              <SelectContent className="">
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
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent className="">
                <SelectItem value="first">First</SelectItem>
                <SelectItem value="second">Second</SelectItem>
              </SelectContent>
            </Select>

            {/* Nominee Description (Optional) */}
            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="mt-2"
            />

            <Button className="mt-2" onClick={handleAdd} disabled={loading}>
              {editOpen
                ? "Update Nominee"
                : loading
                ? "Adding..."
                : "Add Nominee"}
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
