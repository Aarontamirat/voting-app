'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface NomineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  onSuccess: () => void;
}

export default function NomineeModal({ isOpen, onClose, meeting, onSuccess }: NomineeModalProps) {
  const [nominees, setNominees] = useState<any[]>([]);
  const [shareholders, setShareholders] = useState<any[]>([]);
  const [selectedShareholder, setSelectedShareholder] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!meeting) return;
    fetchNominees();
  }, [meeting]);

  const fetchNominees = async () => {
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/nominees`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch nominees');
      setNominees(data.items || []);
      setShareholders(data.shareholders || []);
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    }
  };

  const handleAdd = async () => {
    if (!selectedShareholder) return toast.error('Please select a shareholder as nominee');
    setLoading(true);
    try {
      const shareholder = shareholders.find(s => s.id === selectedShareholder);
      if (!shareholder) throw new Error('Invalid shareholder selected');

      const res = await fetch(`/api/meetings/${meeting.id}/nominees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareholderId: shareholder.id,
          name: shareholder.name,
          nameAm: shareholder.nameAm,
          description: newDescription || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add nominee');

      toast.success('Nominee added successfully');
      setSelectedShareholder('');
      setNewDescription('');
      fetchNominees();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="DialogContent max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nominees - {meeting?.title}</DialogTitle>
          <DialogDescription>Manage nominees here</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Existing nominees list */}
          <div className="space-y-2">
            {nominees.length === 0 && (
              <p className="text-sm text-gray-500 italic">No nominees yet</p>
            )}
            {nominees.map(n => (
              <div key={n.id} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{n.name}</p>
                  <p className="text-sm text-gray-600">{n.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Add new nominee section */}
          <div className="border-t pt-2">
            <p className="font-medium mb-1">Add New Nominee</p>

            <Select
              value={selectedShareholder}
              onValueChange={setSelectedShareholder}
            >
              <SelectTrigger className="w-full mt-1">
                <SelectValue placeholder="Select Shareholder" />
              </SelectTrigger>
              <SelectContent className="">
                {shareholders.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="whitespace-nowrap">
                    {s.name} ({s.nameAm} {Number(s.shareValue)} shares)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Description (optional)"
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="mt-2"
            />

            <Button className="mt-2" onClick={handleAdd} disabled={loading}>
              {loading ? 'Adding...' : 'Add Nominee'}
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
