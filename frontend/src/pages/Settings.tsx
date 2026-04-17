import React, { useState } from 'react';
import { Camera, Download, FileText, CheckCircle2 } from 'lucide-react';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('Profile Settings');

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
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative flex flex-col items-center gap-4">
                <div className="relative group cursor-pointer w-max">
                  <img src="https://i.pravatar.cc/150?img=11" alt="Avatar" className="w-[120px] h-[120px] rounded-full object-cover" />
                  <div className="absolute bottom-1 right-1 bg-[#1496A3] rounded-md p-1.5 shadow-md">
                    <Camera className="w-[14px] h-[14px] text-white" />
                  </div>
                </div>
                <span className="text-[12px] font-bold text-[#111827]">Profile Information</span>
              </div>
              
              <div className="flex-1 w-full flex flex-col gap-4">
                <div className="flex items-center">
                  <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Full Name</label>
                  <input type="text" defaultValue="Mr. Raj" className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none" />
                </div>
                
                <div className="flex items-center">
                  <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Email</label>
                  <input type="email" defaultValue="raj.email@gmail.com" className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none" />
                </div>
                
                <div className="flex items-center">
                  <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Phone</label>
                  <input type="text" defaultValue="+91 9968774455" className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none" />
                </div>

                <div className="flex items-center">
                  <label className="text-[12px] font-medium text-[#6B7280] w-[120px] shrink-0">Company</label>
                  <input type="text" defaultValue="Maidyone" className="w-full bg-[#FAFAFA] border border-[#E5E7EB] rounded-lg px-4 py-2.5 text-[13px] text-[#111827] focus:border-[#0EA5A4] outline-none text-center" />
                </div>

                <div className="mt-4 flex gap-4 ml-[120px]">
                  <button className="bg-[#1496A3] text-white font-bold text-[13px] px-6 py-2.5 rounded-lg hover:bg-teal-700 transition">Save Changes</button>
                  <button className="bg-white text-[#111827] font-bold border border-[#E5E7EB] text-[13px] px-6 py-2.5 rounded-lg hover:bg-gray-50 transition">Change Password</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6 overflow-hidden">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[15px] font-bold text-[#111827]">Recent Transactions</h3>
              <select className="text-[11px] border border-[#E5E7EB] rounded px-3 py-1.5 outline-none text-[#6B7280]"><option>This Week</option></select>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAFAFA] text-[10px] text-[#6B7280] uppercase tracking-wider font-bold">
                    <th className="py-3 px-4 first:rounded-l-lg">BOOKING ID</th>
                    <th className="py-3 px-4">WORKER</th>
                    <th className="py-3 px-4">JOB</th>
                    <th className="py-3 px-4">AMOUNT</th>
                    <th className="py-3 px-4">STATUS</th>
                    <th className="py-3 px-4 last:rounded-r-lg">DATE</th>
                  </tr>
                </thead>
                <tbody className="text-[12px]">
                  {[1, 2, 3, 4].map((item) => {
                    const data = [
                      { id: '#BK3455', worker: 'Bunty Kumar', img: '1', job: 'Room Cleaning', amt: '1,450', stat: 'Paid', date: '26 Apr 2024', statColor: 'text-[#1E7145] bg-[#E1F7E3]' },
                      { id: '#BK3124', worker: 'Rovr Verma', img: '2', job: 'House Cleaning', amt: '1,950', stat: 'Paid', date: '25 Apr 2024', statColor: 'text-[#1E7145] bg-[#E1F7E3]' },
                      { id: '#BK7654', worker: 'Robert Linten', img: '3', job: 'Plumbing Repair', amt: '2,800', stat: 'Pending', date: '25 Apr 2024', statColor: 'text-white bg-[#0EA5A4]' },
                      { id: '#BK8345', worker: 'Serah Linten', img: '4', job: 'Electrical Repair', amt: '2,320', stat: 'Paid', date: '24 Apr 2024', statColor: 'text-[#1E7145] bg-[#E1F7E3]' },
                    ][item - 1];
                    return (
                      <tr key={item} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition">
                        <td className="py-4 px-4 font-bold text-[#0EA5A4]">{data.id}</td>
                        <td className="py-4 px-4 flex items-center gap-3">
                           <img src={`https://i.pravatar.cc/150?img=${data.img}`} className="w-8 h-8 rounded-full object-cover" />
                           <span className="font-bold text-[#111827]">{data.worker}</span>
                        </td>
                        <td className="py-4 px-4 text-[#6B7280] font-medium">{data.job}</td>
                        <td className="py-4 px-4 font-extrabold text-[#111827]">₹ {data.amt}</td>
                        <td className="py-4 px-4">
                           <span className={`px-3 py-1 rounded text-[10px] font-bold ${data.statColor}`}>{data.stat}</span>
                        </td>
                        <td className="py-4 px-4 text-[#6B7280] font-medium">{data.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-[320px] flex flex-col gap-6">
          <div className="bg-white rounded-[24px] border border-[#E5E7EB] shadow-sm p-6">
             <h3 className="text-[15px] font-bold text-[#111827] mb-6">Account Info</h3>
             <div className="flex flex-col gap-4 text-[12px]">
               <div className="flex justify-between items-center"><span className="text-[#6B7280]">Plan</span><span className="font-bold text-[#111827]">Premium</span></div>
               <div className="flex justify-between items-center"><span className="text-[#6B7280]">Signup Date</span><span className="font-bold text-[#111827]">Apr 10, 2022</span></div>
               <div className="flex justify-between items-center"><span className="text-[#6B7280]">Current Password</span><span className="font-bold text-[#111827] tracking-widest">********</span></div>
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
                 <button className="w-full bg-[#6CC8C6] text-white font-bold text-[13px] py-2.5 rounded-lg hover:bg-teal-500 transition shadow-sm">Update Billing Info</button>
               </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
};
