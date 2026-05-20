import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, Users, Receipt, Phone, Mail, Loader2 } from 'lucide-react';
import api, { extractApiData, normalizeApiError } from '../services/api';

export const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('Not paid');
  const [paymentMethod, setPaymentMethod] = useState<string>('—');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        if (!id) return;
        setLoading(true);
        setError(null);

        const bookingEnvelope = await api.get(`/bookings/${id}`);
        const bookingData = extractApiData<any>(bookingEnvelope, null as any);
        setBooking(bookingData);

        const paymentsEnvelope = await api.get('/payments', {
          params: { booking: bookingData?._id, limit: 5 }
        });
        const paymentsData = extractApiData<{ payments: any[] }>(paymentsEnvelope, { payments: [] } as any);
        const firstPayment = paymentsData.payments?.[0];
        if (firstPayment) {
          setPaymentStatus(firstPayment.status || 'Completed');
          setPaymentMethod(firstPayment.method ? String(firstPayment.method) : '—');
        } else {
          setPaymentStatus('Not paid');
          setPaymentMethod('—');
        }
      } catch (e: any) {
        setError(normalizeApiError(e, 'Failed to load booking details'));
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const activity = useMemo(() => {
    if (!booking) return [];
    const activities: Array<{ date: string; action: string }> = [];
    const created = booking.createdAt ? new Date(booking.createdAt) : null;
    if (created) {
      activities.push({
        date: created.toLocaleDateString(),
        action: `Booking ${booking.status}`
      });
    }
    if (paymentStatus && paymentStatus !== 'Not paid') {
      activities.push({
        date: created ? created.toLocaleDateString() : new Date().toLocaleDateString(),
        action: `Payment ${paymentStatus}`
      });
    }
    return activities;
  }, [booking, paymentStatus]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="animate-pulse bg-gray-200/60 rounded-md h-8 w-48" />
          <div className="animate-pulse bg-gray-200/60 rounded-md h-4 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-3 bg-white p-8 rounded-[24px] shadow-sm border border-border flex flex-col items-center">
             <div className="animate-pulse bg-gray-200/60 rounded-full w-[100px] h-[100px] mb-4" />
             <div className="animate-pulse bg-gray-200/60 rounded-md h-5 w-32 mb-2" />
             <div className="animate-pulse bg-gray-200/60 rounded-md h-4 w-40 mb-3" />
             <div className="animate-pulse bg-gray-200/60 rounded-md h-4 w-32" />
          </div>
          <div className="lg:col-span-6 space-y-6">
             <div className="animate-pulse bg-gray-200/60 rounded-[24px] h-[90px] w-full" />
             <div className="animate-pulse bg-gray-200/60 rounded-[24px] h-[280px] w-full" />
          </div>
          <div className="lg:col-span-3 space-y-6">
             <div className="animate-pulse bg-gray-200/60 rounded-[24px] h-[240px] w-full" />
             <div className="animate-pulse bg-gray-200/60 rounded-[24px] h-[100px] w-full" />
             <div className="animate-pulse bg-gray-200/60 rounded-[24px] h-[160px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
          <p className="text-text-secondary">Booking not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Row */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[22px] font-bold text-text-primary">Booking Details</h2>
        <span className="text-text-secondary text-[13px]">
          Booking ID: <span className="font-bold text-text-primary">#{booking.bookingId || booking._id}</span>
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - User Profile */}
        <div className="lg:col-span-3 bg-white p-8 rounded-[24px] shadow-sm border border-border flex flex-col items-center">
          <img
            src={booking.user?.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(booking.user?.email || booking.user?.name || 'user')}`}
            alt={booking.user?.name || 'User'}
            className="w-[100px] h-[100px] rounded-full border-4 border-gray-50 mb-4 object-cover"
            onError={e => { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=11'; }}
          />
          <h3 className="font-bold text-lg mb-1">{booking.user?.name}</h3>
          <p className="text-primary text-[13px] font-medium mb-3 hover:underline cursor-pointer">{booking.user?.email}</p>
          <p className="text-text-secondary text-[13px] flex items-center gap-1.5">
             <Phone className="w-3.5 h-3.5" />
             {booking.user?.phoneNumber || '—'}
          </p>
        </div>

        {/* Center Column - Main Info */}
        <div className="lg:col-span-6 space-y-6">
          {/* Accommodation card */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
             <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Accommodation</p>
             <p className="font-bold text-[15px] flex items-center gap-2">
               <Building2 className="w-4 h-4 text-gray-400" />
              {booking.service?.name || '—'}
             </p>
          </div>

          {/* Booking Info Card */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
             <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <p className="font-bold text-[14px]">Booking Status:</p>
                <div className="bg-[#E1F7E3] text-[#1E7145] px-3 py-1 text-[11px] font-bold rounded flex items-center">{booking.status}</div>
             </div>

             <div className="grid grid-cols-2 gap-6 mb-6">
               <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Check-in:</p>
                  <p className="font-bold text-[13px]">
                    {booking.date ? new Date(booking.date).toLocaleString() : '—'}
                  </p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">Check-out:</p>
                  <p className="font-bold text-[13px]">—</p>
               </div>
             </div>
             
             <p className="font-extrabold text-[14px] mb-6">—</p>

             <div className="space-y-4">
               <div>
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                   <Users className="w-3 h-3" /> Guests
                 </p>
                  <p className="font-medium text-[13px]">—</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1 flex items-center gap-1">
                   <Receipt className="w-3 h-3" /> Special Requests:
                 </p>
                  <p className="font-medium text-[13px]">{booking.notes || '—'}</p>
               </div>
             </div>
          </div>
        </div>

        {/* Right Column - Summary & Activity */}
        <div className="lg:col-span-3 space-y-6">
          {/* Booking Summary */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
             <h3 className="font-bold text-[15px] mb-4">Booking Summary</h3>
             <div className="space-y-2.5 text-[13px]">
               <div className="flex justify-between text-text-secondary font-medium">
                 <span>Rental Rate:</span>
                 <span className="font-bold text-text-primary text-[12px]">
                   {booking.service?.basePrice ? `$${Number(booking.service.basePrice).toFixed(2)}` : '—'}
                 </span>
               </div>
               <div className="flex justify-between text-text-secondary font-medium"><span>Cleaning Fee:</span> <span className="font-bold text-text-primary text-[12px]">—</span></div>
               <div className="flex justify-between text-text-secondary font-medium"><span>Service Fee:</span> <span className="font-bold text-text-primary text-[12px]">—</span></div>
               <div className="flex justify-between text-text-secondary font-medium pb-2 border-b border-gray-100"><span>Taxes:</span> <span className="font-bold text-text-primary text-[12px]">—</span></div>
               <div className="flex justify-between text-text-secondary font-medium pt-1"><span>Discount:</span> <span className="font-bold text-[#DC2626] text-[12px]">—</span></div>
             </div>
             <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
               <span className="font-bold text-[15px]">Total Amount:</span>
              <span className="font-extrabold text-[18px]">
                {booking.totalAmount !== undefined ? `$${Number(booking.totalAmount).toFixed(2)}` : '—'}
              </span>
             </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
             <div className="flex justify-between items-center mb-2">
               <h3 className="font-bold text-[14px]">Payment Status:</h3>
              <div className="bg-[#E1F7E3] text-[#1E7145] px-3 py-1 text-[11px] font-bold rounded flex items-center">{paymentStatus}</div>
             </div>
            <p className="text-[10px] font-medium text-text-secondary">{paymentMethod}</p>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-6 rounded-[24px] shadow-sm border border-border">
             <h3 className="font-bold text-[14px] mb-4">Activity Log</h3>
             <div className="space-y-3">
              {activity.map((act, i) => (
                 <div key={i} className="flex gap-2 text-[10px]">
                  <span className="text-gray-400 font-medium whitespace-nowrap pt-[2px]">• {act.date}</span>
                   <span className="font-medium text-text-secondary leading-tight">{act.action}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

      {/* Bottom Tabs Section & Action Buttons */}
      <div className="mt-8 flex flex-col lg:flex-row gap-6">
         {/* Note Area */}
         <div className="flex-1">
            <div className="flex gap-4 mb-4 px-2">
               <button className="bg-[#EAF3FA] text-primary font-bold text-[13px] px-4 py-1.5 rounded-md">Notes</button>
               <button className="text-text-secondary font-bold text-[13px] px-4 py-1.5 rounded-md hover:bg-gray-50">Invoices</button>
            </div>
            <div className="bg-white rounded-[24px] border border-border shadow-sm p-4 min-h-[160px] flex flex-col justify-end">
               <div className="flex justify-end">
                  <button className="bg-primary text-white font-bold text-[13px] px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors shadow-sm">Add Note</button>
               </div>
            </div>
         </div>

         {/* Right Bottom Actions */}
         <div className="flex items-end justify-end gap-3 pb-2 pt-16">
            <button
              onClick={() => navigate(`/bookings/assign/${booking._id}`)}
              className="bg-[#1496A3] text-white font-bold text-[14px] px-6 py-2.5 rounded-[10px] hover:bg-primary-dark transition-colors shadow-sm"
            >
              Assign Worker
            </button>
            <button className="bg-white border border-border text-text-primary font-bold text-[14px] flex items-center gap-2 px-5 py-2.5 rounded-[10px] hover:bg-gray-50 transition-colors shadow-sm">
               <Mail className="w-4 h-4" /> Send Message
            </button>
            <button
              disabled={cancelling || booking.status === 'Cancelled'}
              onClick={async () => {
                if (!confirm('Cancel this booking?')) return;
                try {
                  setCancelling(true);
                  await api.patch(`/bookings/${booking._id}/status`, { status: 'Cancelled' });
                  setBooking((prev: any) => ({ ...prev, status: 'Cancelled' }));
                } catch (e: any) {
                  alert(normalizeApiError(e, 'Failed to cancel booking'));
                } finally {
                  setCancelling(false);
                }
              }}
              className="bg-[#EF4444] text-white font-bold text-[14px] flex items-center gap-2 px-5 py-2.5 rounded-[10px] hover:bg-red-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
               <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
               {cancelling ? 'Cancelling…' : booking.status === 'Cancelled' ? 'Cancelled' : 'Cancel Booking'}
            </button>
         </div>
      </div>
    </div>
  );
};
