
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MeetingModal from '@/components/modals/MeetingModal';
import AttendanceModal from '@/components/modals/AttendanceModal';
import NomineeModal from '@/components/modals/NomineeModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [take] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  const [isAttendanceOpen, setIsAttendanceOpen] = useState(false);
  const [attendanceMeeting, setAttendanceMeeting] = useState<any>(null);

  const [isNomineeOpen, setIsNomineeOpen] = useState(false);
  const [nomineeMeeting, setNomineeMeeting] = useState<any>(null);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q, status: statusFilter, page: page.toString(), take: take.toString() });
      const res = await fetch(`/api/meetings?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch meetings');
      setMeetings(data.items || []);
      setTotalPages(Math.ceil((data.total || 0) / take));
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete meeting');
      toast.success('Meeting deleted successfully');
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    }
  };

  useEffect(() => { fetchMeetings(); }, [q, statusFilter, page]);

  const handlePrev = () => setPage(p => Math.max(1, p - 1));
  const handleNext = () => setPage(p => Math.min(totalPages, p + 1));

  const handleOpenMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/open`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to open meeting');
      toast.success('Meeting opened successfully');
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    }
  };

  const handleCloseMeeting = async (meetingId: string) => {
    try {
      const res = await fetch(`/api/meetings/${meetingId}/close`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to close meeting');
      toast.success('Meeting closed successfully');
      fetchMeetings();
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-6">
      <Card className="shadow-md border border-gray-200">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold">Meetings Management</CardTitle>
          <Button onClick={() => { setModalMode('add'); setSelectedMeeting(null); setIsMeetingModalOpen(true); }}>Add New Meeting</Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input placeholder="Search by title" id='searcher' value={q} onChange={e => setQ(e.target.value)} />
            <select className="border rounded p-1" id='statusFilterer' value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="DRAFT">DRAFT</option>
              <option value="OPEN">Open</option>
              <option value="VOTINGOPEN">Voting Open</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Quorum</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableRow><TableCell colSpan={7} className="h-24 text-center">Loading...</TableCell></TableRow>}
              {meetings.length === 0 && <TableRow><TableCell colSpan={7} className="h-24 text-center text-red-700">No meetings found.</TableCell></TableRow>}
              {meetings.map(m => (
                <TableRow key={m.id} className="hover:bg-gray-50">
                  <TableCell>{m.id}</TableCell>
                  <TableCell>{m.title}</TableCell>
                  <TableCell>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(m.date))}</TableCell>
                  <TableCell>{m.location}</TableCell>
                  <TableCell>{m.quorum}</TableCell>
                  <TableCell>{m.status}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm">Actions</Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => { setModalMode('edit'); setSelectedMeeting(m); setIsMeetingModalOpen(true); }}>Edit</DropdownMenuItem>
                        {m.status === 'DRAFT' && <DropdownMenuItem onClick={() => handleOpenMeeting(m.id)}>Open</DropdownMenuItem>}
                        {(m.status === 'OPEN' || m.status === 'VOTINGOPEN') && <DropdownMenuItem onClick={() => handleCloseMeeting(m.id)}>Close</DropdownMenuItem>}
                        {(m.status === 'OPEN' || m.status === 'VOTINGOPEN') && <DropdownMenuItem onClick={() => { setAttendanceMeeting(m); setIsAttendanceOpen(true); }}>Attendance</DropdownMenuItem>}
                        {(m.status === 'OPEN' || m.status === 'VOTINGOPEN') && <DropdownMenuItem onClick={() => window.location.href = `/meetings/${m.id}/attendance/live`}>Live Attendance</DropdownMenuItem>}
                        {m.status === 'VOTINGOPEN' && <DropdownMenuItem onClick={() => { setNomineeMeeting(m); setIsNomineeOpen(true); }}>Nominees</DropdownMenuItem>}
                        {m.status === 'VOTINGOPEN' && <DropdownMenuItem onClick={() => window.location.href = `/meetings/${m.id}/voting-cards`}>Voting Cards</DropdownMenuItem>}
                        {m.status === 'VOTINGOPEN' && <DropdownMenuItem onClick={() => window.location.href = `/meetings/${m.id}/vote`}>Voting</DropdownMenuItem>}
                        {(m.status === 'VOTINGOPEN' || m.status === 'CLOSED') && (<DropdownMenuItem onClick={() => window.location.href = `/meetings/${m.id}/live`}>Live Results</DropdownMenuItem>)}
                        {m.status === 'DRAFT' && <DropdownMenuItem onClick={() => handleDeleteMeeting(m.id)} className='text-red-400'>DELETE</DropdownMenuItem>}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center mt-4">
            <Button onClick={handlePrev} disabled={page === 1}>Previous</Button>
            <span>Page {page} of {totalPages}</span>
            <Button onClick={handleNext} disabled={page >= totalPages}>Next</Button>
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