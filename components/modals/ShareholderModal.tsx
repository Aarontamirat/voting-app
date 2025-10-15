// Reusable Add/Edit Shareholder Modal - Shadcn + Tailwind + Next.js 15

'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface ShareholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'add' | 'edit';
  initialData?: any;
  onSuccess: () => void;
}

export default function ShareholderModal({ isOpen, onClose, mode, initialData, onSuccess }: ShareholderModalProps) {
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shareValue, setShareValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setShareValue(initialData.shareValue);
    } else {
      setId('');
      setName('');
      setPhone('');
      setAddress('');
      setShareValue('');
    }
  }, [mode, initialData, isOpen]);

  const handleSubmit = async () => {
    if (!id.trim() && mode === 'add') {
      toast.error('ID is required');
      return;
    }
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!shareValue.trim() || isNaN(Number(shareValue))) {
      toast.error('Valid Share Value is required');
      return;
    }

    setLoading(true);
    try {
      const url = mode === 'add' ? '/api/shareholders' : `/api/shareholders/${id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, phone, address, shareValue }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      toast.success(`Shareholder ${mode === 'add' ? 'added' : 'updated'} successfully!`);
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
          <DialogTitle>{mode === 'add' ? 'Add New Shareholder' : 'Edit Shareholder'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {mode === 'add' && (
            <div>
              <label className="block text-sm font-medium mb-1">ID</label>
              <Input value={id} onChange={e => setId(e.target.value)} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Share Value</label>
            <Input value={shareValue} onChange={e => setShareValue(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="mt-4 flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
