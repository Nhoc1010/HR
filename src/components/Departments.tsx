/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, useMemo, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building, 
  Users, 
  TrendingUp, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Phone, 
  Shield, 
  Check, 
  Briefcase, 
  Search, 
  AlertCircle,
  Clock,
  DollarSign,
  Sparkles
} from "lucide-react";
import { Employee } from "../types";

interface DepartmentsProps {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
  depts: string[];
  setDepts: (newDepts: string[] | ((prev: string[]) => string[])) => void;
}

export default function Departments({
  employees,
  setEmployees,
  depts,
  setDepts
}: DepartmentsProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newDeptName, setNewDeptName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit / Rename states
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [editError, setEditError] = useState<string | null>(null);

  // Selected Department for detailed list & expansion
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  const handleAddSampleDepts = () => {
    const list = [
      "Quản lý chất lượng (QA/QC)",
      "Chăm sóc khách hàng (CS)",
      "Nghiên cứu & Đối ngoại",
      "Đào tạo & Phát triển (L&D)",
      "Hành chính & Pháp chế",
      "Kế hoạch & Chuỗi cung ứng",
      "Công nghệ thông tin (IT)"
    ];
    const updated = [...depts];
    let count = 0;
    list.forEach(item => {
      if (!depts.some(d => d.toLowerCase() === item.toLowerCase())) {
        updated.push(item);
        count++;
      }
    });
    if (count > 0) {
      setDepts(updated);
      setSuccessMessage(`Đã thêm thành công nhóm ${count} phòng ban chuyên nghiệp vào sơ đồ cơ cấu!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } else {
      setSuccessMessage("Tất cả các phòng ban phòng mẫu bổ sung đã có sẵn trong danh sách của bạn.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Calculate detailed stats per department
  const deptStats = useMemo(() => {
    return depts.map(d => {
      const deptEmployees = employees.filter(e => e.department === d);
      const totalCount = deptEmployees.length;
      
      const maleCount = deptEmployees.filter(e => e.gender === "Nam").length;
      const femaleCount = deptEmployees.filter(e => e.gender === "Nữ").length;
      const malePercentage = totalCount > 0 ? Math.round((maleCount / totalCount) * 100) : 0;
      const femalePercentage = totalCount > 0 ? Math.round((femaleCount / totalCount) * 100) : 0;

      const totalSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
      const avgSalary = totalCount > 0 ? Math.round(totalSalary / totalCount) : 0;

      const activeCount = deptEmployees.filter(e => e.status === "Đang làm").length;
      const leaveCount = deptEmployees.filter(e => e.status === "Nghỉ phép").length;

      return {
        name: d,
        count: totalCount,
        malePercentage,
        femalePercentage,
        avgSalary,
        totalSalary,
        activeCount,
        leaveCount,
        members: deptEmployees
      };
    });
  }, [depts, employees]);

  // Overall calculations
  const totalEmployeesWithDept = employees.filter(e => e.department && depts.includes(e.department)).length;
  
  const topDept = useMemo(() => {
    if (deptStats.length === 0) return null;
    return [...deptStats].sort((a, b) => b.count - a.count)[0];
  }, [deptStats]);

  const avgEmployeesPerDept = useMemo(() => {
    if (depts.length === 0) return 0;
    return (totalEmployeesWithDept / depts.length).toFixed(1);
  }, [depts, totalEmployeesWithDept]);

  const totalMonthlySalaryAllocated = useMemo(() => {
    return employees.reduce((sum, e) => sum + e.salary, 0);
  }, [employees]);

  // Handle department creation
  const handleCreateDept = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptName.trim();
    if (!trimmed) {
      setCreateError("Tên phòng ban không được bỏ trống!");
      return;
    }
    const exists = depts.some(d => d.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setCreateError("Phòng ban có tên này đã tồn tại!");
      return;
    }

    setDepts([...depts, trimmed]);
    setNewDeptName("");
    setCreateError(null);
    setIsCreateModalOpen(false);
  };

  // Handle department renaming
  const handleRenameDept = (index: number) => {
    const trimmed = editingValue.trim();
    if (!trimmed) {
      setEditError("Tên phòng ban không được để trống!");
      return;
    }

    const oldName = depts[index];
    if (oldName === trimmed) {
      setEditingIndex(null);
      setEditError(null);
      return;
    }

    const exists = depts.some((d, idx) => idx !== index && d.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setEditError("Tên phòng ban này đã tồn tại!");
      return;
    }

    // Rename
    const updated = [...depts];
    updated[index] = trimmed;
    setDepts(updated);

    // Sync all employees with the renamed department
    setEmployees(prev => prev.map(emp => {
      if (emp.department === oldName) {
        return { ...emp, department: trimmed };
      }
      return emp;
    }));

    setEditingIndex(null);
    setEditError(null);
  };

  // Handle department deletion
  const handleDeleteDept = (index: number) => {
    const name = depts[index];
    const hasEmployees = employees.some(emp => emp.department === name);
    if (hasEmployees) {
      alert(`Không thể xóa phòng ban "${name}" vì vẫn tồn tại ${employees.filter(emp => emp.department === name).length} nhân sự đang trực thuộc. Vui lòng chuyển các nhân viên này sang phòng ban khác trước!`);
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa phòng ban "${name}"?`)) {
      setDepts(depts.filter((_, idx) => idx !== index));
      if (expandedDept === name) {
        setExpandedDept(null);
      }
    }
  };

  // Filtered department statistics block
  const filteredDeptStats = deptStats.filter(stat => 
    stat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Header section styled elegantly */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Sơ đồ cơ cấu Phòng ban</h1>
          <p className="text-white/45 text-sm mt-1">
            Thiết kế sơ đồ đơn vị, theo dõi quỹ lương, phân chia định biên & thông số kỹ trị nhân sự
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleAddSampleDepts}
            className="px-4 py-2.5 bg-slate-900 border border-white/5 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
            title="Thêm các phòng ban mẫu bổ sung"
          >
            <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
            <span>Thêm phòng mẫu</span>
          </button>
          <button
            onClick={() => {
              setCreateError(null);
              setNewDeptName("");
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer glow-purple"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm phòng ban</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-[#161920] border border-violet-500/20 rounded-2xl flex items-center space-x-3 shadow-lg animate-blur"
          >
            <div className="p-1.5 rounded-lg bg-violet-600/20 text-violet-400">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <p className="text-xs text-slate-300 font-medium leading-relaxed">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-white/40 block mb-1">Số phòng ban hiện hữu</span>
            <span className="text-3xl font-display font-black text-white">{depts.length}</span>
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />
              <span>Cơ cấu ổn định</span>
            </span>
          </div>
          <div className="p-3 bg-violet-500/10 text-violet-400 border border-violet-500/10 rounded-xl">
            <Building className="w-5 h-5" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-white/40 block mb-1">Tổng nhân sự phân bổ</span>
            <span className="text-3xl font-display font-black text-white">{totalEmployeesWithDept}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Trên tổng {employees.length} nhân sự</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-white/40 block mb-1">Đơn vị đông nhất</span>
            <span className="text-lg font-bold text-white block truncate max-w-[150px] mt-1" title={topDept?.name}>
              {topDept ? topDept.name : "N/A"}
            </span>
            <span className="text-xs font-mono text-violet-400 block mt-0.5">
              {topDept ? `${topDept.count} nhân viên` : "Chưa có"}
            </span>
          </div>
          <div className="p-3 bg-pink-500/10 text-pink-400 border border-pink-500/10 rounded-xl">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="card-3d p-6 rounded-2xl flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-white/40 block mb-1">Tỷ lệ bình quân phòng</span>
            <span className="text-3xl font-display font-black text-white">{avgEmployeesPerDept}</span>
            <span className="text-[10px] text-zinc-500 block mt-1">Nhân viên / phòng ban</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/10 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics - SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SVG Bar Chart: Staff Headcount */}
        <div className="glass-panel border border-white/5 p-6 rounded-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">Quy mô nhân sự các phòng ban</h3>
              <p className="text-[10px] text-white/40">Phân bố định biên nhân sự chi tiết từng khối ban</p>
            </div>
            <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-mono text-slate-400">
              Nhân sự
            </span>
          </div>

          <div className="h-[240px] flex flex-col justify-between">
            <div className="flex-1 flex items-end gap-3 md:gap-6 px-2 pt-4 border-b border-white/10 pb-1">
              {deptStats.map((stat, idx) => {
                const maxCount = Math.max(...deptStats.map(s => s.count), 5);
                const heightPercent = stat.count > 0 ? (stat.count / maxCount) * 100 : 5;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full mb-2 bg-slate-950 border border-slate-800 rounded-xl p-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-30 min-w-[150px] shadow-2xl text-left">
                      <p className="text-xs font-bold text-white">{stat.name}</p>
                      <p className="text-[10px] text-violet-400 font-medium">Nhân sự: {stat.count} người ({Math.round(stat.count / (totalEmployeesWithDept || 1) * 100)}%)</p>
                      <p className="text-[10px] text-emerald-400 mt-1">Quỹ lương: {(stat.totalSalary / 1000000).toFixed(1)}M đ</p>
                    </div>

                    {/* Bar Pillar */}
                    <div className="w-full relative rounded-t-lg overflow-hidden flex flex-col justify-end transition-all duration-300 group-hover:scale-105" style={{ height: `${heightPercent}%` }}>
                      <div className="absolute inset-x-0 top-0 bottom-0 bg-gradient-to-t from-violet-600/30 to-violet-500 rounded-t-lg" />
                      <div className="absolute top-0 inset-x-0 h-1 bg-violet-300 opacity-40" />
                    </div>

                    {/* Badge Counter */}
                    <span className="text-[10px] font-black text-white/60 group-hover:text-violet-400 font-mono mt-1.5 transition-colors">
                      {stat.count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Labels under Bars */}
            <div className="flex justify-between items-start gap-1 py-1 px-2">
              {deptStats.map((stat, idx) => (
                <div key={idx} className="flex-1 text-center font-sans">
                  <span className="text-[9px] text-[#A1A1AA] block leading-tight truncate rotate-[0deg] md:rotate-0" title={stat.name}>
                    {stat.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SVG Donut Chart: Budget Allocation */}
        <div className="glass-panel border border-white/5 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide">Cơ cấu Ngân sách Quỹ lương</h3>
                <p className="text-[10px] text-white/40">Phần trăm phân bổ chi phí lương hàng tháng giữa các phòng ban</p>
              </div>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-white/5 text-[10px] font-mono text-emerald-400">
                VNĐ
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 py-2">
              {/* Doughnut Render using SVG */}
              <div className="relative w-36 h-36 shrink-0">
                <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                  {/* Background Circle */}
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="3" />
                  
                  {/* Segments calculation */}
                  {(() => {
                    let accumulatedPercent = 0;
                    const colors = ["#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#14B8A6", "#84CC16", "#6366F1"];
                    
                    return deptStats.map((stat, idx) => {
                      const totalSalaryValue = totalMonthlySalaryAllocated || 1;
                      const percent = (stat.totalSalary / totalSalaryValue) * 100;
                      if (percent === 0) return null;
                      
                      const strokeDasharray = `${percent} ${100 - percent}`;
                      const strokeDashoffset = 100 - accumulatedPercent;
                      accumulatedPercent += percent;
                      
                      return (
                        <circle
                          key={idx}
                          cx="18"
                          cy="18"
                          r="15.915"
                          fill="none"
                          stroke={colors[idx % colors.length]}
                          strokeWidth="3.2"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                          className="transition-all duration-300 hover:stroke-[4]"
                        />
                      );
                    });
                  })()}
                </svg>

                {/* Center text of Hollow Donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-zinc-400 font-medium">Tổng ngân sách</span>
                  <span className="text-sm font-black text-emerald-400 font-mono">{(totalMonthlySalaryAllocated / 1000000).toFixed(1)}M</span>
                </div>
              </div>

              {/* Legends list */}
              <div className="flex-1 grid grid-cols-2 gap-2 text-xs w-full">
                {deptStats.map((stat, idx) => {
                  const colors = ["#8B5CF6", "#3B82F6", "#EC4899", "#10B981", "#F59E0B", "#14B8A6", "#84CC16", "#6366F1"];
                  const percent = totalMonthlySalaryAllocated > 0 ? Math.round((stat.totalSalary / totalMonthlySalaryAllocated) * 100) : 0;
                  return (
                    <div key={idx} className="flex items-center space-x-1.5 p-1 bg-white/[0.01] border border-white/[0.02] rounded-lg">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
                      <div className="truncate flex-1 min-w-0">
                        <p className="text-[10px] text-white/80 font-bold truncate">{stat.name}</p>
                        <p className="text-[9px] text-[#A1A1AA] font-mono leading-none">{percent}% • {(stat.totalSalary / 1000000).toFixed(1)}M</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main List Management Container */}
      <div className="space-y-4">
        {/* Search and control section */}
        <div className="bg-[#14161C]/50 border border-white/5 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm phòng ban nhanh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-550 focus:outline-none rounded-xl text-white text-xs placeholder-white/20 transition-all font-sans"
            />
          </div>

          <p className="text-xs text-white/40 italic">
            Hiển thị {filteredDeptStats.length} phòng ban đơn vị HRM
          </p>
        </div>

        {/* Primary lists of Departments */}
        <div className="space-y-4">
          {filteredDeptStats.map((stat, index) => {
            const isEditing = editingIndex === index;
            const isExpanded = expandedDept === stat.name;
            const originalIndex = depts.indexOf(stat.name);

            return (
              <div 
                key={stat.name}
                className="bg-[#111319]/90 border border-[#21242E] rounded-2xl overflow-hidden transition-all duration-200 hover:border-violet-500/20"
              >
                {/* Department Row Header */}
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {isEditing ? (
                    <div className="flex-1 flex items-center gap-3">
                      <div className="p-2 bg-violet-600 rounded-xl text-white">
                        <Building className="w-5 h-5" />
                      </div>
                      <div className="flex-1 max-w-sm">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => {
                            setEditingValue(e.target.value);
                            if (editError) setEditError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleRenameDept(originalIndex);
                            if (e.key === "Escape") setEditingIndex(null);
                          }}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg focus:outline-none focus:border-violet-500 font-sans"
                          autoFocus
                        />
                        {editError && <p className="text-[10px] text-red-400 mt-1">{editError}</p>}
                      </div>
                      <button
                        onClick={() => handleRenameDept(originalIndex)}
                        className="px-3 py-1.5 bg-emerald-600/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 text-xs font-semibold cursor-pointer"
                      >
                        Lưu
                      </button>
                      <button
                        onClick={() => setEditingIndex(null)}
                        className="px-3 py-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white text-xs font-semibold cursor-pointer"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-wrap items-center gap-4">
                      {/* Department Branding Icon and Title */}
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 border border-violet-500/20 rounded-xl text-violet-400">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <span>{stat.name}</span>
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[10px] text-zinc-400">{stat.activeCount} nhân sự active • {stat.leaveCount} phép</span>
                          </div>
                        </div>
                      </div>

                      {/* Info Pills */}
                      <div className="flex flex-wrap gap-2 md:ml-6">
                        {/* Member Counter pill */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/5 flex items-center space-x-1.5 select-none">
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="text-[10.5px] font-bold text-white/80">{stat.count} thành viên</span>
                        </div>

                        {/* Salary Pill */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/5 flex items-center space-x-1.5 select-none font-mono">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-[10.5px] font-bold text-emerald-400">
                            Avg: {(stat.avgSalary / 1000000).toFixed(1)}M/tháng
                          </span>
                        </div>

                        {/* Gender mix Pill */}
                        <div className="px-2.5 py-1.5 rounded-xl bg-slate-900 border border-white/5 flex items-center space-x-2 select-none text-[10px] font-bold">
                          <span className="text-blue-400">Nam: {stat.malePercentage}%</span>
                          <span className="text-zinc-500">•</span>
                          <span className="text-pink-400">Nữ: {stat.femalePercentage}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operational Settings/Control Action */}
                  {!isEditing && (
                    <div className="flex items-center gap-2 md:self-center shrink-0">
                      {/* Toggle Expand Employees List */}
                      <button
                        onClick={() => setExpandedDept(isExpanded ? null : stat.name)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
                          isExpanded 
                            ? "bg-violet-600/10 border-violet-500/20 text-violet-400" 
                            : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                        }`}
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>Danh Sách ({stat.count})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => {
                          setEditingIndex(index);
                          setEditingValue(stat.name);
                          setEditError(null);
                        }}
                        className="p-2 rounded-xl bg-slate-900 border border-white/5 hover:border-violet-550/30 text-slate-400 hover:text-white cursor-pointer transition-all"
                        title="Đổi tên phòng ban"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteDept(originalIndex)}
                        className="p-2 rounded-xl bg-red-650/10 border border-red-500/10 text-rose-500 hover:text-rose-400 hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Xóa phòng ban"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Expanded Member Accordion detailed list */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-[#21242E] bg-slate-950/50"
                    >
                      <div className="p-5 space-y-3">
                        <h5 className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-2">
                          Danh sách nhân viên trực thuộc ({stat.members.length} người)
                        </h5>

                        {stat.members.length === 0 ? (
                          <div className="py-8 text-center text-xs text-white/20 select-none">
                            Không có nhân sự trực thuộc phòng ban này.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stat.members.map(member => (
                              <div 
                                key={member.id}
                                className="p-3 bg-slate-900/40 border border-white/[0.03] rounded-xl flex items-center justify-between group/member hover:border-violet-500/20 transition-all"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Avatar circle */}
                                  <div className="w-10 h-10 rounded-full bg-violet-600/10 text-violet-400 font-bold border border-violet-500/10 flex items-center justify-center text-xs">
                                    {member.name.trim().split(/\s+/).slice(-2).map(n => n[0]).join("").toUpperCase()}
                                  </div>
                                  <div>
                                    <h6 className="text-xs font-bold text-white">{member.name}</h6>
                                    <div className="flex items-center gap-2 mt-0.5">
                                      <span className="text-[10px] font-mono text-zinc-400">{member.id}</span>
                                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#1C1F26] text-violet-400 font-medium">
                                        {member.position}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                <div className="text-right flex flex-col justify-between h-full">
                                  <span className="text-[10px] text-emerald-400 font-bold font-mono">
                                    {(member.salary / 1000000).toFixed(1)}Mđ
                                  </span>
                                  {/* Status badge */}
                                  <span className={`text-[8.5px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 mt-1 justify-center transition-all ${
                                    member.status === "Đang làm" 
                                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 animate-breathing-green" 
                                      : member.status === "Nghỉ phép"
                                      ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 animate-breathing-cyan"
                                      : "bg-rose-500/10 text-rose-400 border border-rose-500/15 animate-breathing-rose"
                                  }`}>
                                    <span className={`w-1 h-1 rounded-full shrink-0 ${
                                      member.status === "Đang làm" 
                                        ? "bg-emerald-400" 
                                        : member.status === "Nghỉ phép"
                                        ? "bg-cyan-400"
                                        : "bg-rose-400"
                                    }`} />
                                    <span>{member.status}</span>
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {filteredDeptStats.length === 0 && (
            <div className="py-20 text-center text-slate-500 font-medium">
              Không tìm thấy kết quả phòng ban tương ứng!
            </div>
          )}
        </div>
      </div>

      {/* Slide-over Create New Department Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-[100] overflow-y-auto">
            <motion.form
              onSubmit={handleCreateDept}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0B0D13] border border-[#21242E] rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-violet-600 text-white">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-wide">Thêm phòng ban mới</h2>
                    <p className="text-[10px] text-white/40">Thêm đơn vị cơ cấu mới vào hệ thống HRM</p>
                  </div>
                </div>
              </div>

              {createError && (
                <div className="mx-6 mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-bold block">Tên phòng ban *</label>
                  <input
                    type="text"
                    required
                    maxLength={100}
                    placeholder="VD: Nghiên cứu Phát triển, Đảm bảo chất lượng..."
                    value={newDeptName}
                    onChange={(e) => {
                      setNewDeptName(e.target.value);
                      if (createError) setCreateError(null);
                    }}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-850 focus:border-violet-500 focus:outline-none rounded-xl text-white text-xs placeholder-white/20 transition-all font-sans"
                    autoFocus
                  />
                </div>
              </div>

              <div className="p-6 bg-slate-900/40 border-t border-white/5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-lg glow-purple"
                >
                  Tạo phòng ban
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
