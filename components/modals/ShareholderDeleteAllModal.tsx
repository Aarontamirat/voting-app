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
import { AlertCircle } from "lucide-react";
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
      <DialogContent className="bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
        <DialogHeader>
          <DialogTitle>Delete All Shareholders</DialogTitle>
          <DialogDescription className="text-red-400">
            (Becareful, this step cannot be undone!)
          </DialogDescription>
        </DialogHeader>

        <p className="mt-2 text-sm ">
          Are you sure you want to delete{" "}
          <strong className="font-bold text-red-400">all shareholders</strong>?
        </p>

        <p className="mt-4 italic font-thin text-sm flex items-center justify-center text-neutral-100">
          <AlertCircle className="mr-2 h-7 w-7 text-red-400" />
          This will delete all records related to the shareholders. This action
          cannot be undone.
        </p>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="bg-gray-700"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-2 bg-transparent border border-red-400 text-red-400 hover:bg-red-500 hover:border-red-500 hover:text-neutral-100 font-semibold"
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-red-400"
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
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
