import { Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import AttendancePage from "./pages/AttendancePage";
import AttendanceHistory from "./pages/AttendanceHistory";
import EmployeeManagement from "./pages/EmployeeManagement";
import DeviceManagement from "./pages/DeviceManagement";
import SettingsPage from "./pages/SettingsPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      {/* 🛠️ PERBAIKAN UTAMA: Jalur independen untuk halaman depan */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Pintu Utama Dashboard Admin Layout */}
      <Route element={<DashboardLayout />}>
        {/* Jalur internal dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/absensi" element={<AttendancePage />} />
        <Route path="/riwayat" element={<AttendanceHistory />} />
        <Route path="/karyawan" element={<EmployeeManagement />} />
        <Route path="/perangkat" element={<DeviceManagement />} />
        <Route path="/pengaturan" element={<SettingsPage />} />
        <Route path="/log" element={<ActivityLogPage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}