import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Coins, 
  Receipt, 
  Clock, 
  HelpCircle, 
  TrendingUp, 
  Briefcase, 
  UserCheck, 
  DollarSign, 
  Sliders,
  Sparkles,
  Download
} from "lucide-react";

interface HRPayrollEstimatorProps {
  theme: "light" | "dark";
  employees?: any[];
}

export default function HRPayrollEstimator({ theme, employees = [] }: HRPayrollEstimatorProps) {
  const [grossInput, setGrossInput] = useState<string>("15000000"); // 15,000,000 VND default
  const [workingDays, setWorkingDays] = useState<number>(22);
  const [dependentCount, setDependentCount] = useState<number>(0);
  const [insuranceSalaryCap, setInsuranceSalaryCap] = useState<boolean>(true);

  // Vietnam Standard Salary Rate and PIT Tax estimation states 
  const [hrReport, setHrReport] = useState<{
    dailyRate: number;
    hourlyRate: number;
    socialIns: number; // 8%
    healthIns: number; // 1.5%
    unemployIns: number; // 1%
    totalIns: number;
    pitTaxable: number;
    pitTax: number;
    netSalary: number;
    percentTaxable: number;
    percentIns: number;
    percentNet: number;
  }>({
    dailyRate: 15000000 / 22,
    hourlyRate: (15000000 / 22) / 8,
    socialIns: 15000000 * 0.08,
    healthIns: 15000000 * 0.015,
    unemployIns: 15000000 * 0.01,
    totalIns: 15000000 * 0.105,
    pitTaxable: Math.max(0, 15000000 - (15000000 * 0.105) - 11000000),
    pitTax: Math.max(0, 15000000 - (15000000 * 0.105) - 11000000) * 0.05,
    netSalary: 15000000 - (15000000 * 0.105) - (Math.max(0, 15000000 - (15000000 * 0.105) - 11000000) * 0.05),
    percentTaxable: 0,
    percentIns: 10.5,
    percentNet: 89.5
  });

  const calculateHRRateAndTaxes = () => {
    const gross = parseFloat(grossInput) || 0;
    const days = workingDays || 22;
    
    // 1. Daily rate & Hourly rate
    const dailyRate = gross / days;
    const hourlyRate = dailyRate / 8;

    // 2. Compulsory insurances (Standard employee rate: SI: 8%, HI: 1.5%, UI: 1%)
    // Base salary for insurance calculates capped at 20 times regional minimum base salary or general base
    // In VN currently, standard cap base is around 20 * 1.8M = 36M or region minimum depending on company.
    const maxInsuranceBase = 36000000; 
    const insuranceBase = insuranceSalaryCap ? Math.min(gross, maxInsuranceBase) : gross;
    
    const socialIns = insuranceBase * 0.08;
    const healthIns = insuranceBase * 0.015;
    const unemployIns = insuranceBase * 0.01;
    const totalIns = socialIns + healthIns + unemployIns;

    // 3. PIT Deduction (Self-deduction: 11M, Dependents: 4.4M each)
    const selfDeduction = 11000000;
    const dependentDeduction = dependentCount * 4400000;
    
    // Taxable income
    const taxableIncome = gross - totalIns - selfDeduction - dependentDeduction;
    const pitTaxable = Math.max(0, taxableIncome);

    // Vietnam's PIT brackets progressive tax schedule
    let pitTax = 0;
    if (pitTaxable > 0) {
      if (pitTaxable <= 5000000) {
        pitTax = pitTaxable * 0.05;
      } else if (pitTaxable <= 10000000) {
        pitTax = (pitTaxable * 0.1) - 250000;
      } else if (pitTaxable <= 18000000) {
        pitTax = (pitTaxable * 0.15) - 750000;
      } else if (pitTaxable <= 32000000) {
        pitTax = (pitTaxable * 0.20) - 1650000;
      } else if (pitTaxable <= 52000000) {
        pitTax = (pitTaxable * 0.25) - 3250000;
      } else if (pitTaxable <= 80000000) {
        pitTax = (pitTaxable * 0.30) - 5850000;
      } else {
        pitTax = (pitTaxable * 0.35) - 9850000;
      }
    }

    const netSalary = gross - totalIns - pitTax;

    // Relative distribution ratios
    const totalDeducts = totalIns + pitTax;
    const percentIns = gross > 0 ? (totalIns / gross) * 100 : 0;
    const percentTax = gross > 0 ? (pitTax / gross) * 100 : 0;
    const percentNet = gross > 0 ? (netSalary / gross) * 100 : 0;

    setHrReport({
      dailyRate,
      hourlyRate,
      socialIns,
      healthIns,
      unemployIns,
      totalIns,
      pitTaxable,
      pitTax,
      netSalary,
      percentTaxable: percentTax,
      percentIns,
      percentNet
    });
  };

  const handleQuickPresetGross = (amount: number) => {
    setGrossInput(amount.toString());
  };

  const isLight = theme === "light";

  React.useEffect(() => {
    calculateHRRateAndTaxes();
  }, [grossInput, workingDays, dependentCount, insuranceSalaryCap]);

  return (
    <div className={`flex flex-col h-full gap-4 ${isLight ? "text-slate-800" : "text-slate-200"}`}>
      {/* Header Info Panel */}
      <div className={`flex items-center justify-between border-b pb-2 shrink-0 select-none ${isLight ? "border-slate-200" : "border-white/5"}`}>
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-xl border ${isLight ? "bg-amber-50 border-amber-200" : "bg-amber-500/10 border-amber-500/20"}`}>
            <Coins className={`w-5 h-5 ${isLight ? "text-amber-600" : "text-amber-400"}`} />
          </div>
          <div>
            <h2 className={`text-sm font-extrabold ${isLight ? "text-slate-900" : "text-white"}`}>Công cụ Tính lương, Bảo hiểm & Thuế</h2>
            <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Ước tính lương Thực nhận (NET), Thuế Thu nhập Cá nhân (PIT) và Bảo hiểm Bắt buộc</p>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-mono ${
          isLight ? "bg-indigo-50 border border-indigo-200 text-indigo-700" : "bg-[#111422] border border-white/5 text-indigo-350"
        }`}>
          PIT Luật VN 2026
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-5 flex-1 min-h-0 overflow-y-auto pr-1">
        {/* Input Parameters panel */}
        <div className="flex-1 space-y-4">
          <div className={`p-4 rounded-2xl border space-y-4 shadow-sm transition-colors duration-300 ${
            isLight ? "bg-white border-slate-205 shadow-slate-100" : "bg-slate-900/60 border-white/5"
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 leading-none ${
                isLight ? "text-indigo-600" : "text-indigo-400"
              }`}>
                <Sliders className="w-3.5 h-3.5" /> Thông số thu nhập
              </span>
              <span className={`text-[10px] font-mono ${isLight ? "text-slate-400" : "text-slate-500"}`}>Bản nháp tính toán</span>
            </div>

            {/* Input Gross */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className={`text-[10px] font-bold uppercase tracking-wider ${isLight ? "text-slate-600" : "text-slate-405"}`}>Lương Gross Hàng Tháng (VND)</label>
                <span className={`text-[10px] font-mono font-black ${isLight ? "text-amber-600" : "text-amber-400"}`}>
                  {parseInt(grossInput).toLocaleString("vi-VN")} đ
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={grossInput}
                  onChange={(e) => setGrossInput(e.target.value)}
                  className={`rounded-xl font-mono text-sm font-bold p-3 focus:ring-1 focus:outline-none w-full pl-9 transition-colors ${
                    isLight 
                      ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-amber-500 focus:ring-amber-500/30" 
                      : "bg-slate-950 border border-slate-800 text-white focus:border-amber-550 focus:ring-amber-500/30"
                  }`}
                  placeholder="Nhập mức lương gross..."
                />
                <span className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold ${isLight ? "text-slate-400" : "text-slate-500"}`}>₫</span>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="space-y-1.5">
              <span className={`text-[9px] font-semibold uppercase tracking-wider ${isLight ? "text-slate-500" : "text-slate-405"}`}>Mức lương mẫu nhanh</span>
              <div className="grid grid-cols-4 gap-2">
                {[12000000, 20000000, 35000000, 50000000].map(amt => (
                  <button
                    key={amt}
                    onClick={() => handleQuickPresetGross(amt)}
                    className={`py-1.5 px-2 border rounded-lg text-[10px] font-mono cursor-pointer transition-colors text-center ${
                      parseInt(grossInput) === amt 
                        ? (isLight ? "border-amber-500 bg-amber-50 text-amber-700 font-bold" : "border-amber-500/50 bg-amber-500/5 text-amber-300") 
                        : (isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-950 border-white/5 text-zinc-400 hover:border-amber-500/40 hover:text-white")
                    }`}
                  >
                    {(amt / 1000000) + " Triệu"}
                  </button>
                ))}
              </div>
            </div>

            {/* Config Sliders & numeric inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold block uppercase tracking-wide leading-tight ${isLight ? "text-slate-600" : "text-slate-400"}`}>Số ngày công thực tế (Vận hành)</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={workingDays}
                    onChange={(e) => setWorkingDays(Math.max(1, parseInt(e.target.value) || 22))}
                    className={`rounded-xl text-xs p-2.5 font-mono w-full focus:outline-none ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500" 
                        : "bg-slate-950 border border-slate-800 text-white focus:border-indigo-500"
                    }`}
                  />
                  <div className="flex gap-1">
                    {[22, 24, 26].map(d => (
                      <button
                        key={d}
                        onClick={() => setWorkingDays(d)}
                        className={`px-2.5 py-1 text-[10px] font-mono font-bold border rounded-lg cursor-pointer ${
                          workingDays === d 
                            ? (isLight ? "bg-indigo-600 border-indigo-650 text-white" : "bg-indigo-600/20 border-indigo-500 text-indigo-300") 
                            : (isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/10")
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] font-bold block uppercase tracking-wide leading-tight ${isLight ? "text-slate-600" : "text-slate-400"}`}>Số người phụ thuộc giảm trừ gia cảnh</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    value={dependentCount}
                    onChange={(e) => setDependentCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className={`rounded-xl text-xs p-2.5 font-mono w-full focus:outline-none ${
                      isLight 
                        ? "bg-slate-50 border border-slate-200 text-slate-900 focus:border-indigo-500" 
                        : "bg-slate-950 border border-slate-800 text-white focus:border-indigo-500"
                    }`}
                  />
                  <div className="flex gap-1">
                    {[0, 1, 2].map(dep => (
                      <button
                        key={dep}
                        onClick={() => setDependentCount(dep)}
                        className={`px-3 py-1 text-[10px] font-mono font-bold border rounded-lg cursor-pointer ${
                          dependentCount === dep 
                            ? (isLight ? "bg-indigo-600 border-indigo-650 text-white" : "bg-indigo-600/20 border-indigo-500 text-indigo-300") 
                            : (isLight ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100" : "bg-slate-950 border-white/5 text-slate-400 hover:border-white/10")
                        }`}
                      >
                        {dep}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Insurance config toggle */}
            <div className={`flex items-center justify-between pt-1 border-t ${isLight ? "border-slate-150" : "border-white/3"}`}>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-bold ${isLight ? "text-slate-600" : "text-slate-350"}`}>Áp trần đóng Bảo hiểm bắt buộc (36.000.000đ)</span>
                <div className="group relative">
                  <HelpCircle className={`w-3.5 h-3.5 cursor-help ${isLight ? "text-slate-400 hover:text-slate-600" : "text-slate-500 hover:text-slate-300"}`} />
                  <div className={`hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 text-[10px] rounded border w-48 z-20 ${
                    isLight ? "bg-white border-slate-200 text-slate-600 shadow-lg" : "bg-slate-950 text-slate-300 border-white/10"
                  }`}>
                    Theo luật xã hội, tiền đóng bảo hiểm xã hội, y tế, thất nghiệp được áp trần đóng tối đa ở mức 20 lần lương cơ sở.
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInsuranceSalaryCap(!insuranceSalaryCap)}
                className={`px-3 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-colors ${
                  insuranceSalaryCap 
                    ? (isLight ? "bg-emerald-600 text-white border border-emerald-600" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30") 
                    : (isLight ? "bg-slate-100 text-slate-500 border border-slate-250 hover:bg-slate-200" : "bg-slate-950 text-slate-400 border border-white/5")
                }`}
              >
                {insuranceSalaryCap ? "Bật" : "Tắt"}
              </button>
            </div>
          </div>

          {/* Quick FAQ / Rule Reference */}
          <div className={`p-3.5 rounded-2xl text-[10px] leading-relaxed flex items-start gap-2 h-auto border transition-colors ${
            isLight ? "bg-indigo-50/50 border-indigo-100 text-indigo-805" : "bg-[#111422] border-indigo-500/10 text-indigo-300"
          }`}>
            <HelpCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isLight ? "text-indigo-600" : "text-indigo-400"}`} />
            <div className="space-y-1 font-sans">
              <span className={`font-bold block ${isLight ? "text-slate-900" : "text-slate-100"}`}>Quy chuẩn tính thuế & khấu trừ tại Việt Nam (Cập nhật 2026):</span>
              <ul className={`list-disc pl-3.5 space-y-1 text-[10px] ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                <li><b>Miễn thuế cá nhân (Bản thân)</b>: Cố định 11.000.000 VND / tháng.</li>
                <li><b>Người phụ thuộc</b>: Giảm trừ thêm 4.400.000 VND / mỗi người đăng ký.</li>
                <li><b>Bảo hiểm bắt buộc xã hội</b>: BHXH 8%, BHYT 1.5%, BHTN 1% (Tổng cộng 10.5%).</li>
                <li>Thuế TNCN lũy tiến từng phần với các bậc thuế suất: 5%, 10%, 15%, 20%, 25%, 30%, 35%.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Output Diagnostics & Statistics Graph card */}
        <div className="w-full lg:w-80 shrink-0 space-y-4">
          <div className={`p-5 rounded-2xl border shadow-lg space-y-4 transition-colors duration-300 ${
            isLight ? "bg-white border-slate-205 shadow-slate-100" : "bg-slate-900/60 border-white/10"
          }`}>
            <div className={`border-b pb-3 ${isLight ? "border-slate-150" : "border-white/5"}`}>
              <span className={`text-[10px] font-bold uppercase tracking-widest block pl-0.5 mb-1 ${
                isLight ? "text-slate-500" : "text-slate-400"
              }`}>Ước tính thực nhận (Net)</span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-3xl font-mono font-black select-all tracking-tight leading-none ${
                  isLight ? "text-emerald-600" : "text-emerald-400"
                }`}>
                  {Math.round(hrReport.netSalary).toLocaleString("vi-VN")}
                </span>
                <span className={`text-xs font-sans ${isLight ? "text-slate-500" : "text-slate-400"}`}>VND / Tháng</span>
              </div>
            </div>

            {/* Income Distribution Visualizer */}
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-semibold">
                <span className={isLight ? "text-slate-500" : "text-slate-400"}>Cơ cấu phân bổ lương Gross</span>
                <span className={isLight ? "text-indigo-600" : "text-indigo-400"}>Thực nhận / Khấu trừ</span>
              </div>
              
              {/* Stacked Percentage bar chart */}
              <div className={`h-3.5 w-full rounded-full overflow-hidden flex p-px ${
                isLight ? "bg-slate-100 border border-slate-200" : "bg-slate-950 overflow-hidden flex border border-white/5"
              }`}>
                {hrReport.percentNet > 0 && (
                  <div 
                    style={{ width: `${hrReport.percentNet}%` }} 
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-450" 
                    title={`Net Salary: ${hrReport.percentNet.toFixed(1)}%`}
                  />
                )}
                {hrReport.percentIns > 0 && (
                  <div 
                    style={{ width: `${hrReport.percentIns}%` }} 
                    className="h-full bg-yellow-500" 
                    title={`Insurances: ${hrReport.percentIns.toFixed(1)}%`}
                  />
                )}
                {hrReport.percentTaxable > 0 && (
                  <div 
                    style={{ width: `${hrReport.percentTaxable}%` }} 
                    className="h-full bg-rose-500" 
                    title={`PIT Tax: ${hrReport.percentTaxable.toFixed(1)}%`}
                  />
                )}
              </div>

              {/* Chart Legend */}
              <div className="grid grid-cols-3 gap-2 text-[9px] font-mono text-center pt-1.5">
                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isLight ? "bg-emerald-600" : "bg-emerald-400"}`} />
                    <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Net:</span>
                  </div>
                  <span className={`font-bold ${isLight ? "text-emerald-650" : "text-emerald-400"}`}>{hrReport.percentNet.toFixed(1)}%</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                    <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Bảo hiểm:</span>
                  </div>
                  <span className={`font-bold ${isLight ? "text-yellow-600" : "text-yellow-405"}`}>{hrReport.percentIns.toFixed(1)}%</span>
                </div>

                <div className="flex flex-col items-center gap-0.5">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span className={`text-[9px] ${isLight ? "text-slate-500" : "text-slate-400"}`}>Thuế PIT:</span>
                  </div>
                  <span className="text-rose-500 font-bold">{hrReport.percentTaxable.toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Khấu trừ chi tiết */}
            <div className={`space-y-2 pt-2 border-t ${isLight ? "border-slate-150" : "border-white/5"}`}>
              <h5 className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-indigo-600" : "text-indigo-400"
              }`}>
                <Receipt className="w-3.5 h-3.5" />
                Khấu trừ bảo hiểm & thuế PIT
              </h5>
              <div className="space-y-1.5 font-mono text-[10px]">
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>Lương Gross gốc:</span>
                  <span className={`font-bold ${isLight ? "text-slate-800" : "text-white"}`}>{Math.round(parseFloat(grossInput) || 0).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>BHXH (8%):</span>
                  <span className={isLight ? "text-slate-700" : "text-slate-350"}>-{Math.round(hrReport.socialIns).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>BHYT (1.5%):</span>
                  <span className={isLight ? "text-slate-700" : "text-slate-350"}>-{Math.round(hrReport.healthIns).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>BHTN (1%):</span>
                  <span className={isLight ? "text-slate-700" : "text-slate-350"}>-{Math.round(hrReport.unemployIns).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 px-1 rounded ${
                  isLight ? "bg-yellow-50 text-yellow-800 border-yellow-250" : "bg-yellow-500/5 px-1"
                }`}>
                  <span className={`font-bold ${isLight ? "text-yellow-700" : "text-yellow-400"}`}>Tổng Bảo hiểm đóng:</span>
                  <span className={`font-bold ${isLight ? "text-rose-600" : "text-rose-400"}`}>- {Math.round(hrReport.totalIns).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>Thu nhập tính thuế PIT:</span>
                  <span className={isLight ? "text-slate-700" : "text-slate-200"}>{Math.round(hrReport.pitTaxable).toLocaleString("vi-VN")} đ</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 px-1 rounded ${
                  isLight ? "bg-rose-50 text-rose-800 border-rose-250" : "bg-rose-500/5 px-1"
                }`}>
                  <span className={`font-bold ${isLight ? "text-rose-700" : "text-rose-400"}`}>Thuế PIT cá nhân tạm nộp:</span>
                  <span className={`font-bold ${hrReport.pitTax > 0 ? "text-rose-600" : "text-emerald-450"}`}>
                    -{Math.round(hrReport.pitTax).toLocaleString("vi-VN")} đ
                  </span>
                </div>
              </div>
            </div>

            {/* Đơn giá thời gian */}
            <div className={`space-y-1.5 pt-2 border-t ${isLight ? "border-slate-150" : "border-white/5"}`}>
              <h5 className={`text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 ${
                isLight ? "text-indigo-600" : "text-indigo-400"
              }`}>
                <Clock className="w-3.5 h-3.5" />
                Đơn giá thời gian lao động
              </h5>
              <div className="space-y-1 font-mono text-[10px]">
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>Đơn giá ngày công:</span>
                  <span className={`font-extrabold ${isLight ? "text-indigo-600" : "text-indigo-300"}`}>{Math.round(hrReport.dailyRate).toLocaleString("vi-VN")} đ/ngày</span>
                </div>
                <div className={`flex justify-between border-b border-dashed py-0.5 ${isLight ? "border-slate-155" : "border-white/3"}`}>
                  <span className={isLight ? "text-slate-500" : "text-slate-400"}>Đơn giá giờ công:</span>
                  <span className={`font-extrabold ${isLight ? "text-indigo-600" : "text-indigo-300"}`}>{Math.round(hrReport.hourlyRate).toLocaleString("vi-VN")} đ/giờ</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => {
                const reportContent = `
=== ĐÃ XUẤT HÓA ĐƠN NHÁP LUỸ TIẾN ===
Tổng Lương Gross: ${parseFloat(grossInput).toLocaleString("vi-VN")} VND
Thời gian đóng công: ${workingDays} ngày
Số người phụ thuộc đăng ký: ${dependentCount}
Bảo hiểm xã hội bắt buộc: ${Math.round(hrReport.totalIns).toLocaleString("vi-VN")} VND
Thuế thu nhập cá nhân ước tính: ${Math.round(hrReport.pitTax).toLocaleString("vi-VN")} VND
-------------------------------------------------------
Lương Thực nhận ước tính (NET): ${Math.round(hrReport.netSalary).toLocaleString("vi-VN")} VND
                `;
                alert(reportContent);
              }}
              className={`w-full py-2.5 border text-[10px] font-bold uppercase tracking-wider rounded-xl cursor-pointer text-center flex items-center justify-center gap-2 transition-all duration-200 ${
                isLight 
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-650 shadow-sm" 
                  : "bg-[#111422] hover:bg-[#141b2e] border border-white/5 hover:border-amber-500/30 text-amber-400"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span>In chi tiết hóa đơn nháp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
