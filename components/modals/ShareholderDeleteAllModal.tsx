"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareholder: any; // { id, name }
  onSuccess: () => void;
}

export default function ShareholderDeleteAllModal({
  isOpen,
  onClose,
  onSuccess,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/shareholders`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("All shareholders deleted successfully!");
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete All Shareholders</DialogTitle>
          <DialogDescription>
            (Becareful, this step cannot be undone!)
          </DialogDescription>
        </DialogHeader>

        <p className="mt-2 text-sm text-red-400">
          Are you sure you want to delete all shareholders?
        </p>

        <p className="mt-2 text-sm text-gray-600">
          (This will delete all records related to the shareholders. This action
          cannot be undone.)
        </p>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
