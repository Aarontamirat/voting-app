"use client";

import { Suspense, useEffect, useState } from "react";
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
    <div className="md:max-w-6xl xl:max-w-7xl mx-auto p-2 md:p-3 py-10 space-y-6">
      {/* PAGE CONTAINER */}
      <Card
        className="
      shadow-xl border 
      bg-white/70 border-gray-300 
      dark:bg-gray-800/50 dark:border-gray-700 
      backdrop-blur-md transition-all
    "
      >
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between">
          {/* TITLE */}
          <CardTitle
            className="
          text-3xl font-extrabold 
          bg-gradient-to-r from-cyan-500 to-blue-600
          dark:from-cyan-300 dark:to-blue-400
          text-transparent bg-clip-text
        "
          >
            Shareholders Management
          </CardTitle>

          {/* ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row md:items-center justify-between space-x-2 space-y-2 mt-4 md:mt-0">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Shares: {totalShares}
            </span>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setModalMode("add");
                  setSelectedShareholder(null);
                  setIsModalOpen(true);
                }}
                className="
              bg-cyan-600 hover:bg-cyan-700 
              text-white shadow-md
            "
              >
                Add New Shareholder
              </Button>

              <Button
                onClick={() => {
                  setModalMode("bulk");
                  setSelectedShareholder(null);
                  setIsModalOpen(true);
                }}
                className="
              bg-white text-gray-900 
              dark:bg-gray-700 dark:text-gray-200 
              border border-gray-300 dark:border-gray-600
              hover:border-cyan-400 hover:shadow-cyan-500/30
            "
                variant="outline"
              >
                Bulk Import
              </Button>

              <Button
                onClick={() => setIsDeleteAllOpen(true)}
                variant="destructive"
                className="
              bg-red-600 hover:bg-red-700 
              text-white shadow-md
            "
              >
                Delete All
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* SEARCH INPUT */}
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by ID, Name, or Phone"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="
          max-w-sm 
          bg-white/60 dark:bg-gray-700 
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-gray-200
        "
          />

          {/* TABLE */}
          <Table>
            <TableHeader>
              <TableRow
                className="
              bg-gray-100 dark:bg-gray-900 
              border-b border-gray-300 dark:border-gray-700
            "
              >
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  ID
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Name
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Amharic Name
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Phone
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Address
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Share Value
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Created At
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Updated At
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading && (
                <TableRow className="bg-white/40 dark:bg-gray-800/40 backdrop-blur">
                  <TableCell colSpan={10} className="h-24 text-center">
                    <LoaderRotatingLines
                      style={{
                        h: "30",
                        w: "30",
                        color: "#22d3ee",
                        strokeWidth: 4,
                      }}
                    />
                  </TableCell>
                </TableRow>
              )}

              {shareholders.length === 0 && loading === false && (
                <TableRow className="bg-white/40 dark:bg-gray-800/40 backdrop-blur">
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center text-base text-red-600 dark:text-red-400"
                  >
                    No shareholders found.
                  </TableCell>
                </TableRow>
              )}

              {shareholders.map((s) => (
                <TableRow
                  key={s.id}
                  className="
                bg-white/50 dark:bg-gray-800/50 
                border-b border-gray-200 dark:border-gray-700
                hover:bg-cyan-50 dark:hover:bg-gray-700/40
                transition
              "
                >
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.id}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.name}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.nameAm || "-"}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.phone || "-"}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.address || "-"}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {s.shareValue}
                  </TableCell>

                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(s.createdAt ? new Date(s.createdAt) : undefined)}
                  </TableCell>

                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(s.updatedAt ? new Date(s.updatedAt) : undefined)}
                  </TableCell>

                  {/* ACTION BUTTONS */}
                  <TableCell className="space-x-2">
                    <Button
                      className="
                    border border-cyan-600 dark:bg-transparent bg-transparent
                    text-cyan-900 dark:text-cyan-400 
                    hover:bg-cyan-600 hover:text-neutral-100
                    dark:hover:bg-cyan-400 dark:hover:text-gray-900 transition-all duration-300
                  "
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
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700"
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

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4 text-gray-800 dark:text-gray-200">
            <Button onClick={handlePrev} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button onClick={handleNext} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* MODALS */}
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
