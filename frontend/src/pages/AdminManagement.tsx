import React, { useState, useEffect } from 'react';
import { Shield, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  PRIMARY_ADMIN_EMAIL,
  getAdminEmails,
  getExtraAdminEmails,
  addAdminEmail,
  removeAdminEmail,
} from '../config/adminEmails';

// Simple email regex
const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

export const AdminManagement = () => {
  const [allEmails, setAllEmails]   = useState<string[]>([]);
  const [extraEmails, setExtraEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail]     = useState('');
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);

  const refresh = () => {
    setAllEmails(getAdminEmails());
    setExtraEmails(getExtraAdminEmails());
  };

  useEffect(() => { refresh(); }, []);

  const handleAdd = () => {
    const trimmed = newEmail.trim().toLowerCase();
    if (!trimmed) { setError('Email is required.'); return; }
    if (!isValidEmail(trimmed)) { setError('Enter a valid email address.'); return; }
    if (allEmails.includes(trimmed)) { setError('This email is already an admin.'); return; }

    addAdminEmail(trimmed);
    setNewEmail('');
    setError(null);
    setSuccess(`${trimmed} added as admin.`);
    refresh();
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleRemove = (email: string) => {
    if (email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()) return;
    removeAdminEmail(email);
    setSuccess(`${email} removed.`);
    refresh();
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-[#E8EAF6] text-[#3F51B5] flex items-center justify-center">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-text-secondary">Access Control</p>
          <h3 className="text-lg font-bold text-text-primary">Admin Management</h3>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-800 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
        <div>
          <p className="font-semibold mb-1">How admin access works</p>
          <p className="text-blue-700 text-[13px]">
            Only Firebase-authenticated users whose email is in this list can access the admin panel.
            The primary admin (<strong>{PRIMARY_ADMIN_EMAIL}</strong>) cannot be removed.
            Extra admins are stored in your browser's localStorage — they persist across sessions on this device.
          </p>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      {/* Add admin */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6">
        <h4 className="text-[15px] font-bold text-[#111827] mb-4">Add Admin Email</h4>
        <div className="flex gap-3">
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setError(null); }}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="newadmin@example.com"
            className="flex-1 px-4 py-2.5 border border-[#E5E7EB] rounded-xl text-[13px] outline-none focus:border-[#0EA5A4] bg-[#FAFAFA]"
          />
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[#0EA5A4] text-white px-5 py-2.5 rounded-xl text-[13px] font-bold hover:bg-teal-700 transition shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Current admins list */}
      <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6">
        <h4 className="text-[15px] font-bold text-[#111827] mb-4">
          Current Admins
          <span className="ml-2 text-[12px] font-normal text-[#6B7280]">({allEmails.length} total)</span>
        </h4>

        <div className="space-y-2">
          {allEmails.map((email) => {
            const isPrimary = email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();
            const isExtra   = extraEmails.includes(email.toLowerCase());
            return (
              <div
                key={email}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#E5E7EB] bg-[#FAFAFA]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${isPrimary ? 'bg-[#0EA5A4]' : 'bg-[#6B7280]'}`} />
                  <span className="text-[13px] font-medium text-[#111827] truncate">{email}</span>
                  {isPrimary && (
                    <span className="text-[10px] font-bold bg-[#E0F2F1] text-[#00897B] px-2 py-0.5 rounded-full shrink-0">
                      Primary
                    </span>
                  )}
                  {isExtra && !isPrimary && (
                    <span className="text-[10px] font-bold bg-[#E8EAF6] text-[#3F51B5] px-2 py-0.5 rounded-full shrink-0">
                      Extra
                    </span>
                  )}
                </div>

                {!isPrimary && (
                  <button
                    onClick={() => handleRemove(email)}
                    className="ml-3 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition shrink-0"
                    title={`Remove ${email}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Note about persistence */}
      <p className="text-[12px] text-[#6B7280] px-1">
        <strong>Note:</strong> Extra admins are stored in this browser's localStorage.
        To make admin changes permanent across all devices, update the{' '}
        <code className="bg-gray-100 px-1 rounded text-[11px]">ADMIN_EMAILS</code> array in{' '}
        <code className="bg-gray-100 px-1 rounded text-[11px]">frontend/src/config/adminEmails.ts</code> and redeploy.
      </p>
    </div>
  );
};
