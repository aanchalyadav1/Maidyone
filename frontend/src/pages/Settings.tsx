import React, { useState } from 'react';
import { Camera, Download, FileText, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile Information');

  return (
    <div className="space-y-6 max-w-[1200px]">
      <div className="flex gap-8 border-b border-gray-200">
        {['Profile Information', 'Security'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-[15px] font-bold transition-colors relative ${activeTab === tab ? 'text-[#0EA5A4]' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {tab}
            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#0EA5A4] rounded-t-lg"></div>}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm p-8">
        <h3 className="text-[18px] font-bold text-gray-800 mb-8 border-b border-gray-100 pb-4">Account info</h3>
        
        <div className="flex flex-col md:flex-row gap-10 items-start">
          <div className="relative group cursor-pointer w-max">
            <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-[120px] h-[120px] rounded-full border-4 border-gray-50 shadow-sm object-cover" />
            <div className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 border border-gray-100">
              <Camera className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">User name</label>
              <input type="text" defaultValue="Mr. Raj" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Nick name</label>
              <input type="text" defaultValue="Raj" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Contact Number</label>
              <input type="text" defaultValue="+123 4567 890" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Gender</label>
              <select className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition appearance-none">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">E-Mail Address</label>
              <input type="email" defaultValue="Email.raj@gmail.com" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-gray-700">Postal Code</label>
              <input type="text" defaultValue="12345" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-[13px] font-bold text-gray-700">Current City</label>
              <input type="text" defaultValue="Paris, France" className="bg-gray-50 border border-border rounded-xl px-4 py-3 text-[14px] text-gray-800 focus:border-[#0EA5A4] outline-none transition" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="bg-[#1496A3] text-white font-bold text-[14px] px-8 py-3 rounded-xl hover:bg-teal-700 transition shadow-sm">Save Changes</button>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-border shadow-sm p-8">
        <h3 className="text-[18px] font-bold text-gray-800 mb-6">Recent Transaction</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[12px] text-gray-400 uppercase tracking-wide">
                <th className="pb-3 px-2 font-bold">Invoice Number</th>
                <th className="pb-3 px-2 font-bold">Created Date</th>
                <th className="pb-3 px-2 font-bold">Billing Details</th>
                <th className="pb-3 px-2 font-bold">Status</th>
                <th className="pb-3 px-2 font-bold right text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {[1, 2, 3].map((item) => (
                <tr key={item} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-2">
                    <span className="font-bold text-[#0EA5A4] text-[13px] flex items-center gap-2"><FileText className="w-4 h-4" /> INV-834{item}2</span>
                  </td>
                  <td className="py-4 px-2 font-medium text-[13px] text-gray-600">October {item + 10}, 2023</td>
                  <td className="py-4 px-2">
                     <span className="font-bold text-[13px] text-gray-800">$1,23{item}.00</span>
                     <span className="text-gray-400 text-[11px] block">Premium Plan</span>
                  </td>
                  <td className="py-4 px-2">
                    <span className="bg-[#E1F7E3] text-[#1E7145] text-[11px] font-bold uppercase px-3 py-1 rounded inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Paid</span>
                  </td>
                  <td className="py-4 px-2 text-right">
                    <button className="flex items-center gap-1.5 text-gray-500 hover:text-primary transition font-bold text-[12px] bg-white border border-gray-200 px-3 py-1.5 rounded-lg ml-auto shadow-sm">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
