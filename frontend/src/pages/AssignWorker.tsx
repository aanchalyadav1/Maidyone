import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Search, CheckCircle2, Wrench, Loader2 } from 'lucide-react';
import api, { extractApiData, normalizeApiError } from '../services/api';

export const AssignWorker = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [workers, setWorkers] = useState<any[]>([]);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);

  const bookingDateLabel = useMemo(() => {
    if (!booking?.date) return '—';
    try {
      return new Date(booking.date).toLocaleDateString();
    } catch {
      return '—';
    }
  }, [booking]);

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const bookingEnvelope = await api.get(`/bookings/${id}`);
        const bookingData = extractApiData<any>(bookingEnvelope, null);
        setBooking(bookingData);

        const serviceId = bookingData?.service?._id;
        const workersEnvelope = await api.get('/workers', {
          params: serviceId ? { skill: serviceId, limit: 50 } : { limit: 50 }
        });
        const workersData = extractApiData<{ workers: any[] }>(workersEnvelope, { workers: [] } as any);
        setWorkers(workersData.workers ?? []);
      } catch (e: any) {
        setError(normalizeApiError(e, 'Failed to load booking/workers'));
        setWorkers([]);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [id]);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {loading && (
        <div className="bg-white border border-border rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center gap-3 text-text-secondary">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading booking and workers…
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-white border border-border rounded-[24px] p-6 shadow-sm">
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      )}

      {!loading && booking && (
      <>
      <div className="flex flex-col mb-4">
        <h2 className="text-[22px] font-bold text-[#111827]">Assign Work</h2>
        <span className="text-gray-500 text-[13px]">Assign worker to the selected booking</span>
      </div>

      <div className="flex gap-6 h-[720px]">
        {/* Column 1: Booking Details */}
        <div className="w-[30%] bg-[#E8F8F5] rounded-[24px] p-6 flex flex-col gap-4 shadow-sm border border-border/50">
          <h3 className="font-bold text-[16px] text-gray-800">Booking Details</h3>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border/30">
            <h4 className="font-bold text-[15px] mb-1">{booking.address || '—'}</h4>
            <div className="flex items-center text-gray-500 text-[12px] gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> {bookingDateLabel}
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-border/30">
            <h4 className="font-bold text-[14px] mb-3">Booking Details</h4>
            <div className="space-y-2 text-[13px]">
              <div className="flex justify-between text-gray-600"><span>Service</span> <span className="font-bold text-gray-800">{booking.service?.name || '—'}</span></div>
              <div className="flex justify-between text-gray-600"><span>Total Amount</span> <span className="font-bold text-gray-800">₹{Number(booking.totalAmount || 0).toLocaleString()}</span></div>
              <div className="flex justify-between text-gray-600"><span>Status</span> <span className="font-bold text-gray-800">{booking.status || 'Pending'}</span></div>
              <div className="flex justify-between text-gray-800 pt-2 mt-2 border-t border-gray-100">
                <span className="font-bold text-[14px]">Assigning To</span> <span className="font-bold text-[14px]">{selectedWorkerId ? 'Selected' : '—'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm border border-border/30 flex items-center gap-2">
            <MapPin className="text-[#0EA5A4] w-4 h-4" />
            <div className="flex flex-col">
              <span className="text-[#0EA5A4] font-bold text-[13px]">Location:</span>
              <span className="text-gray-700 text-[13px] font-medium">{booking.address || '—'}</span>
            </div>
          </div>
          
          <div className="relative rounded-xl overflow-hidden h-[120px] mt-auto shadow-sm">
            {/* Mock map image */}
            <div className="absolute inset-0 bg-[#0EA5A4] opacity-80 z-10 flex items-center justify-center text-white text-[13px] font-medium">
              <MapPin className="w-4 h-4 mr-1"/> {booking.address || 'Location'}
            </div>
            <img src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80" className="w-full h-full object-cover grayscale" alt="Map" />
          </div>
        </div>

        {/* Column 2: Assign Worker */}
        <div className="w-[40%] bg-[#F8FAFC] rounded-[24px] p-6 shadow-sm border border-[#E5E7EB] flex flex-col">
          <h3 className="font-bold text-[16px] text-gray-800 mb-4">Assign Worker</h3>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search worker..." className="w-full pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-[13px] outline-none focus:border-primary shadow-sm" />
          </div>
          
          <div className="mb-3 text-[11px] font-bold bg-[#EAF7F3] text-[#2E7D32] px-3 py-1 rounded inline-block w-max">
            {workers.length} Workers Available
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
            {workers.map((w) => (
              <div
                key={w._id}
                className="bg-white rounded-[16px] p-3 flex items-center justify-between shadow-sm border border-border hover:border-primary/50 transition duration-200"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-[48px] h-[48px]">
                    <img
                      src={w.user?.avatar || `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 60) + 1}`}
                      className="w-full h-full rounded-full border-2 border-white shadow-sm"
                      alt="Worker"
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-[1.5px] border-white"></div>
                  </div>
                  <div className="leading-tight">
                    <h4 className="font-bold text-[14px] text-gray-800">{w.user?.name || 'Worker'}</h4>
                    <p className="text-[12px] text-gray-500">
                      Rating: {Number(w.rating || 0).toFixed(1)}
                    </p>
                    <p className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5" /> {w.isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedWorkerId(w._id)}
                  className={`font-bold text-[12px] px-5 py-1.5 rounded-lg transition shadow-sm ${selectedWorkerId === w._id ? 'bg-[#1496A3] text-white border border-[#1496A3]' : 'bg-[#E1EDEA] text-[#1496A3] hover:bg-[#1496A3] hover:text-white'}`}
                >
                  {selectedWorkerId === w._id ? 'Selected' : 'Assign'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Order Summary */}
        <div className="w-[30%] bg-gradient-to-b from-[#8ed4d3] to-[#E8F8F5] rounded-[24px] p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-[16px] text-white mb-6">Order Summary</h3>
            
            <div className="bg-white rounded-xl p-4 shadow-sm mb-4 relative">
              <div className="absolute top-4 right-4 text-green-500"><CheckCircle2 className="w-5 h-5"/></div>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide">
                Booking ID: <span className="text-gray-800">{booking.bookingId || booking._id}</span>
              </p>
              <h4 className="font-extrabold text-[16px] text-gray-800 my-1">{booking.service?.name || 'Service'}</h4>
              <p className="text-[12px] text-gray-600 flex items-center gap-1 mb-3">
                <MapPin className="w-3.5 h-3.5 text-green-600"/> {booking.address || '—'}
              </p>
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <span className="text-[12px] text-gray-600 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> {bookingDateLabel}</span>
                <span className="font-extrabold text-[15px] text-gray-800">₹{Number(booking.totalAmount || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-3 flex items-center gap-2 mb-6">
              <Wrench className="w-4 h-4 text-[#F57C00]" />
              <span className="font-bold text-[14px] text-gray-800">{booking.service?.category || 'Category'}</span>
            </div>

            <h4 className="font-bold text-[15px] text-gray-800 mb-3">Booking Notes</h4>
            <ul className="list-disc pl-5 text-[13px] text-gray-700 space-y-2">
              <li>{booking.notes || 'No notes provided.'}</li>
            </ul>
          </div>

          <div className="flex gap-3 mt-auto">
            <button className="flex-1 bg-white border border-gray-200 text-gray-700 font-bold text-[13px] py-3 rounded-xl hover:bg-gray-50 transition shadow-sm" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button
              disabled={!selectedWorkerId || assignLoading}
              className={`flex-[2] text-white font-bold text-[13px] py-3 rounded-xl transition shadow-sm ${!selectedWorkerId || assignLoading ? 'bg-[#0B8483]/50 cursor-not-allowed' : 'bg-[#0B8483] hover:bg-teal-800'}`}
              onClick={async () => {
                if (!selectedWorkerId) return;
                try {
                  setAssignLoading(true);
                  await api.patch(`/bookings/${id}/assign-worker`, { workerId: selectedWorkerId });
                  navigate('/bookings');
                } catch (e: any) {
                  alert(normalizeApiError(e, 'Failed to assign worker'));
                } finally {
                  setAssignLoading(false);
                }
              }}
            >
              {assignLoading ? 'Assigning…' : 'Assign Worker'}
            </button>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
