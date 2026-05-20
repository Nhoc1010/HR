/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
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
  ArrowRight
} from "lucide-react";
import { Candidate } from "../types";

interface RecruitmentProps {
  candidates: Candidate[];
  setCandidates: Dispatch<SetStateAction<Candidate[]>>;
}

export default function Recruitment({ candidates, setCandidates }: RecruitmentProps) {
  const [activeCandidateId, setActiveCandidateId] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  // New Candidate Form states
  const [isOpenForm, setIsOpenForm] = useState(false);
  const [candName, setCandName] = useState("");
  const [candPos, setCandPos] = useState("");
  const [candPhone, setCandPhone] = useState("");
  const [candEmail, setCandEmail] = useState("");
  const [candScore, setCandScore] = useState(80);
  const [candNotes, setCandNotes] = useState("");

  const stages: { id: "Ứng tuyển" | "Sàng lọc" | "Phỏng vấn" | "Đề nghị" | "Đã tuyển"; label: string; countColor: string }[] = [
    { id: "Ứng tuyển", label: "Ứng tuyển", countColor: "bg-blue-955 text-blue-400" },
    { id: "Sàng lọc", label: "Sàng lọc", countColor: "bg-amber-955 text-amber-400" },
    { id: "Phỏng vấn", label: "Phỏng vấn", countColor: "bg-violet-955 text-violet-400" },
    { id: "Đề nghị", label: "Đề nghị", countColor: "bg-fuchsia-955 text-fuchsia-400" },
    { id: "Đã tuyển", label: "Đã tuyển", countColor: "bg-emerald-955 text-emerald-400" },
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
      alert("Vui lòng điền tên ứng viên và vị trí tuyển dụng!");
      return;
    }

    const payload: Candidate = {
      id: `cand-${Date.now()}`,
      name: candName,
      position: candPos,
      phone: candPhone || "Đang bổ sung",
      email: candEmail || "—",
      status: "Ứng tuyển",
      score: Number(candScore) || 70,
      notes: candNotes || "Hồ sơ nộp qua cổng tuyển dụng."
    };

    setCandidates([...candidates, payload]);
    setIsOpenForm(false);
    setCandName("");
    setCandPos("");
    setCandPhone("");
    setCandEmail("");
    setCandScore(80);
    setCandNotes("");
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Quy trình tuyển dụng (Funnel)</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý kênh ứng viên, xem xét phân tích CV và đánh giá chất lượng đầu vào.</p>
        </div>
        <button
          onClick={() => setIsOpenForm(true)}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 cursor-pointer glow-purple shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm ứng viên ứng tuyển</span>
        </button>
      </div>

      {/* Kanban Stages Funnel Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((st) => {
          const stCandidates = candidates.filter(c => c.status === st.id);
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
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-400 rounded-full font-bold">
                      {currentCandidate.status}
                    </span>
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
