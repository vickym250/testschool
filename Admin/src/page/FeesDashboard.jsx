import React, { useState, useRef } from "react";
import ReactToPrint from "react-to-print"; 
import { Printer, Calendar, IndianRupee, Search } from 'lucide-react';

const monthsList = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

// --- STATIC DATA ---
const STATIC_CLASSES = ["Class 1", "Class 2", "Class 3", "Class 4"];
const STATIC_FEE = 1500;
const STATIC_STUDENTS = [
  { id: "1", rollNumber: "101", name: "Rahul Sharma", fatherName: "Sanjay Sharma", fees: { "2025-26": { "Apr": { status: "Paid", receiptId: "REC-9921" } } } },
  { id: "2", rollNumber: "102", name: "Priya Patel", fatherName: "Vikram Patel", fees: { "2025-26": { "Apr": { status: "Pending" } } } },
  { id: "3", rollNumber: "103", name: "Amit Kumar", fatherName: "Rajesh Kumar", fees: { "2025-26": { "Apr": { status: "Paid", receiptId: "REC-9945" } } } },
  { id: "4", rollNumber: "104", name: "Sana Khan", fatherName: "Arif Khan", fees: { "2025-26": { "Apr": { status: "Pending" } } } },
  { id: "5", rollNumber: "105", name: "Aryan Singh", fatherName: "Manoj Singh", fees: { "2025-26": { "Apr": { status: "Paid", receiptId: "REC-9950" } } } },
];

export default function FeesDashboard() {
  const [selectedClass, setSelectedClass] = useState(STATIC_CLASSES[0]);
  const [selectedMonth, setSelectedMonth] = useState("Apr");
  const [searchTerm, setSearchTerm] = useState("");
  const activeSession = "2025-26";
  const componentRef = useRef(null);

  // Search logic for static list
  const filteredList = STATIC_STUDENTS.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.rollNumber?.toString().includes(searchTerm)
  );

  const paidStudents = filteredList.filter(s => s.fees?.[activeSession]?.[selectedMonth]?.status === "Paid");
  const totalReceived = paidStudents.length * STATIC_FEE;
  const totalPending = (filteredList.length - paidStudents.length) * STATIC_FEE;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      
      {/* Filters Section */}
      <div className="max-w-7xl mx-auto mb-8 no-print">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Search Student</label>
            <div className="relative">
                <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Name or Roll No..." 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-2.5 pl-10 rounded-2xl outline-none focus:border-indigo-500 font-bold" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="bg-indigo-50 border-2 border-indigo-100 p-2.5 rounded-2xl font-black text-indigo-700 outline-none cursor-pointer">
              {STATIC_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Month</label>
            <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="bg-orange-50 border-2 border-orange-100 p-2.5 rounded-2xl font-black text-orange-700 outline-none cursor-pointer">
              {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <ReactToPrint
            trigger={() => (
              <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-black shadow-lg transition-all active:scale-95">
                <Printer size={18}/> Print Ledger
              </button>
            )}
            content={() => componentRef.current}
            documentTitle={`Ledger_${selectedClass}_${selectedMonth}`}
          />
        </div>
      </div>

      {/* Printable Area */}
      <div className="max-w-7xl mx-auto">
        <div ref={componentRef} className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-slate-100 print:shadow-none print:border-none print:p-0">
          
          {/* Header */}
          <div className="flex justify-between items-start mb-12 border-b-2 border-slate-50 pb-8">
              <div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase leading-none">Fees Ledger</h1>
                  <div className="flex items-center gap-3 mt-4">
                      <span className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full">{activeSession}</span>
                      <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">{selectedMonth} Collection Report</span>
                  </div>
              </div>
              <div className="text-right">
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Selected Class</p>
                  <p className="text-3xl font-black text-slate-800 tracking-tight">{selectedClass}</p>
              </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <div className="bg-emerald-50 border-2 border-emerald-100 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Received</p>
                      <IndianRupee size={16} className="text-emerald-600"/>
                  </div>
                  <h2 className="text-2xl font-black text-emerald-700">₹{totalReceived.toLocaleString('en-IN')}</h2>
                  <p className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">{paidStudents.length} Students Paid</p>
              </div>
              <div className="bg-rose-50 border-2 border-rose-100 p-6 rounded-3xl">
                  <div className="flex justify-between items-center mb-2">
                      <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Pending</p>
                      <Calendar size={16} className="text-rose-600"/>
                  </div>
                  <h2 className="text-2xl font-black text-rose-700">₹{totalPending.toLocaleString('en-IN')}</h2>
                  <p className="text-[9px] font-bold text-rose-500 mt-1 uppercase">{filteredList.length - paidStudents.length} Pending</p>
              </div>
              <div className="bg-slate-900 p-6 rounded-3xl shadow-xl shadow-slate-200">
                  <p className="text-[10px] font-black text-slate-400 uppercase mb-2 tracking-widest">Total Expected</p>
                  <h2 className="text-2xl font-black text-white">₹{(totalReceived + totalPending).toLocaleString('en-IN')}</h2>
                  <p className="text-[9px] font-bold text-indigo-400 mt-1 uppercase tracking-tighter">Fee Per Head: ₹{STATIC_FEE}</p>
              </div>
          </div>

          {/* List Table */}
          <div className="overflow-hidden rounded-3xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="p-4 border-b">Roll</th>
                  <th className="p-4 border-b">Student Name</th>
                  <th className="p-4 border-b">Father's Name</th>
                  <th className="p-4 border-b text-center">Status</th>
                  <th className="p-4 border-b text-right">Fee</th>
                  <th className="p-4 border-b text-right">Receipt ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredList.length > 0 ? filteredList.map((s) => {
                  const feeStatus = s.fees?.[activeSession]?.[selectedMonth];
                  const isPaid = feeStatus?.status === "Paid";
                  return (
                    <tr key={s.id} className="text-sm font-bold text-slate-700 hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 text-indigo-600 font-black">#{s.rollNumber || '--'}</td>
                      <td className="p-4 uppercase font-black text-slate-800">{s.name}</td>
                      <td className="p-4 text-slate-400 text-xs font-medium uppercase">{s.fatherName}</td>
                      <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${isPaid ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                              {isPaid ? "Received" : "Pending"}
                          </span>
                      </td>
                      <td className="p-4 text-right font-black text-slate-900">₹{STATIC_FEE}</td>
                      <td className="p-4 text-right text-[10px] font-mono text-slate-300 italic">
                          {isPaid ? feeStatus.receiptId : '---'}
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan="6" className="p-10 text-center text-slate-400 font-bold uppercase tracking-widest">No Students Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Print Signature Footer */}
          <div className="mt-20 flex justify-between items-end hidden-print-only">
              <div className="text-[9px] font-bold text-slate-300 italic uppercase tracking-widest">
                  Generated via Vtech ERP • {new Date().toLocaleDateString()}
              </div>
              <div className="text-center">
                  <div className="w-56 border-b-2 border-slate-200 mb-2"></div>
                  <p className="text-[10px] font-black uppercase text-slate-800 tracking-tighter">Authorized Signature / Stamp</p>
              </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .hidden-print-only { display: flex !important; }
          body { background: white !important; padding: 0 !important; margin: 0 !important; }
          .max-w-7xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:p-0 { padding: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
        .hidden-print-only { display: none; }
      `}</style>
    </div>
  );
}