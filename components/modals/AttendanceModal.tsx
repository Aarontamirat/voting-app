'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';

interface MeetingShort { id: string; title: string; quorumPct?: number; status?: string; }

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: MeetingShort | null;
  onSuccess: () => void;
}

export default function AttendanceModal({ isOpen, onClose, meeting, onSuccess }: AttendanceModalProps) {
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [representatives, setRepresentatives] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [repType, setRepType] = useState<'none' | 'existing' | 'shareholder' | 'new'>('none');
  const [existingRepId, setExistingRepId] = useState('');
  const [repShareholderId, setRepShareholderId] = useState('');
  const [newRepName, setNewRepName] = useState('');
  const [newRepId, setNewRepId] = useState('');
  const [loading, setLoading] = useState(false);
  const [quorumInfo, setQuorumInfo] = useState<any>(null);

  useEffect(() => {
    if (!meeting || !isOpen) return;
    fetchData();
  }, [meeting, isOpen]);

  const fetchData = async () => {
    try {
      const resSh = await fetch('/api/shareholders?take=1000');
      const shData = await resSh.json();
      if (!resSh.ok) throw new Error(shData.error || 'Failed to load shareholders');
      setShareholders(shData.items ?? []);

      const resRep = await fetch('/api/representatives');
      if (resRep.ok) {
        const repData = await resRep.json();
        setRepresentatives(repData.items ?? []);
      } else setRepresentatives([]);

      const resAtt = await fetch(`/api/meetings/${meeting?.id}/attendance`);
      const attData = await resAtt.json();
      if (!resAtt.ok) throw new Error(attData.error || 'Failed to load attendance');

      setAttendance(attData.attendance ?? []);
      setQuorumInfo({
        totalShares: attData.totalShares,
        attendedShares: attData.attendedShares,
        quorumPct: attData.quorumPct,
        quorumMet: attData.quorumMet,
      });

      setSelectedIds([]);
      setExistingRepId('');
      setRepShareholderId('');
      setNewRepName('');
      setNewRepId('');
      setRepType('none');
    } catch (err: any) {
      toast.error([err.message || 'Error loading attendance data']);
    }
  };

  const toggleSelected = (id: string) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handleAdd = async () => {
    if (!meeting) return;
    if (selectedIds.length === 0) {
      toast.error(['Select at least one shareholder']);
      return;
    }

    setLoading(true);

    try {
      const payload: any = { shareholderIds: selectedIds };

      if (repType === 'existing') {
        if (!existingRepId) return toast.error(['Select existing representative']);
        payload.representativeId = existingRepId;
      } else if (repType === 'shareholder') {
        if (!repShareholderId) return toast.error(['Select representative shareholder']);
        payload.representativeShareholderId = repShareholderId;
      } else if (repType === 'new') {
        if (!newRepName.trim()) return toast.error(['Enter representative name']);
        if (!newRepId.trim()) return toast.error(['Enter representative ID']);
        payload.representativeName = newRepName.trim();
        payload.representativeId = newRepId.trim(); // new field
      }

      const res = await fetch(`/api/meetings/${meeting.id}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add attendance');

      toast.success('Attendance recorded');
      await fetchData();
      onSuccess();
    } catch (err: any) {
      toast.error([err.message || 'Error saving attendance']);
    } finally {
      setLoading(false);
    }
  };

  if (!meeting) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Attendance — {meeting.title}</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-1 space-y-4">

          {quorumInfo && (
            <div className="p-3 bg-gray-50 rounded text-sm">
              <div><strong>Total shares:</strong> {quorumInfo.totalShares}</div>
              <div><strong>Attended shares:</strong> {quorumInfo.attendedShares}</div>
              <div><strong>Quorum:</strong> {quorumInfo.quorumPct}%</div>
              <div><strong>Status:</strong> {quorumInfo.quorumMet ? 'Met ✅' : 'Not met ❌'}</div>
            </div>
          )}

          {/* Shareholders */}
          <div>
            <div className="text-sm font-medium mb-1">Select Shareholders</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto border rounded p-2">
              {shareholders.map(s => (
                <label key={s.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                  <Checkbox checked={selectedIds.includes(s.id)} onCheckedChange={() => toggleSelected(s.id)} />
                  <div className="text-sm">
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-gray-500">{s.id} — {s.shareValue} shares</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Representative */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {['none', 'existing', 'shareholder', 'new'].map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input type="radio" checked={repType === type} onChange={() => setRepType(type as any)} />
                  <span className="text-sm capitalize">
                    {type === 'none'
                      ? 'No representative (attend directly)'
                      : type === 'existing'
                      ? 'Existing Representative'
                      : type === 'shareholder'
                      ? 'Shareholder acting as Representative'
                      : 'New / External Representative'}
                  </span>
                </label>
              ))}
            </div>

            {repType === 'existing' && (
              <select
                value={existingRepId}
                onChange={(e) => setExistingRepId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Select representative</option>
                {representatives.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}{r.shareholderId ? ` (shareholder ${r.shareholderId})` : ''}
                  </option>
                ))}
              </select>
            )}

            {repType === 'shareholder' && (
              <select
                value={repShareholderId}
                onChange={(e) => setRepShareholderId(e.target.value)}
                className="w-full border p-2 rounded"
              >
                <option value="">Select shareholder representative</option>
                {shareholders.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                ))}
              </select>
            )}

            {repType === 'new' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="Representative full name"
                  value={newRepName}
                  onChange={(e) => setNewRepName(e.target.value)}
                />
                <Input
                  placeholder="Representative ID"
                  value={newRepId}
                  onChange={(e) => setNewRepId(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Existing Attendees */}
          <div>
            <div className="text-sm font-medium mb-1">Existing Attendees</div>
            <div className="max-h-48 overflow-y-auto border rounded p-2">
              {attendance.length === 0 ? (
                <div className="text-sm text-gray-500">No attendees yet.</div>
              ) : (
                <ul className="space-y-1 text-sm">
                  {attendance.map(a => (
                    <li key={a.id} className="flex justify-between">
                      <div>{a.shareholderName} ({a.shareValue})</div>
                      <div className="text-gray-500">{a.representedByName ?? '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t flex-shrink-0 bg-white">
          <Button variant="outline" onClick={onClose} disabled={loading}>Close</Button>
          <Button onClick={handleAdd} disabled={loading}>{loading ? 'Saving...' : 'Add Attendance'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
