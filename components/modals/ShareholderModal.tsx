
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
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
  const [nameAm, setNameAm] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [shareValue, setShareValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setId(initialData.id);
      setName(initialData.name);
      setNameAm(initialData.nameAm);
      setPhone(initialData.phone || '');
      setAddress(initialData.address || '');
      setShareValue(initialData.shareValue);
    } else {
      setId('');
      setName('');
      setNameAm('');
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
    if (!nameAm.trim()) {
      toast.error('Amharic Name is required');
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
        body: JSON.stringify({ id, name, nameAm, phone, address, shareValue }),
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
          <DialogDescription>{mode === 'add' ? 'Add a new shareholder' : 'Edit existing shareholder'}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {mode === 'add' && (
            <div>
              <label htmlFor='id' className="block text-sm font-medium mb-1">ID</label>
              <Input id='id' value={id} onChange={e => setId(e.target.value)} />
            </div>
          )}

          <div>
            <label htmlFor='name' className="block text-sm font-medium mb-1">Name</label>
            <Input id='name' value={name} onChange={e => setName(e.target.value)} autoComplete='true' />
          </div>

          <div>
            <label htmlFor='nameam' className="block text-sm font-medium mb-1">Amharic Name</label>
            <Input id='nameam' value={nameAm} onChange={e => setNameAm(e.target.value)} />
          </div>

          <div>
            <label htmlFor='phone' className="block text-sm font-medium mb-1">Phone</label>
            <Input id='phone' value={phone} onChange={e => setPhone(e.target.value)}  autoComplete='true' />
          </div>

          <div>
            <label htmlFor='address' className="block text-sm font-medium mb-1">Address</label>
            <Input id='address' value={address} onChange={e => setAddress(e.target.value)}  autoComplete='true' />
          </div>

          <div>
            <label htmlFor='sharevalue' className="block text-sm font-medium mb-1">Share Value</label>
            <Input id='sharevalue' value={shareValue} onChange={e => setShareValue(e.target.value)} />
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
