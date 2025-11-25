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
import LoaderRotatingLines from "@/components/general/LoaderRotatingLines";
import ShareholderDeleteAllModal from "@/components/modals/ShareholderDeleteAllModal";

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
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);
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
    <div className="md:max-w-6xl xl:max-w-7xl mx-auto py-10 space-y-6 text-gray-100">
      <Card className="shadow-md border-none bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          <CardTitle className="text-xl text-blue-300 font-semibold">
            Shareholders Management
          </CardTitle>
          <div className="flex flex-col md:flex-row md:items-center justify-between space-x-2 space-y-2">
            <span className="text-sm font-medium">
              Total Shares: {totalShares}
            </span>
            <div className="flex gap-2">
              {/* Shareholder adding (single) */}
              <Button
                onClick={() => {
                  setModalMode("add");
                  setSelectedShareholder(null);
                  setIsModalOpen(true);
                }}
                className="hover:cursor-pointer bg-green-700 hover:bg-green-800"
              >
                Add New Shareholder
              </Button>
              {/* Shareholders adding in bulk */}
              <Button
                onClick={() => {
                  setModalMode("bulk");
                  setSelectedShareholder(null);
                  setIsModalOpen(true);
                }}
                className="hover:cursor-pointer text-gray-900 bg-gray-300"
                variant="outline"
              >
                Bulk Import
              </Button>
              {/* Shareholder deleting all at once */}
              <Button
                onClick={() => {
                  setIsDeleteAllOpen(true);
                }}
                className="hover:cursor-pointer"
                variant={"destructive"}
              >
                Delete All
              </Button>
            </div>
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
              <TableRow className="bg-gray-800 hover:bg-gray-700">
                <TableHead className="text-gray-200 font-bold">ID</TableHead>
                <TableHead className="text-gray-200 font-bold">Name</TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Amharic Name
                </TableHead>
                <TableHead className="text-gray-200 font-bold">Phone</TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Address
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Share Value
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Created At
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Updated At
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableCell colSpan={10} className="h-24 text-center">
                    <LoaderRotatingLines
                      style={{
                        h: "30",
                        w: "30",
                        color: "#9cc5f5",
                        strokeWidth: 4,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}
              {shareholders.length === 0 && !loading && (
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center text-base text-red-900"
                  >
                    No shareholders found.
                  </TableCell>
                </TableRow>
              )}
              {shareholders.map((s) => (
                <TableRow key={s.id} className="bg-gray-800 hover:bg-gray-700">
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
                      className="hover:cursor-pointer bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900"
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

      {/* Shareholder Add/Edit modal */}
      <ShareholderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        initialData={selectedShareholder}
        onSuccess={fetchShareholders}
      />

      {/* Shareholder Delete modal */}
      <ShareholderDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        shareholder={selectedToDelete}
        onSuccess={fetchShareholders}
      />

      {/* Shareholder Delete All modal */}
      <ShareholderDeleteAllModal
        isOpen={isDeleteAllOpen}
        onClose={() => setIsDeleteAllOpen(false)}
        shareholder={selectedToDelete}
        onSuccess={fetchShareholders}
      />
    </div>
  );
}
