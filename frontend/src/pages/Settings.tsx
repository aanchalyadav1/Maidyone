import React, { useState, useEffect } from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';
import api, { extractApiData, normalizeApiError } from '../services/api';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store';
import { setCredentials } from '../features/auth/authSlice';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile Settings');
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const token = useSelector((state: RootState) => state.auth.token);

  // Profile form state
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatar: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch admin profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const envelope: any = await api.get('/settings/profile');
        const data = extractApiData<any>(envelope, {});
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || '',
          avatar: data.avatar || '',
        });
      } catch (e: any) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);

      const payload: any = {};
      if (profile.name.trim()) payload.name = profile.name.trim();
      if (profile.email.trim()) payload.email = profile.email.trim();
      if (profile.phoneNumber.trim()) payload.phoneNumber = profile.phoneNumber.trim();
      if (profile.address.trim()) payload.address = profile.address.trim();
      if (profile.avatar.trim()) payload.avatar = profile.avatar.trim();

      const envelope: any = await api.patch('/settings/profile', payload);
      const data = extractApiData<any>(envelope, {});

      // Update Redux store so Sidebar reflects new name/email
      if (authUser && token) {
        dispatch(setCredentials({
          user: {
            ...authUser,
            name: data.name || authUser.name,
            email: data.email || authUser.email,
          },
          token,
        }));
        // Persist to localStorage
        localStorage.setItem('user', JSON.stringify({
          ...authUser,
          name: data.name || authUser.name,
          email: data.email || authUser.email,
        }));
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(normalizeApiError(e, 'Failed to save profile'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex gap-8 border-b border-gray-200">
        {['Profile Settings', 'Account Settings', 'Notifications', 'Security Settings'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[13px] font-bold transition-colors relative ${activeTab === tab ? 'text-[#0EA5A4]' : 'text-gray-400 hover:text-gray-800'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0EA5A4]"></div>}
          </button>
        ))}
      </div>

      <div className="mb-4 text-left">
        <h2 className="text-[20px] font-bold text-[#111827]">Profile Information</h2>
        <span className="text-gray-400 text-[12px]">Manage your account settings</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">

        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-8">
            <h3 className="text-[15px] font-bold text-[#111827] mb-8">Profile Information</h3>

            {loadingProfile ? (
              <div className="flex items-center gap-3 text-gray-400 text-sm py-8">
                <div className="w-5 h-5 border-2 border-gray-300 border-t-[#0EA5A4] rounded-full animate-spin" />
                Loading profile…
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="relative flex flex-col items-center gap-4">
                  <div className="relative group cursor-pointer w-max">
                    <img
                      src={profile.avatar || 'https://i.pravatar.cc/150?img=11'}
                      alt="Avatar"
                      className="w-[120px] h-[120px] rounded-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?img=11'; }}
                    />
                    <div className="absolute bottom-1 right-1 bg-[#1496A3] rounded-md p-1.5 shadow-md">
                      <Camera className="w-[14px] h-[14px] text-white" />
                    </div>
                  </div>
                  <span className="text-[12px] font-bold text-[#111827]">Profile Photo</span>
                </div>

                <div className="flex-1 w-full flex flex-col gap-4">
                  <div className="flex items-center">
                    <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Full Name</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Phone</label>
                    <input
                      type="text"
                      value={profile.phoneNumber}
                      onChange={e => setProfile(p => ({ ...p, phoneNumber: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Address</label>
                    <input
                      type="text"
                      value={profile.address}
                      onChange={e => setProfile(p => ({ ...p, address: e.target.value }))}
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none"
                    />
                  </div>

                  <div className="flex items-center">
                    <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Avatar URL</label>
                    <input
                      type="text"
                      value={profile.avatar}
                      onChange={e => setProfile(p => ({ ...p, avatar: e.target.value }))}
                      placeholder="https://..."
                      className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none"
                    />
                  </div>

                  {saveError && (
                    <p className="ml-[120px] text-[12px] text-red-600 font-semibold">{saveError}</p>
                  )}
                  {saveSuccess && (
                    <p className="ml-[120px] text-[12px] text-green-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> Profile saved successfully
                    </p>
                  )}

                  <div className="mt-4 flex gap-4 ml-[120px]">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-[#1496A3] text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-teal-700 transition disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      className="bg-white text-[#111827] font-bold border border-[#E5E7EB] text-[13px] px-6 py-2.5 rounded-lg hover:bg-gray-50 transition"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recent Transactions — connected to payments API */}
          <RecentTransactions />
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-[#111827] mb-6">Account Info</h3>
            <div className="flex flex-col gap-4 text-[12px]">
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Role</span>
                <span className="font-bold text-[#111827] capitalize">{authUser?.role || 'Admin'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Email</span>
                <span className="font-bold text-[#111827] truncate max-w-[160px]">{profile.email || authUser?.email || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#6B7280]">Current Password</span>
                <span className="font-bold text-[#111827] tracking-widest">********</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <span className="text-[#6B7280]">Time Zone</span>
                <span className="text-[#6B7280] text-[10px] uppercase">(GMT +05:30) India Standard Time</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6">
            <h3 className="text-[15px] font-bold text-[#111827] mb-6">Billing Info</h3>
            <div className="flex flex-col gap-4 text-[12px]">
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280] text-[10px]">Current Plan</span>
                <div className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 font-bold text-[#111827] bg-[#FAFAFA]">Premium Subscription</div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[#6B7280] text-[10px]">Payment Method</span>
                <div className="w-full border border-[#E5E7EB] rounded-lg px-4 py-2.5 font-bold text-[#111827] bg-[#FAFAFA] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#1A1F71] text-white text-[9px] font-bold px-2 py-0.5 rounded">VISA</div>
                    <span>4321</span>
                  </div>
                  <span className="text-gray-300">›</span>
                </div>
              </div>
              <div className="mt-2">
                <button className="w-full bg-[#6CC8C6] text-white font-bold text-[13px] py-2.5 rounded-lg hover:bg-teal-500 transition shadow-sm">
                  Update Billing Info
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Sub-component: Recent Transactions (connected to payments API)
const RecentTransactions = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const envelope: any = await api.get('/payments?limit=5');
        const data = extractApiData<{ payments: any[] }>(envelope, { payments: [] } as any);
        setPayments(data.payments ?? []);
      } catch {
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[15px] font-bold text-[#111827]">Recent Transactions</h3>
        <select className="text-[11px] border border-[#E5E7EB] rounded px-3 py-1.5 outline-none text-[#6B7280]">
          <option>This Week</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#FAFAFA] text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
              <th className="py-3 px-4 first:rounded-l-lg">PAYMENT ID</th>
              <th className="py-3 px-4">USER</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4 last:rounded-r-lg">DATE</th>
            </tr>
          </thead>
          <tbody className="text-[12px]">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-400">Loading…</td></tr>
            ) : payments.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-4 text-gray-500 text-sm">No transactions found</td></tr>
            ) : payments.map((item, index) => (
              <tr key={item._id || index} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                <td className="py-4 px-4 font-bold text-[#0EA5A4]">{item.paymentId || '—'}</td>
                <td className="py-4 px-4 flex items-center gap-3">
                  <img
                    src={item.user?.avatar || `https://i.pravatar.cc/150?img=${(index % 70) + 1}`}
                    className="w-8 h-8 rounded-full object-cover"
                    alt="user"
                  />
                  <span className="font-bold text-[#111827]">{item.user?.name || '—'}</span>
                </td>
                <td className="py-4 px-4 font-extrabold text-[#111827]">₹{item.amount || 0}</td>
                <td className="py-4 px-4">
                  <span className={`px-3 py-1 rounded text-[10px] font-bold ${
                    item.status === 'Completed' ? 'bg-[#E1F7E3] text-[#1E7145]' :
                    item.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {item.status || '—'}
                  </span>
                </td>
                <td className="py-4 px-4 text-[#6B7280] font-medium">
                  {new Date(item.createdAt || Date.now()).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
