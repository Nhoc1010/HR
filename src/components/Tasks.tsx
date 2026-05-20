/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Plus, 
  Briefcase, 
  User, 
  Clock, 
  CheckCircle, 
  X, 
  ArrowRight, 
  ArrowLeft,
  Trash2,
  AlertCircle
} from "lucide-react";
import { Employee, HRMTask } from "../types";

interface TasksProps {
  employees: Employee[];
  tasks: HRMTask[];
  setTasks: Dispatch<SetStateAction<HRMTask[]>>;
}

export default function Tasks({ employees, tasks, setTasks }: TasksProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [assignedId, setAssignedId] = useState("");
  const [priority, setPriority] = useState<"Thấp" | "Trung bình" | "Cao">("Trung bình");
  const [dueDate, setDueDate] = useState("2026-05-31");
  const [formError, setFormError] = useState<string | null>(null);

  const columns: { id: "Chờ làm" | "Đang làm" | "Hoàn thành"; label: string; color: string; border: string }[] = [
    { id: "Chờ làm", label: "Chờ làm", color: "bg-slate-950/40", border: "border-indigo-950" },
    { id: "Đang làm", label: "Đang làm", color: "bg-indigo-950/10", border: "border-indigo-500/10" },
    { id: "Hoàn thành", label: "Hoàn thành", color: "bg-emerald-950/5", border: "border-emerald-500/10" }
  ];

  const handleShiftStatus = (id: string, newStatus: "Chờ làm" | "Đang làm" | "Hoàn thành") => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !assignedId) {
      setFormError("Vui lòng điền tiêu đề công việc và chọn người thực hiện!");
      return;
    }
    setFormError(null);

    const assignee = employees.find(emp => emp.id === assignedId);
    if (!assignee) return;

    const newTask: HRMTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDesc,
      assignedTo: assignee.id,
      assignedName: assignee.name,
      dueDate: dueDate,
      status: "Chờ làm",
      priority: priority
    };

    setTasks([newTask, ...tasks]);
    setIsModalOpen(false);
    setTaskTitle("");
    setTaskDesc("");
    setAssignedId("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Bảng công việc quản lý (Kanban)</h1>
          <p className="text-slate-400 text-sm mt-1">Phân chia nhiệm vụ nội bộ, theo dõi tiến độ xử lý KPI của các phòng ban.</p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setIsModalOpen(true);
          }}
          className="px-5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm flex items-center justify-center space-x-2 shrink-0 transition-all active:scale-95 cursor-pointer glow-purple shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm công việc mới</span>
        </button>
      </div>

      {/* Grid structure columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.id);
          return (
            <div 
              key={col.id} 
              className={`p-4 rounded-2xl ${col.color} border ${col.border} flex flex-col min-h-[500px]`}
            >
              {/* Column Title */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/40">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    col.id === "Chờ làm" 
                      ? "bg-indigo-400" 
                      : col.id === "Đang làm" 
                        ? "bg-amber-400" 
                        : "bg-emerald-400"
                  }`} />
                  <span className="text-sm font-bold text-white tracking-wide">{col.label}</span>
                </div>
                <span className="text-xs bg-slate-900 leading-none px-2 py-1 rounded-md text-slate-400 font-mono font-bold">
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards list */}
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                <AnimatePresence mode="popLayout">
                  {colTasks.map((task) => (
                    <motion.div
                      layout
                      key={task.id}
                      id={`task-card-${task.id}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      whileHover={{ scale: 1.015 }}
                      className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700/60 shadow-md group space-y-3 relative"
                    >
                      {/* Priority Tag */}
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                          task.priority === "Cao" 
                            ? "bg-rose-500/10 text-rose-400" 
                            : task.priority === "Trung bình"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-slate-800 text-slate-400"
                        }`}>
                          {task.priority} Priority
                        </span>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 hover:bg-slate-800 rounded text-slate-500 hover:text-rose-450 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Main info */}
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white tracking-wide leading-snug group-hover:text-violet-300 duration-200">
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed truncate-2-lines">
                          {task.description}
                        </p>
                      </div>

                      {/* Assignee & Due Date banner */}
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-1.5 text-slate-300">
                          <div className="w-5 h-5 rounded-full bg-violet-950 block border border-violet-850 text-[9px] font-bold text-violet-300 flex items-center justify-center">
                            {task.assignedName.charAt(0)}
                          </div>
                          <span className="truncate max-w-[90px] font-semibold">{task.assignedName}</span>
                        </div>
                        <span className="text-slate-500 font-mono flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-slate-600 mr-0.5 shrink-0" />
                          <span>{task.dueDate}</span>
                        </span>
                      </div>

                      {/* Manual Shifting controls */}
                      <div className="flex justify-end pt-1.5 space-x-1">
                        {col.id !== "Chờ làm" && (
                          <button
                            onClick={() => handleShiftStatus(task.id, col.id === "Hoàn thành" ? "Đang làm" : "Chờ làm")}
                            className="p-1 rounded bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== "Hoàn thành" && (
                          <button
                            onClick={() => handleShiftStatus(task.id, col.id === "Chờ làm" ? "Đang làm" : "Hoàn thành")}
                            className="p-1 rounded bg-slate-950 border border-slate-850 hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                    </motion.div>
                  ))}
                </AnimatePresence>

                {colTasks.length === 0 && (
                  <div className="py-20 text-center text-slate-600 border border-dashed border-slate-850 rounded-xl">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-700" />
                    <p className="text-xs">Trống</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
            >
              <div className="p-5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="p-2 bg-violet-650 text-white rounded-xl">
                    <Briefcase className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="text-md font-bold text-white">Giao Công Việc Mới</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Lên lịch dự án KPI cho cán bộ cụ thể</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="p-5 space-y-4">
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
                  <label className="text-xs text-slate-400">Tiêu đề công việc *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Viết tài liệu on-boarding cho phòng Tech"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Mô tả công việc</label>
                  <textarea
                    rows={2}
                    placeholder="VD: Cần soạn nháp 5 trang trước ngày 22 để mọi người góp ý."
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Chọn Nhân Sự Đảm Nhiệm *</label>
                  <select
                    required
                    value={assignedId}
                    onChange={(e) => setAssignedId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-905 border border-slate-800 rounded-xl text-white text-sm focus:outline-none"
                  >
                    <option value="">-- Chọn cán sự --</option>
                    {employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.code}) — {e.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Độ ưu tiên</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    >
                      <option value="Thấp">Thấp</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Cao">Cao</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-slate-400">Hạn chót hoàn thành</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-905 border border-slate-800 rounded-xl text-white text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/50 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white cursor-pointer shadow-lg glow-purple"
                  >
                    Tạo nhiệm vụ
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
