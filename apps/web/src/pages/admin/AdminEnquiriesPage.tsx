import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api.js';
import { Button } from '../../components/ui/Button.js';
import { Badge } from '../../components/ui/Badge.js';
import { Skeleton } from '../../components/ui/Skeleton.js';
import { EnquiryStatus } from '@deutschwelt/shared';
import { Mail, Phone, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

export function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/admin/enquiries');
      if (res.success) {
        setEnquiries(res.enquiries);
      }
    } catch (e) {
      console.error('Error fetching enquiries:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleUpdateStatus = async (id: string, status: EnquiryStatus) => {
    try {
      await api.patch(`/admin/enquiries/${id}`, { status });
      fetchEnquiries();
    } catch (e) {
      console.error('Error updating enquiry status:', e);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-navy tracking-tight">Admissions Enquiries</h1>
        <p className="text-xs text-dark-muted">Prospective student inquiries submitted through the public website.</p>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : enquiries.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-gray-200">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-navy">No contact enquiries received yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map(enq => (
            <div key={enq.id} className="p-6 rounded-3xl bg-white border border-gray-200 shadow-subtle space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-base text-navy">{enq.name}</span>
                    <Badge variant="outline" className="text-[10px]">Target: {enq.level}</Badge>
                    <Badge variant={enq.status === 'NEW' ? 'germanRed' : enq.status === 'CONTACTED' ? 'warning' : 'success'} className="text-[10px]">
                      {enq.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-dark-muted flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {enq.email}</span>
                    {enq.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {enq.phone}</span>}
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(enq.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                {/* Status Switcher */}
                <div className="flex items-center gap-2">
                  <select
                    value={enq.status}
                    onChange={(e) => handleUpdateStatus(enq.id, e.target.value as any)}
                    className="h-9 px-3 rounded-xl border border-gray-300 bg-white text-xs font-semibold text-dark focus:outline-none focus:ring-2 focus:ring-navy"
                  >
                    <option value={EnquiryStatus.NEW}>Mark as New</option>
                    <option value={EnquiryStatus.CONTACTED}>Mark as Contacted</option>
                    <option value={EnquiryStatus.RESOLVED}>Mark as Resolved</option>
                    <option value={EnquiryStatus.CLOSED}>Mark as Closed</option>
                  </select>
                </div>
              </div>

              {/* Message text */}
              <div className="p-4 rounded-xl bg-ivory/50 border border-gray-200 text-xs text-dark leading-relaxed whitespace-pre-line">
                {enq.message}
              </div>

              {enq.adminNotes && (
                <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                  <span className="font-bold">Staff Note: </span>{enq.adminNotes}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
