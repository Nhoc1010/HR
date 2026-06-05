/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { motion, AnimatePresence } from "motion/react";
import { 
  Laptop, 
  Monitor, 
  Cpu, 
  Smartphone, 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  UserPlus, 
  RotateCcw, 
  Edit, 
  Trash2, 
  User, 
  MapPin, 
  Calendar, 
  Wrench, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  DollarSign, 
  ChevronRight, 
  Database,
  Building,
  HelpCircle,
  Clock,
  Sparkles,
  XCircle,
  QrCode,
  Camera,
  RefreshCw
} from "lucide-react";
import { Employee, Asset } from "../types";

interface AssetManagementProps {
  employees: Employee[];
  assets: Asset[];
  setAssets: React.Dispatch<React.SetStateAction<Asset[]>>;
}

export default function AssetManagement({ employees, assets, setAssets }: AssetManagementProps) {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // QR Scanner simulation state
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<Asset | null>(null);
  const [scanFlash, setScanFlash] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);
  const [qrCodeInput, setQrCodeInput] = useState("");
  const [quickAssigneeId, setQuickAssigneeId] = useState("");

  // Simulated QR scanner scan launcher
  const handleSimulateScan = (code: string) => {
    if (!code.trim()) return;
    setIsScanning(true);
    setScanErrorMsg(null);
    setScannedAsset(null);
    
    // Simulate camera focusing and decoding after 700ms
    setTimeout(() => {
      const found = assets.find(a => a.code.toUpperCase() === code.trim().toUpperCase());
      if (found) {
        setScanFlash(true);
        setTimeout(() => setScanFlash(false), 200); // 200ms light flash
        setScannedAsset(found);
      } else {
        setScanErrorMsg(`Không tìm thấy tài sản tương ứng với mã QR hoặc mã Code: "${code}"`);
      }
      setIsScanning(false);
    }, 700);
  };

  // Quick Action methods inside QR Scanner
  const handleQuickUpdateStatus = (assetId: string, newStatus: Asset["status"]) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const updated = { ...a, status: newStatus };
        if (newStatus !== "Đang cấp phát") {
          delete updated.assignedTo;
          delete updated.assignedName;
        }
        return updated;
      }
      return a;
    }));
    // Sync local state
    setScannedAsset(prev => prev && prev.id === assetId ? { 
      ...prev, 
      status: newStatus,
      assignedTo: undefined,
      assignedName: undefined
    } : prev);
  };

  const handleQuickAssign = (assetId: string) => {
    if (!quickAssigneeId) return;
    const emp = employees.find(e => e.id === quickAssigneeId);
    if (!emp) return;

    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        return {
          ...a,
          status: "Đang cấp phát",
          assignedTo: emp.id,
          assignedName: emp.name
        };
      }
      return a;
    }));

    setScannedAsset(prev => prev && prev.id === assetId ? { 
      ...prev, 
      status: "Đang cấp phát" as const, 
      assignedTo: emp.id, 
      assignedName: emp.name 
    } : prev);
    
    setQuickAssigneeId("");
  };

  const handleQuickRevoke = (assetId: string) => {
    setAssets(prev => prev.map(a => {
      if (a.id === assetId) {
        const updated = { ...a, status: "Sẵn sàng" as const };
        delete updated.assignedTo;
        delete updated.assignedName;
        return updated;
      }
      return a;
    }));

    setScannedAsset(prev => prev && prev.id === assetId ? { 
      ...prev, 
      status: "Sẵn sàng" as const, 
      assignedTo: undefined, 
      assignedName: undefined 
    } : prev);
  };

  // Selection & Modal States
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Form Fields State
  const [formCode, setFormCode] = useState("");
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState<Asset["type"]>("Laptop/PC");
  const [formSpecs, setFormSpecs] = useState("");
  const [formValue, setFormValue] = useState<number>(0);
  const [formPurchaseDate, setFormPurchaseDate] = useState("2026-01-01");
  const [formWarrantyMonths, setFormWarrantyMonths] = useState<number>(24);
  const [formLocation, setFormLocation] = useState("Văn phòng chính");
  const [formStatus, setFormStatus] = useState<Asset["status"]>("Sẵn sàng");
  const [formError, setFormError] = useState<string | null>(null);

  // Allocations state
  const [assigneeId, setAssigneeId] = useState("");

  // Helpers
  const formatVND = (value: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  };

  const currentYear = new Date().getFullYear();

  // Statistics
  const stats = useMemo(() => {
    const total = assets.length;
    const allocated = assets.filter(a => a.status === "Đang cấp phát").length;
    const available = assets.filter(a => a.status === "Sẵn sàng").length;
    const maintenance = assets.filter(a => a.status === "Đang bảo trì").length;
    const disposed = assets.filter(a => a.status === "Đã thanh lý").length;

    const totalValue = assets.reduce((sum, a) => sum + (a.status !== "Đã thanh lý" ? a.value : 0), 0);
    const laptopCount = assets.filter(a => a.type === "Laptop/PC").length;
    const monitorCount = assets.filter(a => a.type === "Màn hình").length;
    const networkCount = assets.filter(a => a.type === "Thiết bị mạng").length;
    const mobileCount = assets.filter(a => a.type === "Thiết bị di động").length;
    const otherCount = assets.filter(a => a.type === "Phụ kiện văn phòng" || a.type === "Khác").length;

    return {
      total,
      allocated,
      available,
      maintenance,
      disposed,
      totalValue,
      types: {
        laptop: laptopCount,
        monitor: monitorCount,
        network: networkCount,
        mobile: mobileCount,
        other: otherCount
      }
    };
  }, [assets]);

  // Filtered Assets
  const filteredAssets = useMemo(() => {
    return assets.filter(asset => {
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.specs.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (asset.assignedName && asset.assignedName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = selectedType === "All" || asset.type === selectedType;
      const matchesStatus = selectedStatus === "All" || asset.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [assets, searchQuery, selectedType, selectedStatus]);

  // Reset Form
  const resetForm = () => {
    setFormCode("");
    setFormName("");
    setFormType("Laptop/PC");
    setFormSpecs("");
    setFormValue(0);
    setFormPurchaseDate(new Date().toISOString().split("T")[0]);
    setFormWarrantyMonths(24);
    setFormLocation("Hà Nội HQ Desk");
    setFormStatus("Sẵn sàng");
    setFormError(null);
    setEditingAsset(null);
  };

  // Open Form for Adding
  const handleOpenAdd = () => {
    resetForm();
    // Auto-generate code
    const randNum = Math.floor(100 + Math.random() * 900);
    setFormCode(`AST-IT-${randNum}`);
    setIsFormOpen(true);
  };

  // Open Form for Editing
  const handleOpenEdit = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    setEditingAsset(asset);
    setFormCode(asset.code);
    setFormName(asset.name);
    setFormType(asset.type);
    setFormSpecs(asset.specs);
    setFormValue(asset.value);
    setFormPurchaseDate(asset.purchaseDate);
    setFormWarrantyMonths(asset.warrantyMonths);
    setFormLocation(asset.location);
    setFormStatus(asset.status);
    setFormError(null);
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode || !formName || !formSpecs) {
      setFormError("Vui lòng điền mã thiết bị, tên thiết bị và thông số kỹ thuật!");
      return;
    }

    if (editingAsset) {
      // Edit
      setAssets(prev => prev.map(a => {
        if (a.id === editingAsset.id) {
          const updated = {
            ...a,
            code: formCode,
            name: formName,
            type: formType,
            specs: formSpecs,
            value: Number(formValue),
            purchaseDate: formPurchaseDate,
            warrantyMonths: Number(formWarrantyMonths),
            location: formLocation,
            status: formStatus
          };
          if (formStatus === "Sẵn sàng" || formStatus === "Đang bảo trì" || formStatus === "Đã thanh lý") {
            delete updated.assignedTo;
            delete updated.assignedName;
          }
          return updated;
        }
        return a;
      }));
    } else {
      // Add
      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        code: formCode,
        name: formName,
        type: formType,
        specs: formSpecs,
        value: Number(formValue),
        purchaseDate: formPurchaseDate,
        warrantyMonths: Number(formWarrantyMonths),
        location: formLocation,
        status: formStatus
      };
      setAssets(prev => [newAsset, ...prev]);
    }
    setIsFormOpen(false);
    resetForm();
  };

  // Handle Delete
  const handleDeleteAsset = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Bạn có chắc chắn muốn xóa tài sản/thiết bị này khỏi danh sách quản lý?")) {
      setAssets(prev => prev.filter(a => a.id !== id));
      if (selectedAsset?.id === id) {
        setSelectedAsset(null);
      }
    }
  };

  // Handle Open Allocation Dialog
  const handleOpenAssign = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    setSelectedAsset(asset);
    setAssigneeId("");
    setIsAssignOpen(true);
  };

  // Perform Allocation Assignment
  const handlePerformAssign = () => {
    if (!selectedAsset || !assigneeId) return;
    const emp = employees.find(e => e.id === assigneeId);
    if (!emp) return;

    setAssets(prev => prev.map(a => {
      if (a.id === selectedAsset.id) {
        return {
          ...a,
          status: "Đang cấp phát",
          assignedTo: emp.id,
          assignedName: emp.name
        };
      }
      return a;
    }));

    setIsAssignOpen(false);
    setSelectedAsset(null);
  };

  // Revoke/Recall Asset to Warehouse
  const handleRevokeAsset = (e: React.MouseEvent, asset: Asset) => {
    e.stopPropagation();
    if (confirm(`Bạn có chắc chắn muốn thu hồi tài sản "${asset.name}" về kho quản lý?`)) {
      setAssets(prev => prev.map(a => {
        if (a.id === asset.id) {
          const updated = { ...a, status: "Sẵn sàng" as const };
          delete updated.assignedTo;
          delete updated.assignedName;
          return updated;
        }
        return a;
      }));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(null);
      }
    }
  };

  const getIconForType = (type: Asset["type"]) => {
    switch (type) {
      case "Laptop/PC": return <Laptop className="w-4 h-4 text-indigo-400" />;
      case "Màn hình": return <Monitor className="w-4 h-4 text-emerald-400" />;
      case "Thiết bị mạng": return <Cpu className="w-4 h-4 text-violet-400" />;
      case "Thiết bị di động": return <Smartphone className="w-4 h-4 text-amber-400" />;
      case "Phụ kiện văn phòng": return <Building className="w-4 h-4 text-sky-400" />;
      default: return <Tag className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Dashboard Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center">
            <Sparkles className="w-5 h-5 text-indigo-400 mr-2" />
            Quản lý Tài sản & Thiết bị CNTT
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi, cấp phát, bảo trì và thu hồi trang thiết bị công nghệ & làm việc cho nhân sự toàn hệ thống.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setIsQrScannerOpen(true);
              setScannedAsset(null);
              setScanErrorMsg(null);
              setQrCodeInput("");
            }}
            className="bg-slate-900/80 border border-slate-800 hover:bg-slate-800 text-emerald-400 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg flex items-center justify-center cursor-pointer gap-2"
          >
            <QrCode className="w-4 h-4 text-emerald-400" />
            Quét Mã QR Tài Sản
          </button>
          
          <button
            onClick={handleOpenAdd}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center cursor-pointer gap-2"
          >
            <Plus className="w-4 h-4" />
            Khai báo Thiết bị Mới
          </button>
        </div>
      </div>

      {/* KPI Stats & Status Distribution Doughnut Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* KPI Stats Cards - spans 8/12 of the container */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Total Assets */}
          <div className="bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Tổng tài sản CNTT</span>
                <div className="p-1 px-2.5 rounded bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">HQ</div>
              </div>
              <p className="text-2xl font-black text-white">{stats.total} <span className="text-xs text-indigo-400 font-medium">thiết bị</span></p>
            </div>
            <p className="text-[9px] text-[#818cf8] font-mono mt-1.5">Đồng bộ ảo SQLite Local</p>
          </div>

          {/* Assigned */}
          <div className="bg-indigo-950/20 backdrop-blur-md rounded-2xl p-4 border border-indigo-500/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Đang cấp phát</span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#818cf8] animate-pulse" />
              </div>
              <p className="text-2xl font-black text-indigo-100">{stats.allocated} <span className="text-xs text-indigo-400 font-medium">sử dụng</span></p>
            </div>
            <p className="text-[9px] text-indigo-400 font-medium mt-1.5">
              Hiệu suất: {stats.total > 0 ? Math.round((stats.allocated / stats.total) * 100) : 0}% công suất
            </p>
          </div>

          {/* Available */}
          <div className="bg-emerald-950/20 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Sẵn sàng (Mới, Trống)</span>
                <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
              </div>
              <p className="text-2xl font-black text-emerald-300">{stats.available} <span className="text-xs text-emerald-400 font-medium">kho</span></p>
            </div>
            <p className="text-[9px] text-emerald-400 mt-1.5 font-medium">Thiết bị dự trữ có sẵn</p>
          </div>

          {/* Under Maintenance */}
          <div className="bg-amber-950/20 backdrop-blur-md rounded-2xl p-4 border border-amber-500/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Đang bảo trì</span>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              <p className="text-2xl font-black text-amber-300">{stats.maintenance} <span className="text-xs text-amber-400 font-medium">thiết bị</span></p>
            </div>
            <p className="text-[9px] text-amber-400 font-medium mt-1.5">Cảnh báo hao mòn phần cứng</p>
          </div>

          {/* Retired / Disposed */}
          <div className="bg-rose-950/20 backdrop-blur-md rounded-2xl p-4 border border-rose-500/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Đã thanh lý</span>
                <div className="w-2.5 h-2.5 rounded-full bg-rose-550" />
              </div>
              <p className="text-2xl font-black text-rose-300">{stats.disposed} <span className="text-xs text-rose-400 font-medium font-bold">thiết bị</span></p>
            </div>
            <p className="text-[9px] text-rose-400 font-medium mt-1.5">Đã thu hồi ngân quỹ</p>
          </div>

          {/* Total Investment Value */}
          <div className="bg-purple-950/20 backdrop-blur-md rounded-2xl p-4 border border-purple-500/15 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider">Giá trị định giá</span>
                <div className="p-1 px-2.5 rounded bg-purple-500/10 text-[9px] font-bold text-purple-400">VND</div>
              </div>
              <p className="text-base sm:text-lg font-black text-purple-300 truncate">{formatVND(stats.totalValue)}</p>
            </div>
            <p className="text-[9px] text-purple-400 mt-1.5 font-medium">Tổng ngân sách hạ tầng CNTT</p>
          </div>
        </div>

        {/* Doughnut Chart Panel - spans 4/12 of the container */}
        <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Tình trạng Thiết bị</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Phân bố vòng đời tài sản CNTT</p>
              </div>
              <span className="p-1 px-2 rounded-lg bg-indigo-500/10 border border-indigo-500/15 text-[9px] font-black uppercase text-indigo-400">Live</span>
            </div>

            {/* Doughnut Display */}
            <div className="h-[150px] relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Sẵn sàng", value: stats.available, color: "#10b981" },
                      { name: "Đang cấp phát", value: stats.allocated, color: "#6366f1" },
                      { name: "Đang bảo trì", value: stats.maintenance, color: "#f59e0b" },
                      { name: "Đã thanh lý", value: stats.disposed, color: "#f43f5e" }
                    ].filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {[
                      { name: "Sẵn sàng", value: stats.available, color: "#10b981" },
                      { name: "Đang cấp phát", value: stats.allocated, color: "#6366f1" },
                      { name: "Đang bảo trì", value: stats.maintenance, color: "#f59e0b" },
                      { name: "Đã thanh lý", value: stats.disposed, color: "#f43f5e" }
                    ].filter(d => d.value > 0).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/90 border border-white/10 p-2 rounded-xl shadow-xl text-[11px] backdrop-blur-md">
                            <p className="font-bold text-white mb-0.5">{data.name}</p>
                            <p className="text-slate-400">
                              Số lượng: <span className="text-indigo-300 font-mono font-bold">{data.value}</span> ({stats.total > 0 ? Math.round((data.value / stats.total) * 100) : 0}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Total overlay label inside inner radius */}
              <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tổng số</span>
                <span className="text-xl font-black text-white leading-none">{stats.total}</span>
              </div>
            </div>
          </div>

          {/* Simple Grid Legend labels */}
          <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-white/5">
            {[
              { label: "Sẵn sàng", count: stats.available, color: "bg-emerald-500" },
              { label: "Cấp phát", count: stats.allocated, color: "bg-indigo-500" },
              { label: "Bảo trì", count: stats.maintenance, color: "bg-amber-500" },
              { label: "Thanh lý", count: stats.disposed, color: "bg-rose-500" }
            ].map((lg, i) => {
              const pct = stats.total > 0 ? Math.round((lg.count / stats.total) * 100) : 0;
              return (
                <div key={i} className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-white/5 transition-all">
                  <div className={`w-2 h-2 rounded-full ${lg.color}`} />
                  <div className="flex-1 min-w-0 pr-1">
                    <p className="text-[10px] text-slate-300 font-semibold truncate leading-none">{lg.label}</p>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">{lg.count} ({pct}%)</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main filter, list and detail panels */}
      <div className="bg-[#121624]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-5 shadow-2xl">
        
        {/* Advanced Filters block */}
        <div className="flex flex-col space-y-3.5 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo mã, tên thiết bị, cấu hình, hoặc tên nhân viên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-xl text-xs pl-10 pr-4 py-2.5 text-white shadow-inner"
              />
            </div>

            {/* Selector Options */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Type Category Filter */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wide pl-1">Loại:</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-transparent border-0 text-white font-medium text-xs focus:ring-0 focus:outline-none pr-1"
                >
                  <option value="All" className="bg-slate-950 text-slate-300">Tất cả danh mục</option>
                  <option value="Laptop/PC" className="bg-slate-950 text-slate-300">Laptop/PC</option>
                  <option value="Màn hình" className="bg-slate-950 text-slate-300">Màn hình</option>
                  <option value="Thiết bị mạng" className="bg-slate-950 text-slate-300">Thiết bị mạng</option>
                  <option value="Thiết bị di động" className="bg-slate-950 text-slate-300">Thiết bị di động</option>
                  <option value="Phụ kiện văn phòng" className="bg-slate-950 text-slate-300">Phụ kiện văn phòng</option>
                  <option value="Khác" className="bg-slate-950 text-slate-300">Khác</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-wide pl-1">Trạng thái:</span>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="bg-transparent border-0 text-white font-medium text-xs focus:ring-0 focus:outline-none pr-1"
                >
                  <option value="All" className="bg-slate-950 text-slate-300">Tất cả trạng thái</option>
                  <option value="Sẵn sàng" className="bg-slate-950 text-slate-300">Sẵn sàng cấp phát</option>
                  <option value="Đang cấp phát" className="bg-slate-950 text-slate-300">Đang cấp phát</option>
                  <option value="Đang bảo trì" className="bg-slate-950 text-slate-300">Đang bảo trì</option>
                  <option value="Đã thanh lý" className="bg-slate-950 text-slate-300">Đã thanh lý</option>
                </select>
              </div>

              {/* Grid / List View Toggle */}
              <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewMode === "grid" 
                      ? "bg-indigo-600 border border-indigo-400/20 text-white shadow" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    viewMode === "list" 
                      ? "bg-indigo-600 border border-indigo-400/20 text-white shadow" 
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  List
                </button>
              </div>

            </div>
          </div>

          {/* Filter labels info */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span>Tìm thấy <b>{filteredAssets.length}</b> thiết bị trang thiết bị</span>
            {(selectedType !== "All" || selectedStatus !== "All" || searchQuery !== "") && (
              <button
                onClick={() => {
                  setSelectedType("All");
                  setSelectedStatus("All");
                  setSearchQuery("");
                }}
                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 uppercase font-bold text-[9px] tracking-wider cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Xóa tất cả bộ lọc
              </button>
            )}
          </div>
        </div>

        {/* RENDERING DIRECTORY CONTAINER */}
        {filteredAssets.length === 0 ? (
          <div className="text-center py-20 bg-slate-950/30 rounded-2xl border border-dashed border-white/5 mx-auto max-w-xl">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-4 animate-bounce" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Không tìm thấy thiết bị nào</h3>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              Không có dữ liệu trang thiết bị phù hợp với truy vấn bộ lọc của bạn trong hệ thống cục bộ.
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-5 px-3.5 py-2 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/25 hover:border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Khai báo mới ngay
            </button>
          </div>
        ) : viewMode === "grid" ? (
          
          /* BENTO GRID WORKSPACE CARD REPRESENTATION */
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {filteredAssets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id;
              
              return (
                <motion.div
                  key={asset.id}
                  layoutId={`asset-card-${asset.id}`}
                  onClick={() => setSelectedAsset(asset)}
                  className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer group hover:-translate-y-1 ${
                    isSelected 
                      ? "bg-slate-900 border-indigo-500/40 hover:border-indigo-500/60 shadow-[0_15px_30px_rgba(99,102,241,0.15)] ring-1 ring-indigo-500/20" 
                      : "bg-[#161a29]/80 hover:bg-[#161a29]/95 border-white/5 hover:border-white/10 [box-shadow:0_4px_12px_rgba(0,0,0,0.15)]"
                  }`}
                >
                  {/* Card head: Identifier tags */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-lg text-[9px] font-mono text-slate-400 select-all cursor-default">
                        {getIconForType(asset.type)}
                        <span>{asset.code}</span>
                      </div>

                      {/* Status indicator styles */}
                      <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${
                        asset.status === "Sẵn sàng"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : asset.status === "Đang cấp phát"
                            ? "bg-[#6366F1]/10 text-[#a8bcd0] border-[#6366F1]/20"
                            : asset.status === "Đang bảo trì"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                              : "bg-slate-800 text-slate-500 border-white/5"
                      }`}>
                        {asset.status}
                      </span>
                    </div>

                    {/* Asset Name Display */}
                    <h3 className="text-sm font-bold text-white tracking-tight leading-snug group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {asset.name}
                    </h3>
                    
                    {/* Specifications paragraph */}
                    <p className="text-[11px] text-slate-400 font-normal line-clamp-2 mt-1.5 leading-relaxed font-sans block select-text">
                      {asset.specs}
                    </p>
                  </div>

                  {/* Card Bottom Panel metadata */}
                  <div className="mt-4 pt-3.5 border-t border-white/5 flex flex-col space-y-2">
                    
                    {/* Allocation Details */}
                    <div className="flex items-center justify-between text-[11px]">
                      {asset.status === "Đang cấp phát" && asset.assignedName ? (
                        <>
                          <span className="text-slate-500 font-medium">Bàn giao cho:</span>
                          <span className="flex items-center gap-1 text-slate-200 font-semibold truncate max-w-[130px]">
                            <User className="w-3 h-3 text-indigo-400 shrink-0" />
                            {asset.assignedName}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-slate-500 font-medium">Ban hành / Ghi chú:</span>
                          <span className="text-slate-400 font-medium truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            {asset.location}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Numeric Value & Quick trigger buttons */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-500 font-medium text-[11px]">Ngân sách:</span>
                      <span className="text-indigo-300 font-mono text-xs font-bold">{formatVND(asset.value)}</span>
                    </div>

                    {/* Interactive overlay card action bar */}
                    <div className="flex items-center justify-end gap-1.5 pt-2">
                      <button
                        onClick={(e) => handleOpenEdit(e, asset)}
                        className="p-1 px-2 hover:bg-white/10 border border-transparent hover:border-white/10 rounded-lg text-[10px] font-bold text-slate-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit className="w-3 h-3 text-indigo-400" />
                        SỬA
                      </button>

                      {asset.status === "Sẵn sàng" ? (
                        <button
                          onClick={(e) => handleOpenAssign(e, asset)}
                          className="p-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/15 hover:border-indigo-500/40 rounded-lg text-[10px] font-bold text-indigo-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Bàn giao/Cấp phát thiết bị cho nhân sự"
                        >
                          <UserPlus className="w-3 h-3" />
                          CẤP PHÁT
                        </button>
                      ) : asset.status === "Đang cấp phát" ? (
                        <button
                          onClick={(e) => handleRevokeAsset(e, asset)}
                          className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-lg text-[10px] font-bold text-emerald-300 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="Thu hồi về kho"
                        >
                          <RotateCcw className="w-3 h-3" />
                          THU HỒI
                        </button>
                      ) : null}

                      <button
                        onClick={(e) => handleDeleteAsset(e, asset.id)}
                        className="p-1.5 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-lg text-rose-400 flex items-center justify-center cursor-pointer transition-colors"
                        title="Hủy/Xóa tài sản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          
          /* COMPACT EXCEL-STYLE HIGH CONTRAST LIST DETAILS */
          <div className="overflow-x-auto rounded-2xl border border-white/5 bg-slate-900/40">
            <table className="w-full text-left border-collapse min-w-[800px] select-text">
              <thead>
                <tr className="border-b border-white/5 bg-slate-950/60 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Mã Thiết Bị</th>
                  <th className="py-3 px-4">Phân Loại / Tên</th>
                  <th className="py-3 px-4">Thông số kĩ thuật</th>
                  <th className="py-3 px-4">Định Giá (đ)</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4">Cấp Phát Cho</th>
                  <th className="py-3 px-4 text-center">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-xs">
                {filteredAssets.map((asset) => {
                  const isSelected = selectedAsset?.id === asset.id;
                  
                  return (
                    <tr
                      key={asset.id}
                      onClick={() => setSelectedAsset(asset)}
                      className={`hover:bg-white/5 transition-colors cursor-pointer ${
                        isSelected ? "bg-indigo-600/10 border-indigo-500/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-[#818cf8]">
                        {asset.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="p-1.5 bg-slate-950/60 rounded-lg shrink-0">
                            {getIconForType(asset.type)}
                          </div>
                          <div>
                            <p className="font-semibold text-white leading-tight">{asset.name}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{asset.type} • Mua: {asset.purchaseDate}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate" title={asset.specs}>
                        {asset.specs}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-200">
                        {formatVND(asset.value)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                          asset.status === "Sẵn sàng"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : asset.status === "Đang cấp phát"
                              ? "bg-[#6366F1]/10 text-[#a8bcd0] border-[#6366F1]/20"
                              : asset.status === "Đang bảo trì"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-800 text-slate-500 border-white/5"
                        }`}>
                          {asset.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        {asset.status === "Đang cấp phát" && asset.assignedName ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#818cf8] shrink-0" />
                            <span>{asset.assignedName}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-normal">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={(e) => handleOpenEdit(e, asset)}
                            className="p-1.5 hover:bg-white/5 hover:text-white rounded border border-transparent hover:border-white/10 text-slate-400 cursor-pointer"
                            title="Sửa"
                          >
                            <Edit className="w-3.5 h-3.5 text-indigo-400" />
                          </button>
                          
                          {asset.status === "Sẵn sàng" ? (
                            <button
                              onClick={(e) => handleOpenAssign(e, asset)}
                              className="p-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold rounded cursor-pointer"
                              title="Bàn giao"
                            >
                              Cấp phát
                            </button>
                          ) : asset.status === "Đang cấp phát" ? (
                            <button
                              onClick={(e) => handleRevokeAsset(e, asset)}
                              className="p-1 px-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded cursor-pointer"
                              title="Thu hổi"
                            >
                              Thu hồi
                            </button>
                          ) : (
                            <span className="text-slate-500 text-xs">—</span>
                          )}

                          <button
                            onClick={(e) => handleDeleteAsset(e, asset.id)}
                            className="p-1.5 hover:bg-rose-500/10 hover:text-rose-400 rounded text-slate-500 cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* DETAILED EXPANDED VISUAL SIDE-BAR DRAWER POPUP FOR THE SELECTED ASSET */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAsset(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative z-10 select-text"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-gradient-to-r from-[#111422] to-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 rounded-lg shrink-0">
                    {getIconForType(selectedAsset.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-black text-slate-500 tracking-wider">THÔNG TIN CHI TIẾT</span>
                    <h3 className="text-sm font-bold text-white tracking-tight">{selectedAsset.code}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="p-1 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Visual Avatar Banner inside pop */}
                <div className="p-4 rounded-xl bg-[#161a28] border border-white/5 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-white text-base font-bold shadow-inner mb-2 text-indigo-400">
                    {getIconForType(selectedAsset.type)}
                  </div>
                  <h4 className="text-sm font-black text-white px-2 leading-tight">{selectedAsset.name}</h4>
                  <span className="text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 bg-slate-900 text-indigo-400 border-white/10 mt-1.5 select-all">
                    {selectedAsset.code}
                  </span>
                </div>

                {/* Characteristics detailed breakdown metadata */}
                <div className="space-y-3.5">
                  <h5 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-0.5">Thông tin định dạng</h5>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Phân loại thiết bị</p>
                      <p className="text-xs text-white font-bold mt-1">{selectedAsset.type}</p>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Trạng thái hiện trạng</p>
                      <p className="text-xs text-indigo-300 font-bold mt-1">{selectedAsset.status}</p>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Định giá tài chính</p>
                      <p className="text-xs text-indigo-400 font-mono font-bold mt-1">{formatVND(selectedAsset.value)}</p>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Bảo hành chính hãng</p>
                      <p className="text-xs text-white font-bold mt-1">{selectedAsset.warrantyMonths} Tháng</p>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Ngày mua thiết bị</p>
                      <p className="text-xs text-slate-300 font-bold mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedAsset.purchaseDate}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                      <p className="text-[9px] uppercase font-bold text-slate-500">Nơi đặt thiết bị</p>
                      <p className="text-xs text-slate-300 font-bold mt-1 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                        {selectedAsset.location}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Configurations */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-0.5">Cấu hình & thông số chi tiết</h5>
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {selectedAsset.specs}
                    </p>
                  </div>
                </div>

                {/* Assignments History info */}
                <div className="space-y-3 pt-1 border-t border-white/5">
                  <h5 className="text-[10px] font-mono font-black text-slate-500 uppercase tracking-widest pl-0.5">Thông tin cấp phát sở hữu</h5>
                  
                  {selectedAsset.status === "Đang cấp phát" && selectedAsset.assignedName ? (
                    <div className="p-4 bg-indigo-950/25 border border-indigo-500/25 rounded-xl flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {selectedAsset.assignedName.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] uppercase font-black text-indigo-400 tracking-wider">Đang sử dụng bởi</p>
                        <p className="text-xs text-white font-bold truncate mt-0.5">{selectedAsset.assignedName}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Nhân viên được bàn giao trang thiết bị CNTT theo chế độ ban hành.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl text-center">
                      <p className="text-xs text-slate-400">Thiết bị này hiện tại đang rảnh rỗi trong kho và sẵn sàng bàn giao cho nhân viên.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons for Select Bottom Pop */}
              <div className="p-4 border-t border-white/5 bg-slate-950 flex items-center justify-between">
                <button
                  onClick={(e) => {
                    handleOpenEdit(e, selectedAsset);
                    setSelectedAsset(null);
                  }}
                  className="px-4 py-2 hover:bg-white/10 text-slate-300 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  SỬA ĐỔI CHI TIẾT
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedAsset(null)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Bỏ chọn
                  </button>

                  {selectedAsset.status === "Sẵn sàng" ? (
                    <button
                      onClick={(e) => {
                        handleOpenAssign(e, selectedAsset);
                        setSelectedAsset(null);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                    >
                      BÀN GIAO THIẾT BỊ
                    </button>
                  ) : selectedAsset.status === "Đang cấp phát" ? (
                    <button
                      onClick={(e) => {
                        handleRevokeAsset(e, selectedAsset);
                        setSelectedAsset(null);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                    >
                      YÊU CẦU THU HỒI
                    </button>
                  ) : null}
                </div>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DIALOG: SPECIFIC FULL COMPREHENSIVE ADD / EDIT FORM OVERLAY */}
      <AnimatePresence>
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFormOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 select-text"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-gradient-to-r from-indigo-950/20 to-slate-900 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500/15 text-indigo-400 rounded-lg shrink-0">
                    <Database className="w-5 h-5 text-indigo-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {editingAsset ? "Hiệu chỉnh thiết bị tài sản" : "Khai báo trang thiết bị CNTT mới"}
                    </h3>
                    <p className="text-[10px] text-slate-500">Cập nhật hạ tầng trang bị thiết bị</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-lg p-1 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 Rotate-90" />
                </button>
              </div>

              {/* Form content */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                  {formError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 animate-pulse" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Asset Code */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Mã Thiết Bị (Asset Tag)</label>
                      <input
                        type="text"
                        value={formCode}
                        onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                        placeholder="Ví dụ: AST-MAC-10"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white font-mono text-xs p-2.5"
                      />
                    </div>

                    {/* Category Type */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider font-sans">Danh Mục Phân Loại</label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value as any)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white text-xs p-2.5"
                      >
                        <option value="Laptop/PC">Laptop/PC</option>
                        <option value="Màn hình">Màn hình</option>
                        <option value="Thiết bị mạng">Thiết bị mạng</option>
                        <option value="Thiết bị di động">Thiết bị di động</option>
                        <option value="Phụ kiện văn phòng">Phụ kiện văn phòng</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>

                    {/* Asset Name */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Tên Thiết Bị / Model</label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ví dụ: Apple MacBook Pro M4 16-inch"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white text-xs p-2.5"
                      />
                    </div>

                    {/* Specifications Specs */}
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Thông Số Kỹ Thuật (Specs)</label>
                      <textarea
                        value={formSpecs}
                        onChange={(e) => setFormSpecs(e.target.value)}
                        placeholder="Nhập chi tiết phần cứng (RAM, CPU, Dung lượng ổ cứng, Kích thước màn hình...)"
                        rows={3}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white text-xs p-2.5 leading-relaxed font-mono"
                      />
                    </div>

                    {/* Valuation price */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Định giá ngân sách (VND)</label>
                      <input
                        type="number"
                        value={formValue}
                        onChange={(e) => setFormValue(Number(e.target.value))}
                        placeholder="Mức tiền mua thiết bị"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white font-mono text-xs p-2.5"
                      />
                    </div>

                    {/* purchaseDate */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Ngày mua bàn giao gốc</label>
                      <input
                        type="date"
                        value={formPurchaseDate}
                        onChange={(e) => setFormPurchaseDate(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white font-mono text-xs p-2.5"
                      />
                    </div>

                    {/* warrantyMonths */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Thời hạn bảo hành (Tháng)</label>
                      <input
                        type="number"
                        value={formWarrantyMonths}
                        onChange={(e) => setFormWarrantyMonths(Number(e.target.value))}
                        placeholder="Ví dụ: 12, 24, 36"
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white font-mono text-xs p-2.5"
                      />
                    </div>

                    {/* Location */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Nơi đặt / Tủ kho mặc định</label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Phòng máy 1, Tủ rack 3..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white text-xs p-2.5"
                      />
                    </div>

                    {/* Status selection if editing */}
                    {editingAsset && (
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Cập nhật trạng thái thủ công</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-indigo-300 font-bold text-xs p-2.5"
                        >
                          <option value="Sẵn sàng">Kho dự trữ (Sẵn sàng)</option>
                          <option value="Đang bảo trì">Đang trong phòng bảo trì</option>
                          <option value="Đã thanh lý">Đã thanh lý / Phế thải</option>
                        </select>
                      </div>
                    )}

                  </div>
                </div>

                {/* Footer submit */}
                <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-end gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4.5 py-2 hover:bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Bỏ qua
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/25"
                  >
                    {editingAsset ? "Đồng bộ thay đổi" : "Tạo và Lưu thiết bị"}
                  </button>
                </div>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DIALOG: CHOOSE EMPLOYEE TO ASSIGN ASSET ALLOCATION */}
      <AnimatePresence>
        {isAssignOpen && selectedAsset && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAssignOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative z-10 select-text"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-[#111422] flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">Cấp phát & Bàn giao tài sản</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Mã thiết bị: <span className="font-mono text-indigo-300 font-bold">{selectedAsset.code}</span></p>
                </div>
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="rounded-lg p-1 hover:bg-white/10 text-slate-400 cursor-pointer"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body form */}
              <div className="p-6 space-y-4">
                
                {/* Details target */}
                <div className="p-3 bg-slate-900 rounded-xl border border-white/5 flex gap-2">
                  <div className="p-1.5 bg-slate-950 rounded text-indigo-400 self-start">
                    {getIconForType(selectedAsset.type)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white leading-tight">{selectedAsset.name}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 truncate max-w-[320px]">Specs: {selectedAsset.specs}</p>
                  </div>
                </div>

                {/* Choose Assignee options */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 tracking-wider">Chọn nhân vật bàn giao</label>
                  <div className="relative">
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500 focus:outline-none rounded-lg text-white text-xs p-2.5 font-sans"
                    >
                      <option value="">-- Chọn một nhân viên nhận thiết bị --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id} className="bg-slate-950 font-sans">
                          {emp.code} - {emp.name} ({emp.position} - {emp.department})
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-[9px] text-slate-500/85">
                    Hành động này sẽ cập nhật trạng thái của thiết bị sang "Đang cấp phát" và chỉ định tên nhân sự quản lý trực tiếp.
                  </p>
                </div>

              </div>

              {/* Footer action */}
              <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-end gap-3">
                <button
                  onClick={() => setIsAssignOpen(false)}
                  className="px-4 py-2 hover:bg-white/5 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Bỏ qua
                </button>
                <button
                  disabled={!assigneeId}
                  onClick={handlePerformAssign}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-lg hover:shadow-indigo-500/25"
                >
                  Đồng ý cấp phát
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DIALOG: SIMULATED QR CODE CAMERA SCANNER */}
      <AnimatePresence>
        {isQrScannerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsQrScannerOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-slate-950 border border-white/10 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative z-10 select-text"
            >
              {/* Header */}
              <div className="p-5 border-b border-white/5 bg-[#111422] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-lg shrink-0">
                    <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight">Trình Giả Lập Quét Mã QR</h3>
                    <p className="text-[10px] text-slate-500">Quét camera hoặc chọn mã tài sản để quản lý nhanh</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsQrScannerOpen(false)}
                  className="rounded-lg p-1 hover:bg-white/10 text-slate-400 cursor-pointer"
                >
                  <XCircle className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Camera Viewfinder View (if no asset is active or we are actively searching) */}
                {!scannedAsset ? (
                  <div className="space-y-4">
                    {/* Simulated Camera Window */}
                    <div className="relative h-[220px] rounded-2xl bg-slate-900 border border-white/10 overflow-hidden flex flex-col items-center justify-center">
                      {/* Scan Flash Overlay */}
                      <AnimatePresence>
                        {scanFlash && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white z-30"
                          />
                        )}
                      </AnimatePresence>

                      {/* Moving laser scan screen line */}
                      {isScanning && (
                        <div className="absolute inset-x-0 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981] z-20 animate-bounce" style={{ animationDuration: '2s' }} />
                      )}

                      {/* Retro-reflective brackets around scanning frame */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {isScanning ? (
                        <div className="text-center space-y-3 z-10">
                          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                          <div>
                            <p className="text-xs font-bold text-white uppercase tracking-widest">Đang tự động lấy nét...</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Phân tích ma trận mã vạch</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center space-y-2.5 z-10 px-6">
                          <Camera className="w-8 h-8 text-slate-600 mx-auto" />
                          <div>
                            <p className="text-xs font-semibold text-slate-300">Camera giả lập sẵn sàng</p>
                            <p className="text-[10px] text-slate-500">Chọn mã tài sản hoặc nhập mã QR để mô phỏng quét</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {scanErrorMsg && (
                      <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                        <span>{scanErrorMsg}</span>
                      </div>
                    )}

                    {/* Simulation Action Panel */}
                    <div className="space-y-4 pt-1">
                      {/* Input code simulation */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Mô phỏng nhập mã QR thủ công</label>
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSimulateScan(qrCodeInput);
                          }}
                          className="flex gap-2"
                        >
                          <input
                            type="text"
                            placeholder="Nhập mã ví dụ: AST-IT-101..."
                            value={qrCodeInput}
                            onChange={(e) => setQrCodeInput(e.target.value)}
                            className="bg-slate-900 border border-slate-800 focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500 focus:outline-none rounded-xl text-white font-mono text-xs px-3 py-2.5 flex-1"
                          />
                          <button
                            type="submit"
                            disabled={!qrCodeInput.trim() || isScanning}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800/40 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shrink-0"
                          >
                            Quét Thử
                          </button>
                        </form>
                      </div>

                      {/* Dropdown / quick badges list */}
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Hoặc click để quét nhanh tài sản trong kho</label>
                        <div className="max-h-[140px] overflow-y-auto border border-white/5 bg-slate-900/40 rounded-xl p-2.5 space-y-1.5">
                          {assets.length === 0 ? (
                            <p className="text-slate-500 text-xs text-center py-4">Chưa có tài sản nào trong hệ thống</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              {assets.map(asset => (
                                <button
                                  key={asset.id}
                                  onClick={() => {
                                    setQrCodeInput(asset.code);
                                    handleSimulateScan(asset.code);
                                  }}
                                  className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/5 text-left transition-all text-xs flex flex-col justify-between hover:border-emerald-500/40 group cursor-pointer"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="font-mono font-bold text-indigo-400 group-hover:text-emerald-400">{asset.code}</span>
                                    <span className="text-[8px] bg-white/5 px-1 py-0.5 rounded text-slate-400">{asset.status}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-300 truncate mt-1 w-full leading-none">{asset.name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Scan Success Result screen!
                  <div className="space-y-5">
                    {/* Scanned Badge */}
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-2">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest leading-none">NHẬN DIỆN MÃ QR THÀNH CÔNG</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Đã định vị bản ghi thiết bị tương thích</p>
                    </div>

                    {/* Scanned Card layout */}
                    <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl flex gap-3.5">
                      <div className="p-3 bg-slate-950 border border-white/5 rounded-xl text-indigo-400 shrink-0 self-start">
                        {getIconForType(scannedAsset.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-black text-xs text-[#818cf8] select-all">{scannedAsset.code}</span>
                          <span className={`text-[9px] px-2.5 py-0.5 rounded-full font-bold uppercase border shrink-0 ${
                            scannedAsset.status === "Sẵn sàng"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : scannedAsset.status === "Đang cấp phát"
                                ? "bg-[#6366F1]/10 text-[#a8bcd0] border-[#6366F1]/20"
                                : scannedAsset.status === "Đang bảo trì"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                                  : "bg-slate-800 text-slate-500 border-white/5"
                          }`}>
                            {scannedAsset.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white mt-1 leading-snug">{scannedAsset.name}</h4>
                        <p className="text-[11px] text-slate-400 font-mono mt-1 w-full whitespace-pre-wrap">{scannedAsset.specs}</p>
                        <p className="text-[10px] text-slate-500 mt-2">Vị trí kho chính: {scannedAsset.location}</p>
                      </div>
                    </div>

                    {/* Inter-state quick controls area */}
                    <div className="space-y-3 pt-2">
                      <h5 className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider pl-0.5">Hành động cập nhật nhanh trạng thái qua QR</h5>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {/* Maintenance option */}
                        <button
                          onClick={() => handleQuickUpdateStatus(scannedAsset.id, "Đang bảo trì")}
                          disabled={scannedAsset.status === "Đang bảo trì"}
                          className="p-2.5 bg-amber-500/10 hover:bg-amber-500/20 disabled:bg-slate-900 disabled:opacity-40 border border-amber-500/20 disabled:border-white/5 rounded-xl text-left transition-all cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-amber-400">
                            <Wrench className="w-3.5 h-3.5" />
                            Đưa Đi Bảo Trì
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">Chuyển sang trạng thái sửa lỗi</p>
                        </button>

                        {/* Available option */}
                        <button
                          onClick={() => handleQuickUpdateStatus(scannedAsset.id, "Sẵn sàng")}
                          disabled={scannedAsset.status === "Sẵn sàng"}
                          className="p-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:bg-slate-900 disabled:opacity-40 border border-emerald-500/20 disabled:border-white/5 rounded-xl text-left transition-all cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Chuyển Về Sẵn Sàng
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">Đưa về kho sẵn sàng cấp phát</p>
                        </button>

                        {/* Retire/Dispose option */}
                        <button
                          onClick={() => handleQuickUpdateStatus(scannedAsset.id, "Đã thanh lý")}
                          disabled={scannedAsset.status === "Đã thanh lý"}
                          className="p-2.5 bg-slate-800/60 hover:bg-slate-800 border border-white/5 rounded-xl text-left transition-all cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-1.5 font-bold text-slate-400">
                            <Trash2 className="w-3.5 h-3.5" />
                            Thanh Lý Thiết Bị
                          </div>
                          <p className="text-[9px] text-slate-400 mt-0.5">Xóa sổ, loại biên chức năng</p>
                        </button>

                        {/* Return to Warehouse if allocated */}
                        {scannedAsset.status === "Đang cấp phát" ? (
                          <button
                            onClick={() => handleQuickRevoke(scannedAsset.id)}
                            className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-xl text-left transition-all cursor-pointer text-xs animate-pulse"
                          >
                            <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                              <RotateCcw className="w-3.5 h-3.5" />
                              Thu Hồi Khẩn Cấp
                            </div>
                            <p className="text-[9px] text-slate-400 mt-0.5">Hủy phân quyền nắm giữ tài sản</p>
                          </button>
                        ) : null}
                      </div>

                      {/* Quick assignment options if status is set to Available ("Sẵn sàng") */}
                      {scannedAsset.status === "Sẵn sàng" && (
                        <div className="p-3 bg-indigo-950/20 border border-indigo-500/15 rounded-xl space-y-2 mt-2">
                          <label className="text-[9px] uppercase font-bold text-indigo-400 block">Cấp phát nhanh cho nhân viên</label>
                          <div className="flex gap-2">
                            <select
                              value={quickAssigneeId}
                              onChange={(e) => setQuickAssigneeId(e.target.value)}
                              className="bg-slate-900 border border-slate-800 rounded-lg text-white text-xs p-2 flex-1 focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">-- Chọn nhân sự --</option>
                              {employees.map(emp => (
                                <option key={emp.id} value={emp.id} className="bg-slate-950">
                                  {emp.name} ({emp.department})
                                </option>
                              ))}
                            </select>
                            <button
                              disabled={!quickAssigneeId}
                              onClick={() => handleQuickAssign(scannedAsset.id)}
                              className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/40 disabled:text-slate-500 rounded-lg text-xs font-bold text-white uppercase cursor-pointer"
                            >
                              Cấp Phát
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-950 flex justify-between items-center animate-none">
                {scannedAsset ? (
                  <button
                    onClick={() => {
                      setScannedAsset(null);
                      setScanErrorMsg(null);
                      setQrCodeInput("");
                    }}
                    className="px-4 py-2 hover:bg-white/5 border border-white/5 text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Quét Thiết Bị Khác
                  </button>
                ) : (
                  <div className="text-[10px] text-slate-500 font-mono">Ví dụ quét: AST-IT-123 hoặc tương đương</div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsQrScannerOpen(false)}
                    className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                  >
                    Đóng
                  </button>
                  {scannedAsset && (
                    <button
                      onClick={() => {
                        setSelectedAsset(scannedAsset);
                        setIsQrScannerOpen(false);
                      }}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
                    >
                      Bản chi tiết
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
