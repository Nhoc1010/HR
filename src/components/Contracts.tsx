/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Search, 
  Plus, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  History, 
  X, 
  PenTool,
  TrendingUp,
  Award
} from "lucide-react";
import { Employee, Contract } from "../types";

interface ContractsProps {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  contracts: Contract[];
  setContracts: Dispatch<SetStateAction<Contract[]>>;
}

export default function Contracts({ employees, setEmployees, contracts, setContracts }: ContractsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("Tất cả");
  const [selectedStatus, setSelectedStatus] = useState("Tất cả");
  
  // Interactive Renew state
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [newType, setNewType] = useState<any>("Không xác định thời hạn");
  const [newEndDate, setNewEndDate] = useState("Vô thời hạn");
  const [newSalary, setNewSalary] = useState(25000000);
  const [newAllowance, setNewAllowance] = useState(2000000);
  const [renewNote, setRenewNote] = useState("Gia hạn và điều chỉnh lương định kỳ");

  // History detail viewer
  const [selectedContractHistory, setSelectedContractHistory] = useState<Contract | null>(null);

  // New Contract creation state
  const [isCreating, setIsCreating] = useState(false);
  const [newContractEmpId, setNewContractEmpId] = useState("");
  const [newContractType, setNewContractType] = useState<any>("Xác định thời hạn (12 tháng)");
  const [newContractStartDate, setNewContractStartDate] = useState("2026-06-01");
  const [newContractEndDate, setNewContractEndDate] = useState("2027-06-01");
  const [newContractSalary, setNewContractSalary] = useState(15000000);
  const [newContractAllowance, setNewContractAllowance] = useState(1000000);

  // Filter & Search logic
  const filteredContracts = contracts.filter((c) => {
    const matchesSearch = 
      c.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "Tất cả" || c.type === selectedType;
    const matchesStatus = selectedStatus === "Tất cả" || c.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // KPI Calculations
  const activeCount = contracts.filter(c => c.status === "Đang hiệu lực").length;
  const expiredCount = contracts.filter(c => c.status === "Hết hạn").length;
  const renewalPendingCount = contracts.filter(c => c.status === "Chờ gia hạn").length;

  const handleRenewSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!renewingContract) return;

    // 1. Create renewal history entry
    const timestamp = new Date().toISOString().split('T')[0];
    const newHistoryEntry = {
      date: timestamp,
      action: "Gia hạn hợp đồng",
      note: `${renewNote} - Mức lương mới: ${newSalary.toLocaleString()} VND, Phụ cấp: ${newAllowance.toLocaleString()} VND, Loại hđ: ${newType}`
    };

    // 2. Update contract list
    const updatedContracts = contracts.map(c => {
      if (c.id === renewingContract.id) {
        return {
          ...c,
          type: newType,
          endDate: newEndDate,
          basicSalary: newSalary,
          allowance: newAllowance,
          status: "Đang hiệu lực" as const,
          history: [...(c.history || []), newHistoryEntry]
        };
      }
      return c;
    });
    setContracts(updatedContracts);

    // 3. Keep Employee Table updated in sync!
    const updatedEmployees = employees.map(emp => {
      if (emp.id === renewingContract.employeeId) {
        return {
          ...emp,
          contractType: newType,
          salary: newSalary,
          status: "Đang làm" as const
        };
      }
      return emp;
    });
    setEmployees(updatedEmployees);

    // Close Renew Screen
    setRenewingContract(null);
  };

  const handleCreateSubmit = (e: FormEvent) => {
    e.preventDefault();
    const targetedEmp = employees.find(emp => emp.id === newContractEmpId);
    if (!targetedEmp) return;

    const newId = `con0${contracts.length + 1}`;
    const newContractRecord: Contract = {
      id: newId,
      employeeId: targetedEmp.id,
      employeeName: targetedEmp.name,
      type: newContractType,
      startDate: newContractStartDate,
      endDate: newContractType === "Không xác định thời hạn" ? "Vô thời hạn" : newContractEndDate,
      basicSalary: newContractSalary,
      allowance: newContractAllowance,
      status: "Đang hiệu lực",
      history: [
        { date: newContractStartDate, action: "Ký kết mới", note: "Khởi tạo hợp đồng chính thức thông qua hệ thống quản lý PC" }
      ]
    };

    setContracts([newContractRecord, ...contracts]);

    // Update corresponding employee
    setEmployees(employees.map(emp => {
      if (emp.id === targetedEmp.id) {
        return {
          ...emp,
          contractType: newContractType,
          salary: newContractSalary,
          contractStartDate: newContractStartDate
        };
      }
      return emp;
    }));

    setIsCreating(false);
    setNewContractEmpId("");
  };

  const handleOpenRenew = (con: Contract) => {
    setRenewingContract(con);
    setNewType(con.type);
    setNewEndDate(con.endDate === "Vô thời hạn" ? "2027-12-31" : con.endDate);
    setNewSalary(con.basicSalary);
    setNewAllowance(con.allowance);
    setRenewNote("Gia hạn điều chỉnh định kỳ tăng bậc");
  };

  return (
    <div className="space-y-6 select-text">
      {/* Header Panel */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Hợp đồng lao động</h1>
          <p className="text-white/45 text-sm mt-1">Đồng bộ tự động thông tin pháp lý, loại hợp đồng và điều khoản phúc lợi</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer glow-purple"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm hợp đồng</span>
        </button>
      </header>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Hợp đồng hoạt động</span>
            <p className="text-2xl font-mono font-bold text-emerald-400">{activeCount}</p>
            <p className="text-xs text-white/55">Đang kích hoạt hiệu lực</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Chờ gia hạn</span>
            <p className="text-2xl font-mono font-bold text-amber-400">{renewalPendingCount}</p>
            <p className="text-xs text-white/55">Sắp hết hạn trong tháng</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Hết hạn hiệu lực</span>
            <p className="text-2xl font-mono font-bold text-rose-400">{expiredCount}</p>
            <p className="text-xs text-white/55">Yêu cầu can thiệp bổ sung</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider">Lương trung bình</span>
            <p className="text-2xl font-mono font-bold text-violet-400">
              {(contracts.length > 0 
                ? Math.round(contracts.reduce((acc, c) => acc + c.basicSalary, 0) / contracts.length) 
                : 0).toLocaleString()} <span className="text-xs">đ</span>
            </p>
            <p className="text-xs text-white/55">Chưa gồm phúc lợi phụ cấp</p>
          </div>
          <div className="p-2.5 rounded-lg bg-violet-600/20 text-violet-400">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên, mã hợp đồng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 text-xs"
          />
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-[#161920] border border-white/10 rounded-xl text-white text-xs select-none focus:outline-none"
          >
            <option value="Tất cả">Tất cả loại HĐ</option>
            <option value="Không xác định thời hạn">Không thời hạn</option>
            <option value="Xác định thời hạn (12 tháng)">Thời hạn 12 tháng</option>
            <option value="Xác định thời hạn (24 tháng)">Thời hạn 24 tháng</option>
            <option value="Thử việc">Thử việc</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-[#161920] border border-white/10 rounded-xl text-white text-xs select-none focus:outline-none"
          >
            <option value="Tất cả">Tất cả trạng thái</option>
            <option value="Đang hiệu lực">Đang hiệu lực</option>
            <option value="Chờ gia hạn">Chờ gia hạn</option>
            <option value="Hết hạn">Hết hạn</option>
          </select>
        </div>
      </div>

      {/* Main Table List */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white/80">
            <thead className="bg-white/5 text-white/50 uppercase tracking-wider font-mono text-[10px] border-b border-white/5">
              <tr>
                <th className="px-6 py-4">Mã HĐ / Nhân viên</th>
                <th className="px-6 py-4">Loại hợp đồng</th>
                <th className="px-4 py-4">Thời hạn</th>
                <th className="px-6 py-4 text-right">Lương cơ bản</th>
                <th className="px-6 py-4 text-right">Phụ cấp</th>
                <th className="px-6 py-4 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContracts.map((con) => (
                <tr key={con.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/60">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-bold text-white group-hover:text-violet-450">{con.employeeName}</p>
                        <span className="text-[10px] font-mono text-[#A855F7]">{con.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{con.type}</span>
                  </td>
                  <td className="px-4 py-4 font-mono text-white/60">
                    <div className="flex flex-col gap-0.5">
                      <span>{con.startDate}</span>
                      <span className="text-[10px] opacity-50">đến {con.endDate}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white font-medium">
                    {con.basicSalary.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-white/75">
                    +{con.allowance.toLocaleString()}đ
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      con.status === "Đang hiệu lực"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : con.status === "Chờ gia hạn"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    }`}>
                      {con.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenRenew(con)}
                        className="p-1.5 hover:bg-violet-600/20 hover:text-violet-400 rounded-lg transition-all text-white/55 flex items-center gap-1 cursor-pointer"
                        title="Gia hạn hợp đồng"
                      >
                        <PenTool className="w-3.5 h-3.5" />
                        <span>Gia hạn</span>
                      </button>
                      
                      <button
                        onClick={() => setSelectedContractHistory(con)}
                        className="p-1.5 hover:bg-white/5 rounded-lg transition-all text-white/40 hover:text-white cursor-pointer"
                        title="Xem lịch sử thay đổi"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredContracts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-white/30 font-mono">
                    <AlertTriangle className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    Không có bản ghi liên quan nào khả dụng
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Renew Modal */}
      <AnimatePresence>
        {renewingContract && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161920] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-400">
                  <Award className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">Gia hạn hợp đồng: {renewingContract.employeeName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRenewingContract(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRenewSubmit} className="p-6 space-y-4 text-xs font-medium">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Loại hợp đồng mới *</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Không xác định thời hạn">Không thời hạn</option>
                      <option value="Xác định thời hạn (12 tháng)">Thời hạn 12 tháng</option>
                      <option value="Xác định thời hạn (24 tháng)">Thời hạn 24 tháng</option>
                      <option value="Thử việc">Thử việc</option>
                    </select>
                  </div>

                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Hạn hợp đồng (Gia hạn) *</label>
                    <input
                      type="text"
                      value={newEndDate}
                      onChange={(e) => setNewEndDate(e.target.value)}
                      placeholder="YYYY-MM-DD hoặc Vô thời hạn"
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Lương cơ bản đề xuất (VND) *</label>
                    <input
                      type="number"
                      value={newSalary}
                      onChange={(e) => setNewSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Phụ cấp đóng hành chính (VND) *</label>
                    <input
                      type="number"
                      value={newAllowance}
                      onChange={(e) => setNewAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/50">Ghi chú quyết định gia hạn *</label>
                  <textarea
                    rows={3}
                    value={renewNote}
                    onChange={(e) => setRenewNote(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none font-sans"
                    placeholder="Nhập lý do nâng lương hoặc thay đổi điều khoản làm việc..."
                  />
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRenewingContract(null)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-white/80 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold cursor-pointer glow-purple shadow-lg"
                  >
                    Lưu & Đồng bộ thông tin
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* History Detail Viewer Modal */}
      <AnimatePresence>
        {selectedContractHistory && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161920] border border-white/10 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-sm">Nhật ký hợp đồng: {selectedContractHistory.employeeName}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedContractHistory(null)}
                  className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    {(selectedContractHistory.history || []).map((his, idx) => (
                      <li key={idx} className="relative pb-8 text-xs">
                        {idx !== (selectedContractHistory.history || []).length - 1 && (
                          <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true" />
                        )}
                        <div className="relative flex space-x-3 items-start">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                              <FileText className="w-4 h-4" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-white font-semibold">{his.action}</p>
                              <p className="text-white/60 font-sans mt-1 leading-relaxed">{his.note}</p>
                            </div>
                            <div className="text-right text-[10px] text-white/30 font-mono shrink-0">
                              {his.date}
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end">
                  <button
                    onClick={() => setSelectedContractHistory(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs cursor-pointer"
                  >
                    Đóng lại
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Contract Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#161920] border border-white/10 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-400">
                  <PenTool className="w-5 h-5" />
                  <h3 className="font-bold text-white text-base">Soạn thảo hợp đồng lao động mới</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs font-medium">
                <div className="space-y-1.5">
                  <label className="text-white/50">Nhân viên đích *</label>
                  <select
                    value={newContractEmpId}
                    onChange={(e) => setNewContractEmpId(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                  >
                    <option value="">-- Lựa chọn nhân viên chưa có hợp đồng chính thức --</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.code}) — {emp.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Mẫu hợp đồng pháp lý *</label>
                    <select
                      value={newContractType}
                      onChange={(e) => setNewContractType(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    >
                      <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                      <option value="Xác định thời hạn (12 tháng)">Xác định thời hạn (12 tháng)</option>
                      <option value="Xác định thời hạn (24 tháng)">Xác định thời hạn (24 tháng)</option>
                      <option value="Thử việc">Thử việc/Thời vụ</option>
                    </select>
                  </div>

                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Ngày ký kết bắt đầu *</label>
                    <input
                      type="date"
                      value={newContractStartDate}
                      onChange={(e) => setNewContractStartDate(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Lương cơ bản (VND) *</label>
                    <input
                      type="number"
                      value={newContractSalary}
                      onChange={(e) => setNewContractSalary(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>

                  <div className="col-span-1 space-y-1.5">
                    <label className="text-white/50">Phụ cấp chức vụ (VND)</label>
                    <input
                      type="number"
                      value={newContractAllowance}
                      onChange={(e) => setNewContractAllowance(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-white/50">Ngày hết hạn dự kiến *</label>
                  <input
                    type="text"
                    value={newContractEndDate}
                    onChange={(e) => setNewContractEndDate(e.target.value)}
                    placeholder="YYYY-MM-DD"
                    className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-xl text-white focus:outline-none"
                  />
                  <p className="text-[10px] text-white/30 italic">Lưu ý: Hợp đồng Không tính thời hạn sẽ tự chuyển thành "Vô thời hạn" khi lưu</p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-white/80 cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#A855F7] hover:bg-fuchsia-500 text-white rounded-xl font-bold cursor-pointer shadow-lg"
                  >
                    Tạo lập chính thức
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
