// NomineeModal.tsx - Add/Edit Nominees for a Meeting

'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface NomineeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meeting: any;
  onSuccess: () => void;
}

export default function NomineeModal({ isOpen, onClose, meeting, onSuccess }: NomineeModalProps) {
  const [nominees, setNominees] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
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
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return toast.error('Nominee name is required');
    setLoading(true);
    try {
      const res = await fetch(`/api/meetings/${meeting.id}/nominees`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, description: newDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add nominee');
      toast.success('Nominee added successfully');
      setNewName('');
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
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="space-y-2">
            {nominees.map(n => (
              <div key={n.id} className="border p-2 rounded flex justify-between items-center">
                <div>
                  <p className="font-medium">{n.name}</p>
                  <p className="text-sm text-gray-600">{n.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-2">
            <p className="font-medium">Add New Nominee</p>
            <Input placeholder="Name" value={newName} onChange={e => setNewName(e.target.value)} className="mt-1" />
            <Input placeholder="Description" value={newDescription} onChange={e => setNewDescription(e.target.value)} className="mt-1" />
            <Button className="mt-2" onClick={handleAdd} disabled={loading}>{loading ? 'Adding...' : 'Add Nominee'}</Button>
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
