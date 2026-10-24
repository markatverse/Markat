"use client";
import React from 'react';
import { PlusCircle } from 'lucide-react';

interface StaffMember {
  name: string;
  role: string;
  shift: string;
  status: string;
  assigned: string;
}

interface SellerStaffTabProps {
  activeVertical: string;
  onOpenStaffModal: () => void;
}

export default function SellerStaffTab({
  activeVertical,
  onOpenStaffModal,
}: SellerStaffTabProps) {
  const isAutoWash = activeVertical === 'AUTOWASH';

  const staffMembers: StaffMember[] = activeVertical === 'FOOD' ? [
    { name: 'Chef Rajesh Kumar', role: 'Head Chef', shift: 'Morning & Evening', status: 'On Duty', assigned: 'Kitchen Main (KOT)' },
    { name: 'Amit Singh', role: 'Captain / Waiter', shift: 'Full Day', status: 'Active on Floor', assigned: 'Tables 1 to 4' },
    { name: 'Sunil Rawat', role: 'Service Waiter', shift: 'Evening Shift', status: 'Active on Floor', assigned: 'Tables 5 to 7' },
    { name: 'Vikas Mehra', role: 'Tandoor & Breads Chef', shift: 'Morning & Evening', status: 'On Duty', assigned: 'Live Tandoor Station' }
  ] : (activeVertical === 'DOCTOR' ? [
    { name: 'Dr. Aditi Verma', role: 'Senior Consultant', shift: '10:00 AM - 02:00 PM', status: 'In OPD Cabin 1', assigned: 'General OPD' },
    { name: 'Nurse Priya', role: 'Head Nurse & Triage', shift: 'Morning Shift', status: 'On Duty', assigned: 'Patient Vitals & Queue' },
    { name: 'Dr. Rohan Mehra', role: 'Physician', shift: '04:00 PM - 08:00 PM', status: 'Scheduled', assigned: 'OPD Cabin 2' },
  ] : (activeVertical === 'AUTOWASH' ? [
    { name: 'Sunil Kumar', role: 'Lead Bay Specialist', shift: 'Morning Shift (08:00 - 16:00)', status: 'On Duty', assigned: 'Wash Bay 1 (Pressure & Foam)' },
    { name: 'Rajesh Verma', role: 'Detailing & Wax Expert', shift: 'Full Day (09:00 - 18:00)', status: 'In Service', assigned: 'Wash Bay 2 (Interior Detailing)' },
    { name: 'Mohd. Irfan', role: 'Heavy Equipment Operator', shift: 'Full Day (08:00 - 18:00)', status: 'Available', assigned: 'Commercial Bay (Truck / JCB)' },
    { name: 'Amit Rawat', role: 'Drying & QC Inspector', shift: 'Evening Shift (12:00 - 20:00)', status: 'On Duty', assigned: 'Inspection & Delivery Bay' }
  ] : [
    { name: 'Aarav Stylist', role: 'Master Hair Stylist', shift: 'Full Day', status: 'Available', assigned: 'Styling Chair 1' },
    { name: 'Neha Spa', role: 'Aesthetician', shift: 'Morning Shift', status: 'In Service', assigned: 'Spa Room 2' },
    { name: 'Ravi Barber', role: 'Beard & Grooming Specialist', shift: 'Evening Shift', status: 'Available', assigned: 'Chair 3' }
  ]));

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isAutoWash
              ? 'Bay Technicians & Detailing Crew'
              : (activeVertical === 'FOOD' ? 'Kitchen & Service Staff' : (activeVertical === 'DOCTOR' ? 'Doctors & Clinic Staff' : (activeVertical === 'EVENT' ? 'Event Crew & Coordinators' : 'Stylists & Salon Team')))}
          </h1>
          <p className="text-slate-500 mt-1">
            {isAutoWash
              ? 'Manage active bay technicians, pressure washers, detailing specialists, and shift schedules.'
              : (activeVertical === 'FOOD' 
                ? 'Manage your chefs, captains, and waiters for dining tables & KOT assignments.' 
                : 'Manage active working staff, shift schedules, and resource desks.')}
          </p>
        </div>
        <button 
          onClick={onOpenStaffModal}
          className={`${
            isAutoWash 
              ? 'bg-cyan-700 hover:bg-cyan-800 shadow-cyan-700/20' 
              : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
          } text-white px-5 py-2.5 rounded-xl font-bold shadow-md transition-colors flex items-center gap-2 text-sm`}
        >
          <PlusCircle className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {staffMembers.map((member, i) => (
          <div key={i} className={`bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between group transition-all ${
            isAutoWash ? 'hover:border-cyan-300' : 'hover:border-rose-300'
          }`}>
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-base ${
                  isAutoWash ? 'bg-cyan-50 text-cyan-700' : 'bg-rose-50 text-rose-600'
                }`}>
                  {member.name.charAt(0)}
                </div>
                <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  ● {member.status}
                </span>
              </div>
              <h3 className="font-bold text-base text-slate-900">{member.name}</h3>
              <p className={`text-xs font-semibold mt-0.5 ${
                isAutoWash ? 'text-cyan-700' : 'text-rose-600'
              }`}>{member.role}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Assignment:</span>
                  <span className="font-semibold text-slate-800">{member.assigned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Shift:</span>
                  <span className="font-semibold text-slate-700">{member.shift}</span>
                </div>
              </div>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
              <button 
                onClick={onOpenStaffModal}
                className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
              >
                Edit Shift
              </button>
              <button 
                onClick={() => alert(`Shift status for ${member.name} updated.`)}
                className="px-3 py-2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Take Break
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
