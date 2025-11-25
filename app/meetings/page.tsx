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
import MeetingModal from "@/components/modals/MeetingModal";
import AttendanceModal from "@/components/modals/AttendanceModal";
import NomineeModal from "@/components/modals/NomineeModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LoaderRotatingLines from "@/components/general/LoaderRotatingLines";

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [take] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState<any>(null);

  const [isNomineeOpen, setIsNomineeOpen] = useState(false);
  const [nomineeMeeting, setNomineeMeeting] = useState<any>(null);

  const fetchMeetings = async () => {
    setFetching(true);
    try {
      const params = new URLSearchParams({
        q,
        status: statusFilter,
        page: page.toString(),
        take: take.toString(),
      });
      const res = await fetch(`/api/meetings?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch meetings");
      setMeetings(data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / take));
      setFetching(false);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
      setFetching(false);
    } finally {
      setFetching(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete meeting");
      toast.success("Meeting deleted successfully");
      fetchMeetings();
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [q, statusFilter, page]);

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));

  const handleOpenMeeting = async (meetingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/open`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open meeting");
      toast.success("Meeting opened successfully");
      fetchMeetings();
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
      setLoading(false);
    }
  };

  const handleCloseMeeting = async (meetingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/close`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to close meeting");
      toast.success("Meeting closed successfully");
      fetchMeetings();
      setLoading(false);
    } catch (err: any) {
      toast.error(err.message || "Unknown error");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      <Card className="shadow-md border-none bg-gradient-to-br from-gray-600 via-gray-700 to-gray-600 text-gray-100">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl text-blue-300 font-semibold">
            Meetings Management
          </CardTitle>
          <Button
            onClick={() => {
              setModalMode("add");
              setSelectedMeeting(null);
              setIsMeetingModalOpen(true);
            }}
            className="bg-green-700 hover:bg-green-800"
          >
            Add New Meeting
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Search by title"
              id="searcher"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="max-w-sm"
            />
            <select
              className="border rounded p-1 bg-gray-700"
              id="statusFilterer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">Open</option>
              <option value="VOTINGOPEN">Voting Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-800 hover:bg-gray-700">
                <TableHead className="text-gray-200 font-bold">ID</TableHead>
                <TableHead className="text-gray-200 font-bold">Title</TableHead>
                <TableHead className="text-gray-200 font-bold">Date</TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Location
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Quorum
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Status
                </TableHead>
                <TableHead className="text-gray-200 font-bold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fetching && (
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
              {meetings.length === 0 && !loading && (
                <TableRow className="bg-gray-800 hover:bg-gray-700">
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-base text-red-900"
                  >
                    No meetings found.
                  </TableCell>
                </TableRow>
              )}
              {meetings.map((m) => (
                <TableRow key={m.id} className="bg-gray-800 hover:bg-gray-700">
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(m.date))}
                  </TableCell>
                  <TableCell>{m.location}</TableCell>
                  <TableCell>{m.quorum}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className={`hover:cursor-pointer bg-transparent border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-gray-900 ${
                            loading ? "pointer-events-none" : ""
                          }`}
                        >
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="backdrop-blur-sm bg-transparent border-cyan-400 text-neutral-50">
                        {/* Edit */}
                        <DropdownMenuItem
                          onClick={() => {
                            setModalMode("edit");
                            setSelectedMeeting(m);
                            setIsMeetingModalOpen(true);
                          }}
                          className="md:rounded-none border-b border-cyan-400"
                        >
                          Edit
                        </DropdownMenuItem>

                        {/* Open */}
                        {m.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleOpenMeeting(m.id)}
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Open
                          </DropdownMenuItem>
                        )}

                        {/* Close */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() => handleCloseMeeting(m.id)}
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Close
                          </DropdownMenuItem>
                        )}

                        {/* Attendance */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() => {
                              setAttendanceMeeting(m);
                              setIsAttendanceOpen(true);
                            }}
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Attendance
                          </DropdownMenuItem>
                        )}

                        {/* Live Attendance */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/attendance/live`)
                            }
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Live Attendance
                          </DropdownMenuItem>
                        )}

                        {/* Nominees */}
                        {m.status === "VOTINGOPEN" && (
                          <DropdownMenuItem
                            onClick={() => {
                              setNomineeMeeting(m);
                              setIsNomineeOpen(true);
                            }}
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Nominees
                          </DropdownMenuItem>
                        )}

                        {/* Voting Cards */}
                        {m.status === "VOTINGOPEN" && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/voting-cards`)
                            }
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Voting Cards
                          </DropdownMenuItem>
                        )}

                        {/* Voting */}
                        {m.status === "VOTINGOPEN" && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/vote`)
                            }
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Voting
                          </DropdownMenuItem>
                        )}

                        {/* Live Results */}
                        {(m.status === "VOTINGOPEN" ||
                          m.status === "CLOSED") && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/live`)
                            }
                            className="md:rounded-none border-b border-cyan-400"
                          >
                            Live Results
                          </DropdownMenuItem>
                        )}

                        {/* Delete */}
                        {m.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteMeeting(m.id)}
                            className="text-red-400 md:rounded-none border-b border-cyan-400"
                          >
                            DELETE
                          </DropdownMenuItem>
                        )}

                        {/* Reports */}
                        {m.status !== "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/reports`)
                            }
                          >
                            Reports
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={handlePrev} disabled={page === 1}>
              Previous
            </Button>
            <span>
              Page {page} of {totalPages}
            </span>
            <Button onClick={handleNext} disabled={page >= totalPages}>
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <MeetingModal
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        mode={modalMode}
        initialData={selectedMeeting}
        onSuccess={fetchMeetings}
      />

      <AttendanceModal
        isOpen={isAttendanceOpen}
        onClose={() => setIsAttendanceOpen(false)}
        meeting={attendanceMeeting}
        onSuccess={fetchMeetings}
      />

      <NomineeModal
        isOpen={isNomineeOpen}
        onClose={() => setIsNomineeOpen(false)}
        meeting={nomineeMeeting}
        onSuccess={fetchMeetings}
      />
    </div>
  );
}
