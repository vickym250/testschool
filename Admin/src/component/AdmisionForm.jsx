import React, { useRef, useState, useEffect } from "react";
import { db } from "../firebase"; 
import { doc, getDoc } from "firebase/firestore";

export default function AdmissionDetails({ studentId, onClose }) {
    const printRef = useRef();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPrinting, setIsPrinting] = useState(false); 
    const [finalPhoto, setFinalPhoto] = useState(null);
    
    const [school, setSchool] = useState({
        name: "Sun Shine School",
        address: "mahanua",
        affiliation: "UP BOARD",
        logoUrl: "https://firebasestorage.googleapis.com/v0/b/jnschool-6e62e.firebasestorage.app/o/school_logo%2Fmain_logo?alt=media&token=deddab30-5313-4f49-af39-7b15b6ddb9e3",
        phone: "234565467"
    });

    // --- DATE FORMATTING FUNCTION ---
    const formatDate = (dateString) => {
        if (!dateString) return "---";
        try {
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return dateString; // Agar date invalid hai toh original return kare
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            return dateString;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!studentId) return;
            try {
                setLoading(true);
                const schoolSnap = await getDoc(doc(db, "settings", "schoolDetails"));
                if (schoolSnap.exists()) setSchool(schoolSnap.data());

                const docSnap = await getDoc(doc(db, "students", studentId));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setStudent(data);
                    
                    if (data.photoURL) {
                        const proxyUrl = `https://images1-focus-opensocial.googleusercontent.com/gadgets/proxy?container=focus&refresh=2592000&url=${encodeURIComponent(data.photoURL)}`;
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.src = proxyUrl;
                        img.onload = () => { setFinalPhoto(proxyUrl); setLoading(false); };
                        img.onerror = () => { setFinalPhoto(data.photoURL); setLoading(false); };
                    } else { setLoading(false); }
                } else { setLoading(false); }
            } catch (err) { 
                console.error(err); 
                setLoading(false); 
            }
        };
        fetchData();
    }, [studentId]);

    const handlePrint = () => {
        setIsPrinting(true);
        const content = printRef.current.innerHTML;
        let oldIframe = document.getElementById("print-iframe");
        if (oldIframe) oldIframe.remove();

        const iframe = document.createElement("iframe");
        iframe.id = "print-iframe";
        iframe.style.position = "absolute";
        iframe.style.width = "0px";
        iframe.style.height = "0px";
        iframe.style.border = "none";
        document.body.appendChild(iframe);

        const docIframe = iframe.contentWindow.document;
        docIframe.open();
        docIframe.write(`
            <html>
            <head>
                <title>Admission_Slip_${student?.name}</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <style>
                    @page { size: A4 portrait; margin: 5mm; }
                    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-print-color-adjust: exact !important; }
                    .print-wrapper { width: 200mm; margin: 0 auto; }
                    .sheet-container { 
                        border: 2px solid #000; padding: 6mm; min-height: 135mm; 
                        position: relative; display: flex; flex-direction: column; 
                        box-sizing: border-box; margin-bottom: 8mm; background: #fff; 
                        page-break-inside: avoid;
                    }
                    .bg-gray-50 { background-color: #f9fafb !important; }
                    .bg-blue-900 { background-color: #1e3a8a !important; }
                    .text-white { color: #ffffff !important; }
                </style>
            </head>
            <body>
                <div class="print-wrapper">${content}</div>
                <script>
                    window.onload = function () {
                        setTimeout(() => {
                            window.focus();
                            window.print();
                            setTimeout(() => { window.frameElement.remove(); }, 500);
                        }, 800);
                    };
                </script>
            </body>
            </html>
        `);
        docIframe.close();
        setTimeout(() => setIsPrinting(false), 2500);
    };

    if (loading || isPrinting) {
        return (
            <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-[200] flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                <h2 className="text-blue-900 font-black tracking-widest uppercase animate-pulse">
                    {isPrinting ? "Generating Slip..." : "Fetching Details..."}
                </h2>
            </div>
        );
    }

    const DocumentSheet = ({ copyName }) => (
        <div className="sheet-container">
            <div className="absolute top-2 right-2 border-2 border-black px-2 py-0.5 text-[10px] font-black uppercase">
                {copyName}
            </div>
            
            {/* --- IMPROVED HEADER --- */}
            <div className="flex items-center border-b-2 border-black pb-3 mb-3 gap-5">
                <img src={school.logoUrl} className="w-20 h-20 object-contain" alt="logo" />
                <div className="flex-1 text-center">
                    <h1 className="text-3xl font-black text-blue-900 uppercase leading-none tracking-tight">{school.name}</h1>
                    <div className="bg-blue-900 text-white inline-block px-4 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 mb-1">
                        Affiliation: {school.affiliation}
                    </div>
                    <p className="text-[10px] text-gray-600 font-semibold uppercase">{school.address}</p>
                    <p className="text-[12px] font-black text-blue-900">Phone: {school.phone}</p>
                </div>
            </div>

            <div className="bg-black text-white text-center text-[11px] font-bold py-1.5 uppercase tracking-[5px] mb-3">
                Admission Slip | Session {student.session}
            </div>

            <div className="flex gap-4 mb-3">
                <div className="w-28 h-32 border-2 border-black p-1 bg-white">
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden border border-dashed border-gray-400">
                        {finalPhoto ? (
                            <img src={finalPhoto} className="w-full h-full object-cover" alt="student" />
                        ) : (
                            <span className="text-[10px] text-gray-400 font-bold uppercase">Photo</span>
                        )}
                    </div>
                </div>
                <div className="flex-1 grid grid-cols-2 border-t border-l border-black text-[11px]">
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Reg No.</div>
                    <div className="p-1.5 border-r border-b font-black text-blue-900 text-lg leading-none">{student.regNo}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Roll No.</div>
                    <div className="p-1.5 border-r border-b font-bold">{student.rollNumber || '---'}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Class</div>
                    <div className="p-1.5 border-r border-b font-black uppercase text-blue-800">{student.className}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Adm. Date</div>
                    <div className="p-1.5 border-r border-b font-bold">{formatDate(student.admissionDate)}</div>
                </div>
            </div>

            <div className="border-t border-l border-black text-[11px] mb-4">
                <div className="grid grid-cols-4">
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Student Name</div>
                    <div className="p-1.5 border-r border-b font-black col-span-3 uppercase text-blue-900 text-[13px]">{student.name}</div>
                    
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Father's Name</div>
                    <div className="p-1.5 border-r border-b font-bold uppercase">{student.fatherName}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Mother's Name</div>
                    <div className="p-1.5 border-r border-b font-bold uppercase">{student.motherName}</div>

                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Date of Birth</div>
                    <div className="p-1.5 border-r border-b font-bold uppercase">{formatDate(student.dob)}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Gender</div>
                    <div className="p-1.5 border-r border-b font-bold uppercase">{student.gender}</div>

                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Category</div>
                    <div className="p-1.5 border-r border-b font-bold uppercase">{student.category}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Phone No.</div>
                    <div className="p-1.5 border-r border-b font-bold">{student.phone}</div>

                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Aadhaar No.</div>
                    <div className="p-1.5 border-r border-b font-bold">{student.aadhaar || '---'}</div>
                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Transport Fee</div>
                    <div className="p-1.5 border-r border-b font-black text-green-700">₹{student.busFees || '0'}</div>

                    <div className="p-1.5 border-r border-b bg-gray-50 font-bold uppercase">Address</div>
                    <div className="p-1.5 border-r border-b font-medium col-span-3 uppercase text-[10px]">{student.address}</div>
                </div>
            </div>

            <div className="flex flex-col gap-3 mb-auto">
                <div className="border border-black p-2 bg-gray-50">
                    <p className="text-[9px] font-black uppercase text-gray-500 mb-2 border-b border-gray-300">Submitted Documents:</p>
                    <div className="flex flex-wrap gap-x-6">
                        <span className={student.docPhoto ? "text-blue-900 font-bold" : "text-gray-300"}>{student.docPhoto ? "✔" : "✘"} PHOTO</span>
                        <span className={student.docAadhaar ? "text-blue-900 font-bold" : "text-gray-300"}>{student.docAadhaar ? "✔" : "✘"} AADHAAR</span>
                        <span className={student.docTC ? "text-blue-900 font-bold" : "text-gray-300"}>{student.docTC ? "✔" : "✘"} T.C.</span>
                        <span className={student.docMarksheet ? "text-blue-900 font-bold" : "text-gray-300"}>{student.docMarksheet ? "✔" : "✘"} MARKSHEET</span>
                    </div>
                </div>
                
                <div className="border border-black p-2 bg-white">
                    <p className="text-[9px] font-black uppercase text-blue-900 mb-2 border-b border-blue-100">Prescribed Subjects:</p>
                    <div className="flex flex-wrap gap-2">
                        {student.subjects && student.subjects.length > 0 ? (
                            student.subjects.map((sub, i) => (
                                <span key={i} className="text-[10px] font-black border border-gray-300 px-3 py-0.5 bg-gray-50 uppercase">
                                    {sub}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] italic text-gray-400">No subjects assigned</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex justify-between px-10 mt-10 mb-4">
                <div className="text-center">
                    <div className="w-32 border-b-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Guardian's Signature</p>
                </div>
                <div className="text-center">
                    <div className="w-32 border-b-2 border-black mb-1"></div>
                    <p className="text-[10px] font-black uppercase">Principal / Office Seal</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-gray-200 z-[100] overflow-y-auto pb-10 flex flex-col items-center">
            <div className="max-w-4xl w-full flex justify-between items-center bg-white p-4 rounded-b-xl shadow-lg no-print sticky top-0 z-50 mb-6">
                <button onClick={onClose} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase hover:bg-black transition-all">
                    ← Close
                </button>
                <h2 className="font-black text-blue-900 uppercase text-lg tracking-widest">Admission Slip Preview</h2>
                <button onClick={handlePrint} className="bg-blue-600 text-white px-10 py-2 rounded-lg font-bold text-xs uppercase shadow-md hover:bg-blue-700 transition-all">
                    Print Now
                </button>
            </div>

            <div ref={printRef} className="w-full max-w-[210mm] bg-white p-6 shadow-2xl">
                <DocumentSheet copyName="OFFICE COPY" />
                <div className="no-print flex items-center justify-center my-8 opacity-40">
                    <div className="flex-1 border-b-2 border-dashed border-gray-600"></div>
                    <span className="mx-6 text-gray-700 text-xs font-black">✂ DETACH HERE</span>
                    <div className="flex-1 border-b-2 border-dashed border-gray-600"></div>
                </div>
                <DocumentSheet copyName="STUDENT COPY" />
            </div>
        </div>
    );
}