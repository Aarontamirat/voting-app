"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ShareholderModal from "@/components/modals/ShareholderModal";
import ShareholderDeleteModal from "@/components/modals/ShareholderDeleteModal";

export default function ShareholdersPage() {
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [totalShares, setTotalShares] = useState<string>("0");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [take] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit" | "bulk">("add");
  const [selectedShareholder, setSelectedShareholder] = useState<any>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState<any>(null);

  const fetchShareholders = async () => {
    setLoading(true);
    try {
      const url = `/api/shareholders?q=${encodeURIComponent(
        q
      )}&page=${page}&take=${take}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok) {
        setShareholders(data.items || []);
        setTotalShares(data.totalShares || "0");
        setTotalPages(Math.ceil((data.total || 0) / take));
      } else {
        toast.error(data.error || "Failed to fetch shareholders");
      }
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShareholders();
  }, [q, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="max-w-6xl mx-auto py-10 space-y-6">
      <Card className="shadow-md border border-gray-200">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl font-semibold">
            Shareholders Management
          </CardTitle>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">
              Total Shares: {totalShares}
            </span>
            <Button
              onClick={() => {
                setModalMode("add");
                setSelectedShareholder(null);
                setIsModalOpen(true);
              }}
              className="hover:cursor-pointer"
            >
              Add New Shareholder
            </Button>
            <Button
              onClick={() => {
                setModalMode("bulk");
                setSelectedShareholder(null);
                setIsModalOpen(true);
              }}
              className="hover:cursor-pointer"
              variant="outline"
            >
              Bulk Import
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by ID, Name, or Phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-sm"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Amharic Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Share Value</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shareholders.map((s) => (
                <TableRow key={s.id} className="hover:bg-gray-50">
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.nameAm || "-"}</TableCell>
                  <TableCell>{s.phone || "-"}</TableCell>
                  <TableCell>{s.address || "-"}</TableCell>
                  <TableCell>{s.shareValue}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(s.createdAt ? new Date(s.createdAt) : undefined)}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(s.updatedAt ? new Date(s.updatedAt) : undefined)}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      className="hover:cursor-pointer"
                      size="sm"
                      onClick={() => {
                        setModalMode("edit");
                        setSelectedShareholder(s);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      className="hover:cursor-pointer"
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedToDelete(s);
                        setIsDeleteOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Button
              className="hover:cursor-pointer"
              onClick={handlePrev}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button
              className="hover:cursor-pointer"
              onClick={handleNext}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <ShareholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedShareholder}
        onSuccess={fetchShareholders}
      />

      <ShareholderDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        shareholder={selectedToDelete}
        onSuccess={fetchShareholders}
      />
    </div>
  );
}
