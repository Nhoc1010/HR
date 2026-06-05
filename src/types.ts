/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Employee {
  id: string;
  code: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  startDate: string;
  birthDate: string;
  salary: number;
  department: string;
  gender: "Nam" | "Nữ";
  address: string;
  bhxhNumber: string;
  bhxhJoinDate: string;
  contractType: string;
  contractStartDate: string;
  status: "Đang làm" | "Nghỉ phép" | "Thử việc" | "Đã nghỉ";
  documents?: { id: string; name: string; type: string; url?: string; uploadDate: string; size?: string }[];
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkIn: string; // HH:MM:SS or null
  checkOut: string; // HH:MM:SS or null
  status: "Đúng giờ" | "Đi muộn" | "Vắng mặt" | "Nghỉ phép";
  notes?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: "Phép năm" | "Nghỉ ốm" | "Việc riêng" | "Thai sản";
  status: "Chờ duyệt" | "Đã duyệt" | "Bị từ chối";
}

export interface HRMTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // employeeId
  assignedName: string;
  dueDate: string;
  status: "Chờ làm" | "Đang làm" | "Hoàn thành";
  priority: "Thấp" | "Trung bình" | "Cao";
  progress?: number;
}

export interface Candidate {
  id: string;
  name: string;
  position: string;
  phone: string;
  email: string;
  status: "Ứng tuyển" | "Sàng lọc" | "Phỏng vấn" | "Đề nghị" | "Đã tuyển" | "Không đạt";
  score: number; // 0-100
  notes: string;
  cvSummary?: string;
  interviewType?: string;
}

export interface Message {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface Contract {
  id: string;
  employeeId: string;
  employeeName: string;
  type: "Không xác định thời hạn" | "Xác định thời hạn (12 tháng)" | "Xác định thời hạn (24 tháng)" | "Thử việc";
  startDate: string;
  endDate: string; // "Vô thời hạn" or YYYY-MM-DD
  basicSalary: number;
  allowance: number; // Phụ cấp
  status: "Đang hiệu lực" | "Hết hạn" | "Chờ gia hạn";
  history?: { date: string; action: string; note: string }[];
}

export interface Payroll {
  id: string;
  employeeId: string;
  employeeName: string;
  month: string; // e.g., "05/2026"
  basicSalary: number;
  workDays: number; // Lấy từ Chấm công
  overtimeHours: number; // Tăng ca
  allowance: number; // Phụ cấp từ hợp đồng
  deductions: number; // Khấu trừ (đi muộn, bảo hiểm, v.v...)
  advance: number; // Tạm ứng
  netSalary: number; // Thực lĩnh
  status: "Đã thanh toán" | "Chờ duyệt" | "Đang tính toán";
}

export interface Asset {
  id: string;
  code: string;
  name: string;
  type: "Laptop/PC" | "Màn hình" | "Thiết bị mạng" | "Thiết bị di động" | "Phụ kiện văn phòng" | "Khác";
  status: "Sẵn sàng" | "Đang cấp phát" | "Đang bảo trì" | "Đã thanh lý";
  assignedTo?: string; // Employee ID
  assignedName?: string; // Employee Name
  specs: string; // Hardware Configuration specs
  value: number; // Value in VND
  purchaseDate: string; // Date of asset purchase (YYYY-MM-DD)
  warrantyMonths: number; // Warranty periods in months
  location: string; // Office, desk location
}

