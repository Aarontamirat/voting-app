"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface ShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "add" | "edit" | "bulk";
  initialData?: any;
  onSuccess: () => void;
}

export default function ShareholderModal({
  isOpen,
  onClose,
  mode,
  initialData,
  onSuccess,
}: ShareholderModalProps) {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [nameAm, setNameAm] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [shareValue, setShareValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  // const [message, setMessage] = useState("");

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setNameAm(initialData.nameAm);
      setPhone(initialData.phone || "");
      setAddress(initialData.address || "");
      setShareValue(initialData.shareValue);
    } else {
      setId("");
      setName("");
      setNameAm("");
      setPhone("");
      setAddress("");
      setShareValue("");
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    if (mode === "bulk") {
      setLoading(true);
      try {
        if (!file) {
          alert("Please select a file");
          return;
        }
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/shareholders/bulk", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (res.ok) {
          toast.success(`Imported ${data.count} records successfully`);
          onClose();
        } else {
          toast.error(`Error: ${data.error}`);
        }
        onSuccess();
      } catch (error) {
        toast.error(`Error: ${error}`);
      } finally {
        setLoading(false);
      }
      return;
    } else {
      if (!id.trim() && mode === "add") {
        toast.error("ID is required");
        return;
      }
      if (!name.trim()) {
        toast.error("Name is required");
        return;
      }
      if (!nameAm.trim()) {
        toast.error("Amharic Name is required");
        return;
      }
      if (!shareValue.trim() || isNaN(Number(shareValue))) {
        toast.error("Valid Share Value is required");
        return;
      }

      setLoading(true);
      try {
        const url =
          mode === "add" ? "/api/shareholders" : `/api/shareholders/${id}`;
        const method = mode === "add" ? "POST" : "PUT";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name,
            nameAm,
            phone,
            address,
            shareValue,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed");

        toast.success(
          `Shareholder ${mode === "add" ? "added" : "updated"} successfully!`
        );
        onClose();
        onSuccess();
      } catch (err: any) {
        toast.error(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? "Add New Shareholder"
              : mode === "bulk"
              ? "Mass Import Shareholders"
              : "Edit Shareholder"}
          </DialogTitle>
        </DialogHeader>

        {mode === "bulk" ? (
          <div className="space-y-4 mt-2">
            <div>
              <Label
                htmlFor="bulkImport"
                className="block text-sm font-medium mb-1"
              >
                Excel File
              </Label>
              <Input
                id="bulkImport"
                type="file"
                accept=".xlsx, .xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {mode === "add" && (
              <div>
                <label className="block text-sm font-medium mb-1">ID</label>
                <Input value={id} onChange={(e) => setId(e.target.value)} />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Amharic Name
              </label>
              <Input
                value={nameAm}
                onChange={(e) => setNameAm(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Share Value
              </label>
              <Input
                value={shareValue}
                onChange={(e) => setShareValue(e.target.value)}
              />
            </div>
          </div>
        )}
        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
