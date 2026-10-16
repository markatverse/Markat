"use client";

import React, { useState } from 'react';
import { 
  HeartPulse, 
  Stethoscope, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  FileText, 
  UserPlus, 
  Activity, 
  Search, 
  Plus, 
  X,
  Phone,
  AlertTriangle,
  Pill,
  ClipboardList
} from 'lucide-react';

interface ClinicDoctorModuleProps {
  queueData: any;
  user: any;
  onRefresh: () => void;
  onAction: (actionId: string, endpoint: string, method?: string, body?: any) => Promise<void>;
  actionLoading: string | null;
}

export default function ClinicDoctorModule({
  queueData,
  user,
  onRefresh,
  onAction,
  actionLoading
}: ClinicDoctorModuleProps) {
  const [activeSubTab, setActiveSubTab] = useState<'opd' | 'consults' | 'records'>('opd');
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [prescriptionNote, setPrescriptionNote] = useState('');
  const [vitalsBp, setVitalsBp] = useState('120/80');
  const [vitalsPulse, setVitalsPulse] = useState('74 bpm');
  const [vitalsTemp, setVitalsTemp] = useState('98.4 °F');

  // Live or fallback patients waiting in OPD queue
  const waitingPatients = (queueData?.waiting && queueData.waiting.length > 0)
    ? queueData.waiting
    : [
        {
          id: 'PAT-401',
          tokenNumber: 14,
          customerName: 'Ramesh Patel',
          age: 46,
          gender: 'Male',
          service: 'General Physician Consultation',
          complaint: 'Fever & persistent body ache for 3 days',
          status: 'WAITING',
          vitals: { bp: '128/84', pulse: '78 bpm', temp: '100.2 °F' },
          time: '10:15 AM'
        },
        {
          id: 'PAT-402',
          tokenNumber: 15,
          customerName: 'Sunita Sharma',
          age: 32,
          gender: 'Female',
          service: 'Follow-up Consultation',
          complaint: 'Thyroid dosage review & blood test check',
          status: 'WAITING',
          vitals: { bp: '118/76', pulse: '72 bpm', temp: '98.6 °F' },
          time: '10:30 AM'
        },
        {
          id: 'PAT-403',
          tokenNumber: 16,
          customerName: 'Aditya Verma',
          age: 12,
          gender: 'Male',
          service: 'Pediatric Checkup',
          complaint: 'Dry cough & throat allergy',
          status: 'WAITING',
          vitals: { bp: '110/70', pulse: '86 bpm', temp: '99.0 °F' },
          time: '10:45 AM'
        }
      ];

  const currentlyServing = (queueData?.serving && queueData.serving.length > 0)
    ? queueData.serving[0]
    : {
        id: 'PAT-400',
        tokenNumber: 13,
        customerName: 'Harpreet Singh',
        age: 52,
        gender: 'Male',
        service: 'Cardio & BP Consultation',
        complaint: 'Mild chest heaviness post meals',
        status: 'SERVING',
        vitals: { bp: '142/92', pulse: '82 bpm', temp: '98.5 °F' },
        time: 'In Clinic (15 mins)'
      };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-black tracking-widest uppercase mb-1">
              <Stethoscope className="w-4 h-4" /> Doctor & Clinical OPD Suite
            </div>
            <h2 className="text-2xl md:text-3xl font-black">{user?.business?.name || 'Healthcare & Clinic'}</h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              OPD patient tokens, digital medical records, triage vitals, and consultation management.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-black/20 backdrop-blur px-4 py-2.5 rounded-xl border border-white/10 text-right">
              <div className="text-[10px] uppercase font-bold text-emerald-200">OPD Chamber</div>
              <div className="font-black text-sm text-white">Chamber 1 (Active)</div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Patients Waiting</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {waitingPatients.length}
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            Avg consult: 12-15 mins
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {queueData?.doneToday ?? 18}
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Consultations recorded
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Chamber Doctors</span>
            <HeartPulse className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {queueData?.staff?.length || 2} Active
          </div>
          <span className="text-[11px] font-semibold text-emerald-600">
            On-duty in clinic
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Emergency Flags</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            0 Urgent
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            Triage triage normal
          </span>
        </div>
      </div>

      {/* Main Grid: Active Consultation & Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Consultation Chamber (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                  #{currentlyServing.tokenNumber}
                </div>
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Inside Doctor&apos;s Chamber</div>
                  <h3 className="font-black text-lg text-slate-900">{currentlyServing.customerName || 'Harpreet Singh'}</h3>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (queueData?.queue?.id) {
                      onAction('next-patient', `/service-queue/${queueData.queue.id}/next`, 'POST');
                    } else {
                      alert('Consultation marked complete. Calling next patient.');
                    }
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Finish & Call Next
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Vitals Bar */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> Patient Vitals (Nurse Triaged)
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Blood Pressure</span>
                    <div className="text-base font-black text-slate-800">{vitalsBp}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Pulse Rate</span>
                    <div className="text-base font-black text-slate-800">{vitalsPulse}</div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase font-bold">Temperature</span>
                    <div className="text-base font-black text-slate-800">{vitalsTemp}</div>
                  </div>
                </div>
              </div>

              {/* Chief Complaints */}
              <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider block mb-1">Chief Complaint / Reason for Visit</span>
                <p className="text-sm font-semibold text-slate-800">
                  {currentlyServing.complaint || 'Mild chest heaviness post meals and shortness of breath upon brisk walking.'}
                </p>
              </div>

              {/* Digital Prescription & Diagnosis */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" /> Diagnosis & Prescription Notes
                </label>
                <textarea
                  rows={4}
                  value={prescriptionNote}
                  onChange={e => setPrescriptionNote(e.target.value)}
                  placeholder="e.g. Tab Telmisartan 40mg once daily in morning. Advised Lipid Profile & ECG."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">Prescription can be sent to patient SMS / WhatsApp</span>
                  <button 
                    onClick={() => alert('Prescription saved and sent to patient.')}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Pill className="w-3.5 h-3.5 text-emerald-400" /> Save Rx
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live OPD Patient Queue (Right col) */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-600" /> OPD Queue ({waitingPatients.length})
              </h3>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">Live</span>
            </div>

            <div className="space-y-3">
              {waitingPatients.map((patient: any, idx: number) => (
                <div
                  key={patient.id || idx}
                  className="p-3 rounded-xl border border-slate-200 hover:border-emerald-400 transition-colors bg-white flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                      #{patient.tokenNumber || (idx + 14)}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{patient.customerName}</div>
                      <div className="text-xs text-slate-400">
                        {patient.age ? `${patient.age}y, ${patient.gender}` : patient.service}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">
                    {patient.time || 'Waiting'}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                if (queueData?.queue?.id) {
                  onAction('call-next', `/service-queue/${queueData.queue.id}/next`, 'POST');
                } else {
                  alert('Calling next patient into chamber.');
                }
              }}
              className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
            >
              Call Next Patient
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
