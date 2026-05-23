/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Sparkles, 
  AlertCircle,
  Clock,
  Briefcase,
  Edit2
} from "lucide-react";
import { Employee, LeaveRequest } from "../types";

interface LeaveManagementProps {
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  setLeaveRequests: Dispatch<SetStateAction<LeaveRequest[]>>;
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
}

export default function LeaveManagement({ 
  employees, 
  leaveRequests, 
  setLeaveRequests, 
  setEmployees 
}: LeaveManagementProps) {
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [startDate, setStartDate] = useState("2026-05-20");
  const [endDate, setEndDate] = useState("2026-05-21");
  const [reason, setReason] = useState("");
  const [leaveType, setLeaveType] = useState<"Phép năm" | "Nghỉ ốm" | "Việc riêng" | "Thai sản">("Phép năm");
  const [tempStatus, setTempStatus] = useState<"Chờ duyệt" | "Đã duyệt" | "Bị từ chối">("Chờ duyệt");
  const [formError, setFormError] = useState<string | null>(null);

  // Leave action
  const handleDecideLeave = (id: string, decision: "Đã duyệt" | "Bị từ chối") => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        // If approved, update associated employee status to "Nghỉ phép"
        if (decision === "Đã duyệt") {
          setEmployees(empList => empList.map(e => e.id === req.employeeId ? { ...e, status: "Nghỉ phép" } : e));
        } else if (req.status === "Đã duyệt" && decision === "Bị từ chối") {
          setEmployees(empList => empList.map(e => e.id === req.employeeId && e.status === "Nghỉ phép" ? { ...e, status: "Đang làm" } : e));
        }
        return { ...req, status: decision };
      }
      return req;
    }));
  };

  const handleEditClick = (req: LeaveRequest) => {
    setEditingRequest(req);
    setSelectedEmpId(req.employeeId);
    setStartDate(req.startDate);
    setEndDate(req.endDate);
    setLeaveType(req.type);
    setReason(req.reason);
    setTempStatus(req.status);
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleCreateRequest = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !reason) {
      setFormError("Vui lòng điền đầy đủ thông tin yêu cầu!");
      return;
    }
    setFormError(null);

    const emp = employees.find(x => x.id === selectedEmpId);
    if (!emp) return;

    if (editingRequest) {
      const oldEmpId = editingRequest.employeeId;
      const oldStatus = editingRequest.status;
      const newEmpId = emp.id;
      const newStatus = tempStatus;

      setEmployees(empList => empList.map(e => {
        let status = e.status;
        if (e.id === oldEmpId && oldStatus === "Đã duyệt") {
          if (oldEmpId !== newEmpId || newStatus !== "Đã duyệt") {
            if (status === "Nghỉ phép") status = "Đang làm";
          }
        }
        if (e.id === newEmpId && newStatus === "Đã duyệt") {
          status = "Nghỉ phép";
        }
        return { ...e, status };
      }));

      setLeaveRequests(prev => prev.map(req => {
        if (req.id === editingRequest.id) {
          return {
            ...req,
            employeeId: emp.id,
            employeeName: emp.name,
            startDate: startDate,
            endDate: endDate,
            reason: reason,
            type: leaveType,
            status: tempStatus
          };
        }
        return req;
      }));
      setEditingRequest(null);
    } else {
      const newRequest: LeaveRequest = {
        id: `lr-${Date.now()}`,
        employeeId: emp.id,
        employeeName: emp.name,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        type: leaveType,
        status: tempStatus
      };

      if (tempStatus === "Đã duyệt") {
        setEmployees(empList => empList.map(e => e.id === emp.id ? { ...e, status: "Nghỉ phép" } : e));
      }

      setLeaveRequests([newRequest, ...leaveRequests]);
    }

    setIsFormOpen(false);
    setSelectedEmpId("");
    setReason("");
    setTempStatus("Chờ duyệt");
  };

  // Stats
  const activePendingCount = leaveRequests.filter(l => l.status === "Chờ duyệt").length;
  const totalApprovedCount = leaveRequests.filter(l => l.status === "Đã duyệt").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Quản lý nghỉ phép</h1>
          <p className="text-slate-400 text-sm mt-1">Quản lý chế độ nghỉ lễ phép và xem xét duyệt đơn vắng mặt của nhân viên.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsFormOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 cursor-pointer glow-purple shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Tự tạo đơn nghỉ phép</span>
        </button>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        <div className="p-5 bg-gradient-to-br from-indigo-950/20 to-slate-900 border border-indigo-900/30 rounded-2xl">
          <div className="flex items-center space-x-3 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Clock className="w-4 h-4" />
            <span>Đơn Chờ duyệt</span>
          </div>
          <p className="text-3xl font-display font-bold text-white font-mono">{activePendingCount} đơn</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Yêu cầu xin nghỉ phép cần ban nhân sự xem xét phê duyệt.</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-emerald-950/20 to-slate-900 border border-emerald-950/30 rounded-2xl">
          <div className="flex items-center space-x-3 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>Đã Phê duyệt</span>
          </div>
          <p className="text-3xl font-display font-bold text-white font-mono">{totalApprovedCount} đơn</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Yêu cầu đã được thông qua và ghi nhận lên lịch làm việc.</span>
        </div>

        <div className="p-5 bg-gradient-to-br from-purple-950/20 to-slate-900 border border-purple-950/30 rounded-2xl">
          <div className="flex items-center space-x-3 text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Calendar className="w-4 h-4" />
            <span>Chế độ phép chuẩn</span>
          </div>
          <p className="text-3xl font-display font-bold text-white font-mono">12 ngày / năm</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Hạn mức nghỉ phép hưởng nguyên lương mặc định hằng năm.</span>
        </div>

      </div>

      {/* Leave Board List */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-white tracking-tight flex items-center space-x-2">
          <span>Hộp thư xét duyệt đơn nghỉ phép</span>
        </h3>

        <div className="space-y-4">
          <AnimatePresence>
            {leaveRequests.map((req) => (
              <motion.div
                key={req.id}
                layout
                id={`leave-item-${req.id}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`p-5 rounded-2xl border ${
                  req.status === "Chờ duyệt" 
                    ? "bg-slate-950 border-amber-500/20 glow-amber" 
                    : req.status === "Đã duyệt"
                      ? "bg-slate-950/55 border-slate-850"
                      : "bg-slate-950/40 border-slate-900"
                } flex flex-col md:flex-row md:items-center justify-between gap-4`}
              >
                <div className="space-y-2 max-w-xl">
                  {/* Name and badge type */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-white">{req.employeeName}</span>
                    <span className="text-[10px] bg-slate-800 text-indigo-400 px-2 py-0.5 rounded font-mono font-bold">
                      {req.type}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      req.status === "Chờ duyệt" 
                        ? "bg-amber-500/10 text-amber-400" 
                        : req.status === "Đã duyệt"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  {/* Date ranges and reason */}
                  <p className="text-xs text-slate-450 font-mono">
                    Thời gian nghỉ: <strong className="text-slate-300">{req.startDate}</strong> đến <strong className="text-slate-300">{req.endDate}</strong>
                  </p>
                  
                  <blockquote className="text-xs text-slate-405 italic bg-slate-900/40 p-2.5 rounded-xl border-l-2 border-slate-800">
                    "{req.reason}"
                  </blockquote>
                </div>

                 {/* Approve Decides or Edit Buttons */}
                <div className="flex items-center space-x-2 shrink-0 md:self-center">
                  {req.status === "Chờ duyệt" ? (
                    <>
                      <button
                        onClick={() => handleDecideLeave(req.id, "Bị từ chối")}
                        className="px-4 py-2 border border-slate-800 hover:border-red-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold rounded-lg shrink-0 transition-colors cursor-pointer"
                      >
                        Từ chối
                      </button>
                      <button
                        onClick={() => handleDecideLeave(req.id, "Đã duyệt")}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer shadow-lg hover:scale-103"
                      >
                        Phê duyệt đơn
                      </button>
                      <button
                        onClick={() => handleEditClick(req)}
                        className="p-2 border border-slate-800 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-all cursor-pointer flex items-center justify-center"
                        title="Chỉnh sửa đơn"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEditClick(req)}
                      className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-300 hover:text-violet-400 text-xs font-semibold rounded-lg shrink-0 transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Điều chỉnh đơn</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {leaveRequests.length === 0 && (
            <div className="py-16 text-center text-slate-500 border border-dashed border-slate-800 rounded-2xl">
              <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-700 font-normal" />
              <p>Hộp thư duyệt phép trống rỗng</p>
            </div>
          )}
        </div>
      </div>

      {/* Leave Application Dialog */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="p-2 bg-indigo-650 text-white rounded-xl">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-md font-bold text-white">
                      {editingRequest ? "Cập Nhật & Điều Chỉnh Đơn Nghỉ Phép" : "Lập Đơn Đăng Ký Nghỉ Phép"}
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {editingRequest ? "Chỉnh sửa thông tin đơn và trạng thái phê duyệt." : "Tạo đơn nghỉ nhanh cho nhân viên đã xin trực tiếp."}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingRequest(null);
                  }} 
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRequest} className="p-5 space-y-4">
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
                  <label className="text-xs text-slate-400">Chọn Nhân Viên ứng đơn *</label>
                  <select
                    required
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="">-- Chọn nhân viên --</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.code}) — {e.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Từ ngày</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-805 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Đến ngày</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-805 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Loại phép nghỉ</label>
                  <select
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-905 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="Phép năm">Nghỉ Phép năm</option>
                    <option value="Nghỉ ốm">Nghỉ ốm (Có BHXH)</option>
                    <option value="Việc riêng">Nghỉ việc riêng (Không lương)</option>
                    <option value="Thai sản">Nghỉ Thai sản</option>
                  </select>
                </div>

                {/* Status Options for fine-grained editing */}
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Trạng thái phê duyệt *</label>
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-905 border border-slate-850 rounded-xl text-white text-sm focus:outline-none focus:border-violet-500"
                  >
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã duyệt">Đã duyệt (Phê duyệt)</option>
                    <option value="Bị từ chối">Bị từ chối</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Lý do xin phép *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="VD: Nghỉ ốm đi bệnh viện chụp phim điều trị..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-850 rounded-xl text-white text-xs focus:outline-none focus:border-violet-500"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800/50 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingRequest(null);
                    }}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-lg glow-purple"
                  >
                    {editingRequest ? "Cập nhật đơn" : "Gửi yêu cầu"}
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
