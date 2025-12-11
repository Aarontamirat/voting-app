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

export default function ShareholderDeleteModal({
  isOpen,
  onClose,
  shareholder,
  onSuccess,
}: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!shareholder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shareholders/${shareholder.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      toast.success("Shareholder deleted successfully!");
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
      <DialogContent
        className="
      max-w-md
      bg-gradient-to-br
      from-white via-slate-100 to-white
      dark:from-gray-700 dark:via-gray-800 dark:to-gray-700
      text-gray-900 dark:text-gray-100
      border border-slate-300 dark:border-gray-700
      shadow-xl
    "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Delete Shareholder
          </DialogTitle>
          <DialogDescription
            className="
          text-red-500 
          dark:text-red-400 
          text-sm mt-1
        "
          >
            This action is permanent and cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* MAIN TEXT */}
        <div className="mt-4 space-y-3">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <strong className="font-bold text-red-500 dark:text-red-400">
              {shareholder?.name}
            </strong>
            ?
          </p>
        </div>

        {/* FOOTER */}
        <DialogFooter className="mt-6 flex justify-end space-x-2">
          {/* Cancel */}
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="
          bg-white dark:bg-gray-700 
          text-gray-900 dark:text-gray-100
          border border-slate-300 dark:border-gray-700
        "
          >
            Cancel
          </Button>

          {/* Delete */}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
            className="
          flex items-center gap-2
          bg-transparent
          border border-red-500 dark:border-red-400
          text-red-600 dark:text-red-300
          hover:bg-red-500 hover:text-white
          dark:hover:bg-red-500
          font-semibold
        "
          >
            {loading && (
              <svg
                className="animate-spin h-4 w-4 text-red-500 dark:text-red-300"
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
