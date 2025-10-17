'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareholder: any; // { id, name }
  onSuccess: () => void;
}

export default function ShareholderDeleteModal({ isOpen, onClose, shareholder, onSuccess }: DeleteModalProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!shareholder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/shareholders/${shareholder.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete');
      toast.success('Shareholder deleted successfully!');
      onClose();
      onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Shareholder</DialogTitle>
        </DialogHeader>

        <p className="mt-2 text-sm text-gray-600">
          Are you sure you want to delete <strong>{shareholder?.name}</strong>?
        </p>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={loading}>
            {loading ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
