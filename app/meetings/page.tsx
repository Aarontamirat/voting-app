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

  // menuListStyles
  const meetingMenuStyle = "md:rounded-none border-b border-cyan-400";

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

  const handleVotingOpenMeeting = async (meetingId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meetingId}/votingopen`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open voting");
      toast.success("Voting opened successfully");
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
    <div className="max-w-7xl mx-auto p-2 py-10 space-y-6">
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
            Meetings Management
          </CardTitle>

          {/* ACTION BUTTON */}
          <Button
            onClick={() => {
              setModalMode("add");
              setSelectedMeeting(null);
              setIsMeetingModalOpen(true);
            }}
            className="
        bg-cyan-600 hover:bg-cyan-700 
        text-white shadow-md
      "
          >
            Add New Meeting
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* SEARCH + FILTER */}
          <div className="flex items-center flex-wrap md:flex-nowrap gap-2">
            <Input
              placeholder="Search by title"
              id="searcher"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="
          max-w-sm 
          bg-white/60 dark:bg-gray-700 
          border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-gray-200
        "
            />

            <select
              className="
          max-w-xs p-2 rounded 
          bg-white/60 dark:bg-gray-700 
          border border-gray-300 dark:border-gray-600
          text-gray-800 dark:text-gray-200
        "
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
                  Title
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Date
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Location
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Quorum
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Status
                </TableHead>
                <TableHead className="text-gray-700 dark:text-gray-200 font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {fetching && (
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

              {meetings.length === 0 &&
                loading === false &&
                fetching === false && (
                  <TableRow className="bg-white/40 dark:bg-gray-800/40 backdrop-blur">
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-base text-red-600 dark:text-red-400"
                    >
                      No meetings found.
                    </TableCell>
                  </TableRow>
                )}

              {meetings.map((m) => (
                <TableRow
                  key={m.id}
                  className="
              bg-white/50 dark:bg-gray-800/50 
              border-b border-gray-200 dark:border-gray-700
              hover:bg-cyan-50 dark:hover:bg-gray-700/40
              transition
            "
                >
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {m.id}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {m.title}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {new Intl.DateTimeFormat("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(m.date))}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {m.location}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {m.quorum}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-200">
                    {m.status}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="
                      bg-transparent 
                      border border-cyan-600 
                      text-cyan-900 dark:text-cyan-400
                      hover:bg-cyan-600 hover:text-neutral-100
                      dark:hover:bg-cyan-400 dark:hover:text-gray-900
                      transition-all duration-300
                    "
                        >
                          Actions
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent
                        className="
                    backdrop-blur-md
                    bg-white/70 dark:bg-gray-800/50 
                    border border-cyan-400
                    text-gray-800 dark:text-gray-200
                  "
                      >
                        {/* Edit */}
                        <DropdownMenuItem
                          onClick={() => {
                            setModalMode("edit");
                            setSelectedMeeting(m);
                            setIsMeetingModalOpen(true);
                          }}
                          className={meetingMenuStyle}
                        >
                          Edit Meeting
                        </DropdownMenuItem>

                        {/* Open */}
                        {m.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleOpenMeeting(m.id)}
                            className={meetingMenuStyle}
                          >
                            Open This Meeting
                          </DropdownMenuItem>
                        )}

                        {/* VotingOpen */}
                        {m.status === "OPEN" && (
                          <DropdownMenuItem
                            onClick={() => handleVotingOpenMeeting(m.id)}
                            className={meetingMenuStyle}
                          >
                            Open Voting for This Meeting
                          </DropdownMenuItem>
                        )}

                        {/* Close */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() => handleCloseMeeting(m.id)}
                            className={meetingMenuStyle}
                          >
                            Close This Meeting
                          </DropdownMenuItem>
                        )}

                        {/* Attendance */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() => {
                              setAttendanceMeeting(m);
                              setIsAttendanceOpen(true);
                            }}
                            className={meetingMenuStyle}
                          >
                            Add, Edit, Delete Attendance
                          </DropdownMenuItem>
                        )}

                        {/* Live Attendance */}
                        {(m.status === "OPEN" || m.status === "VOTINGOPEN") && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/attendance/live`)
                            }
                            className={meetingMenuStyle}
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
                            className={meetingMenuStyle}
                          >
                            Add, Edit, Delete Nominees
                          </DropdownMenuItem>
                        )}

                        {/* Voting Cards */}
                        {m.status === "VOTINGOPEN" && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/voting-cards`)
                            }
                            className={meetingMenuStyle}
                          >
                            Printable Voting Cards
                          </DropdownMenuItem>
                        )}

                        {/* Voting */}
                        {m.status === "VOTINGOPEN" && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/vote`)
                            }
                            className={meetingMenuStyle}
                          >
                            Vote
                          </DropdownMenuItem>
                        )}

                        {/* Live Results */}
                        {(m.status === "VOTINGOPEN" ||
                          m.status === "CLOSED") && (
                          <DropdownMenuItem
                            onClick={() =>
                              (window.location.href = `/meetings/${m.id}/live`)
                            }
                            className={meetingMenuStyle}
                          >
                            Live Voting Results
                          </DropdownMenuItem>
                        )}

                        {/* Delete */}
                        {m.status === "DRAFT" && (
                          <DropdownMenuItem
                            onClick={() => handleDeleteMeeting(m.id)}
                            className={`text-red-400 ${meetingMenuStyle}`}
                          >
                            DELETE THIS MEETING
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

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4 text-gray-800 dark:text-gray-200">
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
