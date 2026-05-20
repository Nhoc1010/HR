/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import Employees from "./components/Employees";
import TimeAttendance from "./components/TimeAttendance";
import LeaveManagement from "./components/LeaveManagement";
import Tasks from "./components/Tasks";
import Recruitment from "./components/Recruitment";
import Contracts from "./components/Contracts";
import Payroll from "./components/Payroll";
import { 
  initialEmployees, 
  initialAttendance, 
  initialLeaveRequests, 
  initialTasks, 
  initialCandidates,
  initialContracts,
  initialPayroll
} from "./mockData";
import { Employee, Attendance, LeaveRequest, HRMTask, Candidate, Contract, Payroll as PayrollType } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  
  // App-level Shared State
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [attendance, setAttendance] = useState<Attendance[]>(initialAttendance);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeaveRequests);
  const [tasks, setTasks] = useState<HRMTask[]>(initialTasks);
  const [candidates, setCandidates] = useState<Candidate[]>(initialCandidates);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [payroll, setPayroll] = useState<PayrollType[]>(initialPayroll);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard 
            employees={employees} 
            attendance={attendance} 
            leaveRequests={leaveRequests} 
            candidates={candidates}
            setActiveTab={setActiveTab}
          />
        );
      case "employees":
        return (
          <Employees 
            employees={employees} 
            setEmployees={setEmployees} 
            contracts={contracts}
            setContracts={setContracts}
            payroll={payroll}
            setPayroll={setPayroll}
            attendance={attendance}
            setAttendance={setAttendance}
          />
        );
      case "attendance":
        return (
          <TimeAttendance 
            employees={employees} 
            attendance={attendance} 
            setAttendance={setAttendance} 
          />
        );
      case "leaves":
        return (
          <LeaveManagement 
            employees={employees} 
            leaveRequests={leaveRequests} 
            setLeaveRequests={setLeaveRequests}
            setEmployees={setEmployees}
          />
        );
      case "contracts":
        return (
          <Contracts 
            employees={employees} 
            setEmployees={setEmployees} 
            contracts={contracts} 
            setContracts={setContracts}
          />
        );
      case "payroll":
        return (
          <Payroll 
            employees={employees} 
            attendance={attendance} 
            leaveRequests={leaveRequests} 
            contracts={contracts}
            payroll={payroll}
            setPayroll={setPayroll}
          />
        );
      case "tasks":
        return <Tasks employees={employees} tasks={tasks} setTasks={setTasks} />;
      case "recruitment":
        return <Recruitment candidates={candidates} setCandidates={setCandidates} />;
      default:
        return (
          <div className="text-center text-slate-400 py-20 font-medium">
            Tính năng đang phát triển...
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#0F1115] to-[#0A0B10] font-sans antialiased text-[#F8FAFC] overflow-hidden relative">
      {/* Absolute high-tech glowing backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6366F1]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#A855F7]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
      />

      {/* Main Content Hub */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto relative z-10 px-6 sm:px-8 py-6 select-text">
        <div className="max-w-7xl w-full mx-auto pb-12">
          {renderActiveTab()}
        </div>
      </main>
    </div>
  );
}
