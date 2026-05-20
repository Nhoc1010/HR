/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Search, 
  Briefcase, 
  Phone, 
  Mail, 
  MapPin, 
  User, 
  Calendar, 
  X,
  CreditCard,
  FileText,
  Sparkles,
  ChevronDown
} from "lucide-react";
import { Employee } from "../types";

interface EmployeesProps {
  employees: Employee[];
  setEmployees: Dispatch<SetStateAction<Employee[]>>;
}

export default function Employees({ employees, setEmployees }: EmployeesProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tất cả phòng ban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"profile" | "history" | "training">("profile");

  // Form states
  const [fullName, setFullName] = useState("");
  const [empCode, setEmpCode] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [startDate, setStartDate] = useState("2026-05-20");
  const [birthDate, setBirthDate] = useState("1995-01-01");
  const [salary, setSalary] = useState(15000000);
  const [department, setDepartment] = useState("Kỹ thuật");
  const [gender, setGender] = useState<"Nam" | "Nữ">("Nam");
  const [address, setAddress] = useState("");
  const [bhxhNumber, setBhxhNumber] = useState("");
  const [bhxhJoinDate, setBhxhJoinDate] = useState("");
  const [contractType, setContractType] = useState("Xác định thời hạn (12 tháng)");
  const [contractStartDate, setContractStartDate] = useState("2026-05-20");

  const depts = ["Kỹ thuật", "Marketing", "Kinh doanh", "Nhân sự", "Tài chính", "Hành chính"];

  // Open modal for editing or new
  const openFormModal = (emp: Employee | null = null) => {
    setActiveFormTab("profile");
    if (emp) {
      setSelectedEmployee(emp);
      setFullName(emp.name);
      setEmpCode(emp.code);
      setPosition(emp.position);
      setPhone(emp.phone);
      setEmail(emp.email);
      setStartDate(emp.startDate);
      setBirthDate(emp.birthDate);
      setSalary(emp.salary);
      setDepartment(emp.department);
      setGender(emp.gender);
      setAddress(emp.address);
      setBhxhNumber(emp.bhxhNumber);
      setBhxhJoinDate(emp.bhxhJoinDate);
      setContractType(emp.contractType);
      setContractStartDate(emp.contractStartDate);
    } else {
      setSelectedEmployee(null);
      setFullName("");
      // Generate next code
      const nextNum = employees.length + 1;
      setEmpCode(`NV${String(nextNum).padStart(3, "0")}`);
      setPosition("");
      setPhone("");
      setEmail("");
      setStartDate("2026-05-20");
      setBirthDate("1995-01-01");
      setSalary(15000000);
      setDepartment("Kỹ thuật");
      setGender("Nam");
      setAddress("");
      setBhxhNumber("");
      setBhxhJoinDate("");
      setContractType("Xác định thời hạn (12 tháng)");
      setContractStartDate("2026-05-20");
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    if (!fullName || !position || !department || !empCode) {
      alert("Vui lòng điền đủ Họ tên, Mã nhân viên, Chức vụ và Phòng ban!");
      return;
    }

    const payload: Employee = {
      id: selectedEmployee?.id || `emp-${Date.now()}`,
      code: empCode,
      name: fullName,
      position: position,
      phone: phone,
      email: email || `${empCode.toLowerCase()}@company.vn`,
      startDate: startDate,
      birthDate: birthDate,
      salary: Number(salary) || 10000000,
      department: department,
      gender: gender,
      address: address,
      bhxhNumber: bhxhNumber,
      bhxhJoinDate: bhxhJoinDate,
      contractType: contractType,
      contractStartDate: contractStartDate,
      status: selectedEmployee?.status || "Đang làm"
    };

    if (selectedEmployee) {
      // Edit
      setEmployees(employees.map(item => item.id === selectedEmployee.id ? payload : item));
    } else {
      // Add
      setEmployees([...employees, payload]);
    }
    setIsModalOpen(false);
  };

  const handleAIAutoFill = async () => {
    setIsGenerating(true);
    try {
      // AI mock request or client generative fallback to guarantee quick, reliable load
      const randomNames = [
        { name: "Phạm Minh Hoàng", pos: "Junior UI Frontend Developer", dept: "Kỹ thuật", sal: 18000000, email: "hoang.pham@company.vn", add: "15 Lê Thánh Tông, Hoàn Kiếm, Hà Nội" },
        { name: "Lê Nguyễn Bảo Châu", pos: "Content Writer Executive", dept: "Marketing", sal: 13500000, email: "chau.le@company.vn", add: "99 Xuân Thủy, Cầu Giấy, Hà Nội" },
        { name: "Nguyễn Thị Phương Mai", pos: "HR Compensation & Benefit Lead", dept: "Nhân sự", sal: 23000000, email: "mai.nguyen@company.vn", add: "28 Điện Biên Phủ, Ba Đình, Hà Nội" },
        { name: "Đỗ Đăng Khoa", pos: "Financial Controller", dept: "Tài chính", sal: 29000000, email: "khoa.do@company.vn", add: "142 Nguyễn Trãi, Thanh Xuân, Hà Nội" }
      ];

      const chosen = randomNames[Math.floor(Math.random() * randomNames.length)];
      setFullName(chosen.name);
      setPosition(chosen.pos);
      setDepartment(chosen.dept);
      setSalary(chosen.sal);
      setEmail(chosen.email);
      setPhone("09" + String(Math.floor(10000000 + Math.random() * 90000000)));
      setAddress(chosen.add);
      setBhxhNumber("0" + String(Math.floor(190000000 + Math.random() * 800000000)));
      setBhxhJoinDate("2024-03-01");
      setContractType("Không xác định thời hạn");
      
      // Call live chat to enrich details or just simulated delay for premium effect
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Filter logic
  const filteredEmployees = employees.filter(emp => {
    const matchesQuery = 
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDept = 
      selectedDept === "Tất cả phòng ban" || emp.department === selectedDept;

    return matchesQuery && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/5 pb-5">
        <div>
          <h1 className="text-2xl font-display font-bold text-white tracking-tight">Danh sách nhân viên</h1>
          <p className="text-white/45 text-sm mt-1">{filteredEmployees.length} nhân viên trong hệ thống sàng lọc</p>
        </div>
        <button
          onClick={() => openFormModal(null)}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-transform active:scale-95 cursor-pointer glow-purple"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm nhân viên</span>
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
          <input
            type="text"
            placeholder="Tìm kiếm tên, mã, chức vụ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#1E232D]/40 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all text-sm"
          />
        </div>
        
        <div className="w-full md:w-64 relative">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-4 py-3 bg-[#1E232D]/40 border border-white/10 rounded-xl text-white appearance-none cursor-pointer focus:outline-none focus:border-violet-500/50 transition-all text-sm pr-10"
          >
            <option value="Tất cả phòng ban" className="bg-slate-900 border-none text-white">Tất cả phòng ban</option>
            {depts.map((d, id) => (
              <option key={id} value={d} className="bg-slate-900 border-none text-white">{d}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Grid of Employees */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredEmployees.map((emp) => {
            const initials = emp.name.split(" ").slice(-2).map(n => n[0]).join("").toUpperCase();
            return (
              <motion.div
                layout
                id={`employee-card-${emp.code}`}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ y: -4 }}
                className="card-3d p-6 rounded-2xl flex flex-col justify-between cursor-pointer group transition-all duration-300 relative hover:border-white/15"
                onClick={() => openFormModal(emp)}
                key={emp.id}
              >
                <div className="space-y-4">
                  {/* Top line profile */}
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30 flex items-center justify-center font-display font-bold text-md shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors">{emp.name}</h4>
                      <p className="text-[10px] text-white/40 font-mono font-medium">{emp.code}</p>
                    </div>
                    <span className={`ml-auto text-[10px] px-2.5 py-1 rounded-full font-medium ${
                      emp.status === "Đang làm" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]" 
                        : emp.status === "Nghỉ phép" 
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]" 
                          : "bg-white/5 text-white/40 border border-white/5"
                    }`}>
                      {emp.status}
                    </span>
                  </div>

                  {/* Body particulars */}
                  <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-white/70">
                    <div className="flex items-center space-x-2.5">
                      <Briefcase className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="truncate">{emp.position} • <strong className="text-white/50">{emp.department}</strong></span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Phone className="w-4 h-4 text-white/40 shrink-0" />
                      <span>{emp.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Mail className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-white/40">
                  <span>Vào làm: <strong className="text-white/60 font-mono">{emp.startDate}</strong></span>
                  <span className="text-violet-400 hover:text-violet-300 font-semibold transition-colors">Chỉnh sửa</span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredEmployees.length === 0 && (
          <div className="col-span-full py-16 text-center border border-dashed border-white/10 rounded-2xl bg-white/3">
            <User className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <p className="text-white/40 font-medium">Không tìm thấy nhân viên nào phù hợp</p>
          </div>
        )}
      </div>

      {/* Form Dialog Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
            >
              {/* Top Banner */}
              <div className="p-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-violet-600 text-white shadow-lg shadow-violet-950/30">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white" id="modal-heading-text">
                      {selectedEmployee ? `Thông tin chi tiết: ${fullName}` : "Thêm nhân viên mới"}
                    </h2>
                    <p className="text-xs text-slate-400">Cập nhật hồ sơ hành chính lao động, bảo hiểm và hợp đồng.</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!selectedEmployee && (
                    <button
                      type="button"
                      onClick={handleAIAutoFill}
                      disabled={isGenerating}
                      className="px-3.5 py-1.5 rounded-lg border border-violet-500/20 bg-violet-950/40 text-violet-300 text-xs font-semibold flex items-center space-x-1.5 hover:bg-violet-900/30 active:scale-95 duration-200 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 animate-spin-slow" />
                      <span>{isGenerating ? "AI đang điền..." : "AI Tự Điền"}</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Navigation Tabs for Profiles */}
              {selectedEmployee && (
                <div className="flex border-b border-white/5 bg-slate-900/45 px-6 pt-2 gap-4 text-xs font-semibold select-none">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("profile")}
                    className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                      activeFormTab === "profile" 
                        ? "border-violet-500 text-white" 
                        : "border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    Hồ sơ cá nhân
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("history")}
                    className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                      activeFormTab === "history" 
                        ? "border-violet-500 text-white" 
                        : "border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    Lịch sử làm việc
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("training")}
                    className={`py-2 px-3 border-b-2 transition-all cursor-pointer ${
                      activeFormTab === "training" 
                        ? "border-violet-500 text-white" 
                        : "border-transparent text-white/40 hover:text-white"
                    }`}
                  >
                    Đào tạo & Chứng chỉ
                  </button>
                </div>
              )}

              {/* Form & Tab Contents */}
              <form onSubmit={handleSave} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
                
                {activeFormTab === "profile" && (
                  <div className="space-y-6">
                    {/* Grid 1: Basic Information */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center space-x-2">
                        <span className="w-1.5 h-3 bg-violet-500 rounded-full" />
                        <span>Thông tin cơ bản</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Họ và tên *</label>
                          <input
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Mã nhân viên</label>
                          <input
                            type="text"
                            required
                            value={empCode}
                            onChange={(e) => setEmpCode(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Chức vụ *</label>
                          <input
                            type="text"
                            required
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Số điện thoại</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Email</label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Ngày vào làm</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Ngày sinh</label>
                          <input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Lương cơ bản (VNĐ)</label>
                          <input
                            type="number"
                            value={salary}
                            onChange={(e) => setSalary(Number(e.target.value))}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Phòng ban *</label>
                          <select
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          >
                            {depts.map((d, id) => (
                              <option key={id} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Giới tính</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as "Nam" | "Nữ")}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          >
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs text-slate-400 font-medium">Địa chỉ thường trú</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grid 2: BHXH */}
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2 text-indigo-400">
                        <CreditCard className="w-4 h-4 shrink-0" />
                        <span>BẢO HIỂM XÃ HỘI (BHXH)</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Số BHXH</label>
                          <input
                            type="text"
                            placeholder="VD: 0100xxxxxx"
                            value={bhxhNumber}
                            onChange={(e) => setBhxhNumber(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Ngày tham gia BHXH</label>
                          <input
                            type="date"
                            value={bhxhJoinDate}
                            onChange={(e) => setBhxhJoinDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grid 3: Labor Contract */}
                    <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-850 space-y-4">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2 text-emerald-400">
                        <FileText className="w-4 h-4 shrink-0" />
                        <span>HỢP ĐỒNG LAO ĐỘNG</span>
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Loại hợp đồng</label>
                          <select
                            value={contractType}
                            onChange={(e) => setContractType(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          >
                            <option value="Không xác định thời hạn">Không xác định thời hạn</option>
                            <option value="Xác định thời hạn (24 tháng)">Xác định thời hạn (24 tháng)</option>
                            <option value="Xác định thời hạn (12 tháng)">Xác định thời hạn (12 tháng)</option>
                            <option value="Thử việc / Ngắn hạn">Thử việc / Ngắn hạn</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-slate-400 font-medium">Ngày bắt đầu HĐ</label>
                          <input
                            type="date"
                            value={contractStartDate}
                            onChange={(e) => setContractStartDate(e.target.value)}
                            className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 focus:border-violet-500 focus:outline-none rounded-xl text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeFormTab === "history" && (
                  <div className="space-y-5 py-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-violet-500 rounded-full" />
                      <span>Lịch sử làm việc & Thăng tiến</span>
                    </h3>
                    
                    <div className="flow-root pl-1">
                      <ul className="-mb-8">
                        {[
                          { date: startDate || "2023-01-15", title: "Khởi tạo hồ sơ & Onboard", desc: `Bổ nhiệm chính thức vào vị trí ${position} thuộc phòng ban ${department}.` },
                          { date: "2024-11-20", title: "Kết ký Phục lục chính thức", desc: "Được xác nhận hoàn thành chỉ mục công việc cốt lõi, nâng hạng hiệu quả ban phòng." },
                          { date: "2026-05-01", title: "Đánh giá quản lý chuẩn định kỳ v2.0", desc: "Quá trình công tác ổn định, hoàn thành tốt các chỉ số đóng góp nhân sự." }
                        ].map((item, idx) => (
                          <li key={idx} className="relative pb-8 text-xs">
                            {idx !== 2 && (
                              <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-white/10" aria-hidden="true" />
                            )}
                            <div className="relative flex space-x-3 items-start">
                              <span className="h-8 w-8 rounded-full bg-violet-650/20 text-violet-400 flex items-center justify-center border border-violet-500/20 shrink-0">
                                <Briefcase className="w-3.5 h-3.5" />
                              </span>
                              <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                <div>
                                  <p className="text-white font-bold">{item.title}</p>
                                  <p className="text-white/50 text-[11px] font-sans mt-0.5 leading-relaxed">{item.desc}</p>
                                </div>
                                <div className="text-right text-[10px] text-white/30 font-mono shrink-0">
                                  {item.date}
                                </div>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {activeFormTab === "training" && (
                  <div className="space-y-5 py-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center space-x-2">
                      <span className="w-1.5 h-3 bg-fuchsia-500 rounded-full" />
                      <span>Đào tạo nghiệp vụ & Chứng chỉ</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: `Đào tạo kỹ năng chuyên môn: ${position}`, provider: "Học viện quản lý nội bộ Nexus", date: "Tháng 03/2024", result: "Đạt chuẩn xuất sắc" },
                        { title: "Bảo mật thông tin doanh nghiệp SEC-101", provider: "Phòng CNTT & Đội ngũ Hạ tầng", date: "Hàng năm (2025)", result: "Đạt tuyệt đối" }
                      ].map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden">
                          <span className="absolute top-3 right-3 text-[9px] px-1.5 py-0.5 bg-violet-600/10 text-violet-400 rounded-full font-bold">Lưu hành nội bộ</span>
                          <h4 className="font-bold text-white text-xs pr-14">{item.title}</h4>
                          <p className="text-[11px] text-white/50 mt-1 leading-relaxed">{item.provider}</p>
                          <div className="flex justify-between items-center text-[10px] text-white/40 mt-3 border-t border-white/5 pt-2 font-mono">
                            <span>Kỳ: {item.date}</span>
                            <span className="text-emerald-400 font-bold">{item.result}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit / Close buttons */}
                <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white text-sm font-semibold transition-all cursor-pointer"
                  >
                    Đóng lại
                  </button>
                  {activeFormTab === "profile" && (
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-transform active:scale-95 cursor-pointer shadow-lg glow-purple"
                    >
                      Lưu thông tin
                    </button>
                  )}
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
