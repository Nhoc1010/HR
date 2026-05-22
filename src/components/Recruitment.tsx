/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Network, 
  Sparkles, 
  User, 
  Phone, 
  Mail, 
  Activity, 
  Cpu, 
  Plus, 
  X, 
  XCircle,
  HelpCircle,
  CheckCircle,
  ArrowRight,
  AlertCircle,
  Search,
  Filter,
  RotateCcw
} from "lucide-react";
import { Candidate, Employee, Contract, Payroll as PayrollType } from "../types";

interface RecruitmentProps {
  candidates: Candidate[];
  setCandidates: Dispatch<SetStateAction<Candidate[]>>;
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  contracts: Contract[];
  setContracts: Dispatch<SetStateAction<Contract[]>>;
  payroll: PayrollType[];
  setPayroll: Dispatch<SetStateAction<PayrollType[]>>;
}

export default function Recruitment({ 
  candidates, 
  setCandidates,
  employees,
  setEmployees,
  contracts,
  setContracts,
  payroll,
  setPayroll
}: RecruitmentProps) {
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [filterInterviewType, setFilterInterviewType] = useState("");

  // Onboarding States
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [onboardDept, setOnboardDept] = useState("Kỹ thuật");
  const [onboardSalary, setOnboardSalary] = useState(15000000);
  const [onboardContractType, setOnboardContractType] = useState("Xác định thời hạn (12 tháng)");
  const [onboardSuccess, setOnboardSuccess] = useState(false);
  const [lastOnboardedCode, setLastOnboardedCode] = useState("");

  const handleOnboardCandidate = (candidate: Candidate) => {
    if (!employees || !setEmployees) return;

    const nextCodeNum = employees.length + 1;
    const assignedCode = `NV${String(nextCodeNum).padStart(3, "0")}`;
    const newEmpId = `emp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const todayStr = "2026-05-20";

    const newEmp: Employee = {
      id: newEmpId,
      code: assignedCode,
      name: candidate.name,
      position: candidate.position,
      phone: candidate.phone,
      email: candidate.email !== "—" ? candidate.email : `${assignedCode.toLowerCase()}@company.vn`,
      startDate: todayStr,
      birthDate: "1997-08-15",
      salary: onboardSalary,
      department: onboardDept,
      gender: "Nam",
      address: "Hà Nội, Việt Nam",
      bhxhNumber: `020${Math.floor(1000000 + Math.random() * 9000000)}`,
      bhxhJoinDate: todayStr,
      contractType: onboardContractType,
      contractStartDate: todayStr,
      status: "Đang làm"
    };

    const newContract: Contract = {
      id: `con-${Date.now()}`,
      employeeId: newEmpId,
      employeeName: candidate.name,
      type: onboardContractType as any,
      startDate: todayStr,
      endDate: onboardContractType === "Không xác định thời hạn" ? "Vô thời hạn" : "2027-05-20",
      basicSalary: onboardSalary,
      allowance: onboardSalary > 20000000 ? 3000000 : 1500000,
      status: "Đang hiệu lực",
      history: [
        { date: todayStr, action: "Ký mới", note: `Khởi tạo bổ nhiệm tự động từ kênh tuyển dụng của ứng viên ${candidate.name}` }
      ]
    };

    const newPay: PayrollType = {
      id: `pay-${Date.now()}`,
      employeeId: newEmpId,
      employeeName: candidate.name,
      month: "05/2026",
      basicSalary: onboardSalary,
      workDays: 22,
      overtimeHours: 0,
      allowance: onboardSalary > 20000000 ? 3000000 : 1500000,
      deductions: 1000000,
      advance: 0,
      netSalary: onboardSalary + (onboardSalary > 20000000 ? 3000000 : 1500000) - 1000000,
      status: "Đang tính toán"
    };

    setEmployees(prev => [...prev, newEmp]);
    if (setContracts) setContracts(prev => [...prev, newContract]);
    if (setPayroll) setPayroll(prev => [...prev, newPay]);

    // Update candidate status to "Đã tuyển"
    setCandidates(prev => prev.map(c => c.id === candidate.id ? { ...c, status: "Đã tuyển" } : c));
    
    setLastOnboardedCode(assignedCode);
    setOnboardSuccess(true);
    setIsOnboardOpen(false);
  };

  // New Candidate Form states
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [candName, setCandName] = useState("");
  const [candPos, setCandPos] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candScore, setCandScore] = useState(80);
  const [candNotes, setCandNotes] = useState("");
  const [candInterviewType, setCandInterviewType] = useState("Phỏng vấn Sơ vấn");
  const [interviewTypes, setInterviewTypes] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("hrm_interview_types");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      "Chưa lên lịch",
      "Phỏng vấn Sơ vấn",
      "Phỏng vấn Kỹ thuật",
      "Phỏng vấn Văn hóa",
      "Phỏng vấn với Giám đốc",
      "Phỏng vấn Nhân sự",
    ];
  });

  useEffect(() => {
    localStorage.setItem("hrm_interview_types", JSON.stringify(interviewTypes));
  }, [interviewTypes]);

  const [customTypeInput, setCustomTypeInput] = useState("");
  const [customNewTypeForForm, setCustomNewTypeForForm] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const stages: { id: "Ứng tuyển" | "Sàng lọc" | "Phỏng vấn" | "Đề nghị" | "Đã tuyển" | "Không đạt"; label: string; countColor: string }[] = [
    { id: "Ứng tuyển", label: "Ứng tuyển", countColor: "bg-blue-955 text-blue-400" },
    { id: "Sàng lọc", label: "Sàng lọc", countColor: "bg-amber-955 text-amber-400" },
    { id: "Phỏng vấn", label: "Phỏng vấn", countColor: "bg-violet-955 text-violet-400" },
    { id: "Đề nghị", label: "Đề nghị", countColor: "bg-fuchsia-955 text-fuchsia-400" },
    { id: "Đã tuyển", label: "Đã tuyển", countColor: "bg-emerald-955 text-emerald-400" },
    { id: "Không đạt", label: "Không đạt", countColor: "bg-rose-955 text-rose-400" },
  ];

  const handleShiftStage = (id: string, stage: any) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, status: stage } : c));
  };

  const handleAnalysCV = async (candidate: Candidate) => {
    setAnalyzingId(candidate.id);
    setAiAnalysis("");
    try {
      const resp = await fetch("/api/analyze-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidate: candidate })
      });
      const data = await resp.json();
      if (resp.ok) {
        setAiAnalysis(data.evaluation);
      } else {
        setAiAnalysis("Sự cố hệ thống khi kết nối Google Gemini API: " + (data.error || ""));
      }
    } catch (err: any) {
      setAiAnalysis("Lỗi mạng: Không thể liên hệ Máy chủ HRM AI để phân tích hồ sơ.");
    } finally {
      setAnalyzingId(null);
    }
  };

  const currentCandidate = candidates.find(c => c.id === activeCandidateId);

  const handleAddCandidate = (e: FormEvent) => {
    e.preventDefault();
    if (!candName || !candPos) {
      setFormError("Vui lòng điền tên ứng viên và vị trí tuyển dụng!");
      return;
    }
    setFormError(null);

    const payload: Candidate = {
      id: `cand-${Date.now()}`,
      name: candName,
      position: candPos,
      phone: candPhone || "Đang bổ sung",
      email: candEmail || "—",
      status: "Ứng tuyển",
      score: Number(candScore) || 70,
      notes: candNotes || "Hồ sơ nộp qua cổng tuyển dụng.",
      interviewType: candInterviewType
    };

    setCandidates([...candidates, payload]);
    setIsOpenForm(false);
    setCandName("");
    setCandPos("");
    setCandPhone("");
    setCandEmail("");
    setCandScore(80);
    setCandNotes("");
    setCandInterviewType("Phỏng vấn Sơ vấn");
  };

  // Generate filter option lists dynamically
  const uniquePositions = Array.from(new Set(candidates.map(c => c.position).filter(Boolean)));
  const uniqueInterviewTypes = Array.from(new Set(candidates.map(c => c.interviewType).filter(Boolean)));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Quy trình tuyển dụng (Funnel)</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý kênh ứng viên, xem xét phân tích CV và đánh giá chất lượng đầu vào.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsOpenForm(true);
          }}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 cursor-pointer glow-purple shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ứng viên ứng tuyển</span>
        </button>
      </div>

      {/* Search and Filters Section */}
      <div className="p-4 bg-slate-900/40 border border-slate-905 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <input
              type="text"
              placeholder="Tìm kiếm ứng viên theo tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-white placeholder-slate-550 focus:outline-none focus:border-violet-500 hover:border-slate-800 transition"
            />
          </div>

          {/* Filter by Position */}
          <div className="relative min-w-[200px]">
            <select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500 hover:border-slate-800 transition"
            >
              <option value="">Tất cả vị trí ứng tuyển</option>
              {uniquePositions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-violet-450 border-l border-slate-900">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Filter by Interview Type */}
          <div className="relative min-w-[220px]">
            <select
              value={filterInterviewType}
              onChange={(e) => setFilterInterviewType(e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-950 border border-slate-900 rounded-xl text-xs text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500 hover:border-slate-800 transition"
            >
              <option value="">Tất cả hình thức phỏng vấn</option>
              {uniqueInterviewTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-violet-450 border-l border-slate-900">
              <Filter className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Clear Filters button */}
        {(searchTerm || filterPosition || filterInterviewType) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterPosition("");
              setFilterInterviewType("");
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 hover:text-white rounded-xl text-xs transition flex items-center justify-center space-x-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
            <span>Xoá bộ lọc</span>
          </button>
        )}
      </div>

      {/* Kanban Stages Funnel Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {stages.map((st) => {
          // Apply text search and filter choices
          const filteredList = candidates.filter(c => {
            const matchesSearch = !searchTerm || c.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesPosition = !filterPosition || c.position === filterPosition;
            const matchesInterview = !filterInterviewType || c.interviewType === filterInterviewType;
            return matchesSearch && matchesPosition && matchesInterview;
          });
          const stCandidates = filteredList.filter(c => c.status === st.id);
          return (
            <div key={st.id} className="p-3 bg-slate-950/40 border border-slate-900 rounded-2xl flex flex-col min-h-[460px] min-w-[200px] shrink-0">
              {/* Column Name */}
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/40">
                <span className="text-xs font-bold text-slate-300">{st.label}</span>
                <span className="text-xs leading-none bg-slate-900 text-slate-450 px-2 py-0.5 rounded-md font-mono font-bold">
                  {stCandidates.length}
                </span>
              </div>

              {/* Items Card list */}
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px]">
                <AnimatePresence mode="popLayout">
                  {stCandidates.map((c) => (
                    <motion.div
                      layout
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.02, y: -2 }}
                      onClick={() => {
                        setActiveCandidateId(c.id);
                        setAiAnalysis("");
                      }}
                      className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-violet-500/20 shadow-sm cursor-pointer hover:bg-slate-900/60 transition group relative"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="text-xs font-bold text-white group-hover:text-indigo-400 truncate max-w-[110px]">
                            {c.name}
                          </h4>
                          <span className={`text-[10px] font-mono leading-none px-1.5 py-0.5 rounded font-bold ${
                            c.score >= 85 
                              ? "bg-emerald-500/10 text-emerald-400" 
                              : c.score >= 70 
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-slate-800 text-slate-400"
                          }`}>
                            {c.score}đ
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-405 truncate leading-tight">
                          {c.position}
                        </p>

                        {c.interviewType && (
                          <div className="flex items-center mt-1">
                            <span className={`inline-flex items-center rounded-md text-[9px] font-semibold px-1.5 py-0.5 border max-w-full truncate ${
                              c.interviewType === "Chưa lên lịch" 
                                ? "bg-slate-850 text-slate-400 border-slate-800" 
                                : c.interviewType.includes("Kỹ thuật")
                                  ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                  : c.interviewType.includes("Sơ vấn")
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                                    : c.interviewType.includes("Văn hóa")
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                      : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20"
                            }`}>
                              {c.interviewType}
                            </span>
                          </div>
                        )}

                        <div className="text-[9px] text-slate-500 truncate mt-1">
                          {c.notes}
                        </div>

                        {/* Quick controls to shift */}
                        <div className="flex justify-end pt-1 gap-1 border-t border-slate-800/30">
                          <select
                            value={c.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleShiftStage(c.id, e.target.value)}
                            className="bg-slate-950 text-[9px] px-1 py-0.5 rounded border border-slate-800 text-slate-400 max-w-[80px]"
                          >
                            <option value="Ứng tuyển">Ứng tuyển</option>
                            <option value="Sàng lọc">Sàng lọc</option>
                            <option value="Phỏng vấn">Phỏng vấn</option>
                            <option value="Đề nghị">Đề nghị</option>
                            <option value="Đã tuyển">Đã tuyển</option>
                            <option value="Không đạt">Không đạt</option>
                          </select>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {stCandidates.length === 0 && (
                  <div className="py-12 text-center text-[10px] text-slate-650 italic">
                    Chưa có ứng viên
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Drawer: Detailed Screen & AI Review */}
      <AnimatePresence>
        {activeCandidateId && currentCandidate && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex justify-end" onClick={() => setActiveCandidateId(null)}>
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-slate-950 border-l border-slate-800 h-screen p-6 overflow-y-auto space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header Profile */}
                <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-bold text-white text-md shadow-lg shadow-violet-950/40">
                      {currentCandidate.name.split(" ").pop()?.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-md font-bold text-white">{currentCandidate.name}</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Vị trí ứng tuyển: {currentCandidate.position}</p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => setActiveCandidateId(null)}
                    className="p-1 px-2 text-xs bg-slate-900 border border-slate-800 rounded text-slate-410 hover:text-white cursor-pointer"
                  >
                    Đóng
                  </button>
                </div>

                {/* Specific metrics */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Số điện thoại</span>
                    <p className="text-slate-200 mt-1 font-semibold">{currentCandidate.phone}</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Email</span>
                    <p className="text-slate-200 mt-1 font-semibold truncate">{currentCandidate.email}</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Điểm Hồ Sơ</span>
                    <p className="text-emerald-400 mt-1 font-bold font-mono text-sm">{currentCandidate.score} / 100 điểm</p>
                  </div>
                  <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Trạng thái</span>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      currentCandidate.status === "Không đạt"
                        ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                        : "bg-indigo-950 text-indigo-400"
                    }`}>
                      {currentCandidate.status}
                    </span>
                  </div>
                  
                  <div className="col-span-2 p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1.5 bg-violet-950/10">
                    <span className="text-[10px] text-violet-400 block uppercase font-bold tracking-wider">Cập nhật Loại Phỏng Vấn (Funnel)</span>
                    
                    {currentCandidate.interviewType === "ADD_NEW" ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="Nhập tên loại mới (nhấn Enter)..."
                          value={customTypeInput}
                          onChange={(e) => setCustomTypeInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = customTypeInput.trim();
                              if (val) {
                                if (!interviewTypes.includes(val)) {
                                  setInterviewTypes([...interviewTypes, val]);
                                }
                                setCandidates(prev => prev.map(c => c.id === currentCandidate.id ? { ...c, interviewType: val } : c));
                                setCustomTypeInput("");
                              }
                            }
                          }}
                          className="w-full bg-slate-950 text-xs px-2.5 py-1.5 rounded-lg border border-violet-500/50 text-slate-200 focus:outline-none focus:border-violet-400 transition"
                          autoFocus
                        />
                        <div className="flex space-x-2">
                          <button
                            type="button"
                            onClick={() => {
                              const val = customTypeInput.trim();
                              if (val) {
                                if (!interviewTypes.includes(val)) {
                                  setInterviewTypes([...interviewTypes, val]);
                                }
                                setCandidates(prev => prev.map(c => c.id === currentCandidate.id ? { ...c, interviewType: val } : c));
                                setCustomTypeInput("");
                              } else {
                                setCandidates(prev => prev.map(c => c.id === currentCandidate.id ? { ...c, interviewType: "Chưa lên lịch" } : c));
                              }
                            }}
                            className="px-3 py-1 bg-violet-600 hover:bg-violet-750 text-white rounded text-[10px] font-semibold cursor-pointer"
                          >
                            Xác nhận
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setCandidates(prev => prev.map(c => c.id === currentCandidate.id ? { ...c, interviewType: "Chưa lên lịch" } : c));
                              setCustomTypeInput("");
                            }}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] cursor-pointer"
                          >
                            Huỷ
                          </button>
                        </div>
                      </div>
                    ) : (
                      <select
                        value={currentCandidate.interviewType || "Chưa lên lịch"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCandidates(prev => prev.map(c => c.id === currentCandidate.id ? { ...c, interviewType: val } : c));
                          if (val === "ADD_NEW") {
                            setCustomTypeInput("");
                          }
                        }}
                        className="w-full bg-slate-950 text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 text-slate-200 focus:outline-none focus:border-violet-500 transition duration-150"
                      >
                        {interviewTypes.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                        <option value="ADD_NEW" className="text-violet-400 font-semibold">+ Thêm loại phỏng vấn mới...</option>
                      </select>
                    )}
                  </div>
                  
                  <div className="col-span-2 p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Ghi chú tuyển chọn</span>
                    <p className="text-slate-300 italic">"{currentCandidate.notes}"</p>
                  </div>
                </div>

                {/* AI Review Zone */}
                <div className="space-y-3 pt-4 border-t border-slate-800/60">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-violet-400 uppercase tracking-widest flex items-center space-x-1.5">
                      <Sparkles className="w-4 h-4 animate-spin-slow shrink-0" />
                      <span>Đánh Giá Hồ Sơ Bằng AI (Gemini)</span>
                    </h4>
                    
                    <button
                      onClick={() => handleAnalysCV(currentCandidate)}
                      disabled={analyzingId !== null}
                      className="px-3.5 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-semibold text-[10px] flex items-center space-x-1 hover:scale-103 duration-150 cursor-pointer shadow-lg glow-purple"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>{analyzingId === currentCandidate.id ? "AI Đang xử lý..." : "Bắt đầu Phân Tích"}</span>
                    </button>
                  </div>

                  {/* AI Output Area */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-violet-500/10 min-h-40 relative">
                    {analyzingId === currentCandidate.id ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
                        <div className="w-6 h-6 rounded-full border-2 border-dashed border-violet-500 animate-spin" />
                        <span className="text-[11px] text-violet-400 font-mono animate-pulse">AI đang phân tích kiến thức cứng & mềm...</span>
                      </div>
                    ) : aiAnalysis ? (
                      <div className="text-xs text-slate-300 space-y-2 leading-relaxed whitespace-pre-line overflow-y-auto max-h-[250px] font-sans">
                        {aiAnalysis}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center text-slate-500 py-10 space-y-2">
                        <HelpCircle className="w-8 h-8 text-slate-700" />
                        <p className="text-[11px]">Chưa có phân tích. Hãy nhấp "Bắt đầu Phân Tích" để Gemini kiểm duyệt hồ sơ ứng viên này.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding Workspace Section */}
                <div className="pt-5 border-t border-slate-800 space-y-4">
                  {onboardSuccess ? (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2 text-xs">
                      <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                        <CheckCircle className="w-4 h-4 animate-bounce" />
                        <span>Đã kích hoạt Onboarding thành công!</span>
                      </div>
                      <p className="text-slate-300">
                        Ứng viên <strong>{currentCandidate.name}</strong> đã chính thức gia nhập hệ thống với mã nhân viên <strong className="text-emerald-400 font-mono text-sm">{lastOnboardedCode}</strong>.
                      </p>
                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1 border-t border-slate-800 font-mono">
                        <div>✓ Hồ sơ hành chính đã tạo</div>
                        <div>✓ Hợp đồng lao động mẫu đã ký điện tử</div>
                        <div>✓ Bản ghi tính lương tháng 05/2026 đã sẵn sàng</div>
                      </div>
                    </div>
                  ) : !isOnboardOpen ? (
                    <div className="bg-[#12141c] border border-slate-850 p-4 rounded-2xl flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-bold text-white">Chuyển đổi thành nhân viên</h5>
                        <p className="text-[10px] text-slate-450">Phê duyệt tuyển dụng, khởi tạo hồ sơ, hợp đồng.</p>
                      </div>
                      <button
                        onClick={() => setIsOnboardOpen(true)}
                        className="px-3 py-2 bg-gradient-to-r from-emerald-605 to-teal-650 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 duration-150 cursor-pointer"
                      >
                        Bắt đầu Onboard
                      </button>
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-[#12141c] border border-emerald-500/30 p-4 rounded-2xl space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Cấu hình hồ sơ bổ nhiệm</span>
                        <button onClick={() => setIsOnboardOpen(false)} className="text-[10px] text-slate-400 hover:text-white cursor-pointer">Hủy</button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-450 block font-semibold uppercase">Phòng ban</label>
                          <select
                            value={onboardDept}
                            onChange={(e) => setOnboardDept(e.target.value)}
                            className="w-full bg-slate-950 font-medium text-white p-2 rounded-lg border border-slate-800"
                          >
                            <option value="Kỹ thuật">Kỹ thuật</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Kinh doanh">Kinh doanh</option>
                            <option value="Nhân sự">Nhân sự</option>
                            <option value="Tài chính">Tài chính</option>
                            <option value="Hành chính">Hành chính</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-455 block font-semibold uppercase">Loại Hợp đồng</label>
                          <select
                            value={onboardContractType}
                            onChange={(e) => setOnboardContractType(e.target.value)}
                            className="w-full bg-slate-950 font-medium text-white p-2 rounded-lg border border-slate-800 text-[10px]"
                          >
                            <option value="Xác định thời hạn (12 tháng)">HĐLĐ 12 tháng</option>
                            <option value="Xác định thời hạn (24 tháng)">HĐLĐ 24 tháng</option>
                            <option value="Không xác định thời hạn">HĐ vô thời hạn</option>
                          </select>
                        </div>

                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] text-slate-450 block font-semibold uppercase">Mức lương đề xuất (VNĐ)</label>
                          <input
                            type="number"
                            value={onboardSalary}
                            onChange={(e) => setOnboardSalary(Number(e.target.value))}
                            className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-800 font-mono text-center font-bold text-sm"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOnboardCandidate(currentCandidate)}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg active:scale-95 duration-150 cursor-pointer uppercase tracking-wider"
                      >
                        Xác nhận ký onboard & Tạo NV
                      </button>
                    </motion.div>
                  )}
                </div>

              </div>

              <div className="pt-4 border-t border-slate-800/60 text-center">
                <span className="text-[10px] text-slate-500">Người tác nghiệp: Lan Anh (HRM) — ID: {currentCandidate.id}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Candidate Registration Dialog */}
      <AnimatePresence>
        {isOpenForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-indigo-650 text-white rounded-xl">
                    <Network className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-md font-bold text-white">Thêm ứng viên ứng tuyển</h3>
                    <p className="text-[10px] text-slate-400">Ghi nhận thông tin ứng hồ sơ ban đầu</p>
                  </div>
                </div>
                <button onClick={() => setIsOpenForm(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCandidate} className="p-5 space-y-4">
                {formError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-400/10 border border-red-500/20 rounded-xl text-red-400 text-xs flex items-center space-x-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </motion.div>
                )}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium font-sans">Tên ứng viên *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Đào Khánh Hà"
                    value={candName}
                    onChange={(e) => setCandName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Vị trí ứng tuyển *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Python DevOps Lead"
                    value={candPos}
                    onChange={(e) => setCandPos(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="VD: 0912xxxxxx"
                      value={candPhone}
                      onChange={(e) => setCandPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 font-medium">Điểm phỏng vấn (0-100)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={candScore}
                      onChange={(e) => setCandScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium font-sans">Email ứng tuyển</label>
                  <input
                    type="email"
                    placeholder="VD: khanbha@outlook.com"
                    value={candEmail}
                    onChange={(e) => setCandEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium font-sans">Loại phỏng vấn</label>
                  {candInterviewType === "ADD_NEW" ? (
                    <div className="space-y-2 mt-1">
                      <input
                        type="text"
                        placeholder="Nhập tên loại phỏng vấn mới (nhấn Enter)..."
                        value={customNewTypeForForm}
                        onChange={(e) => setCustomNewTypeForForm(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const val = customNewTypeForForm.trim();
                            if (val) {
                              if (!interviewTypes.includes(val)) {
                                setInterviewTypes([...interviewTypes, val]);
                              }
                              setCandInterviewType(val);
                              setCustomNewTypeForForm("");
                            }
                          }
                        }}
                        className="w-full px-3 py-1.5 bg-slate-905 border border-violet-500/50 rounded-lg text-white text-xs focus:outline-none"
                        autoFocus
                      />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            const val = customNewTypeForForm.trim();
                            if (val) {
                              if (!interviewTypes.includes(val)) {
                                setInterviewTypes([...interviewTypes, val]);
                              }
                              setCandInterviewType(val);
                              setCustomNewTypeForForm("");
                            } else {
                              setCandInterviewType("Chưa lên lịch");
                            }
                          }}
                          className="px-2.5 py-1 bg-violet-600 hover:bg-violet-750 text-white rounded text-[10px] font-semibold cursor-pointer"
                        >
                          Xác nhận
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCandInterviewType("Chưa lên lịch");
                            setCustomNewTypeForForm("");
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-[10px] cursor-pointer"
                        >
                          Huỷ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <select
                      value={candInterviewType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setCandInterviewType(val);
                        if (val === "ADD_NEW") {
                          setCustomNewTypeForForm("");
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    >
                      {interviewTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                      <option value="ADD_NEW" className="text-violet-400 font-semibold">+ Thêm loại phỏng vấn mới...</option>
                    </select>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Ghi chú tóm tắt profile</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Có kinh nghiệm viết shell script, làm việc on-site 2 năm Singapore..."
                    value={candNotes}
                    onChange={(e) => setCandNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/50 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsOpenForm(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-lg glow-purple"
                  >
                    Lưu hồ sơ
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
