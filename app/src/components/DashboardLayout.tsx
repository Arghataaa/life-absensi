import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Camera,
  CalendarClock,
  Users,
  Cpu,
  Settings,
  Activity,
  Menu,
  X,
  LogOut,
  Bell,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"; // 👈 BarChart3 dihapus karena menu laporan sudah tidak dipakai

// 🛠️ PERBAIKAN: Menu Laporan sudah dihapus total dari daftar navigasi utama
const menuItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/absensi", icon: Camera, label: "Absensi" },
  { path: "/riwayat", icon: CalendarClock, label: "Riwayat Absensi" },
  { path: "/karyawan", icon: Users, label: "Karyawan", roles: ["ADMIN", "HR"] },
  { path: "/perangkat", icon: Cpu, label: "Perangkat", roles: ["ADMIN"] },
  { path: "/pengaturan", icon: Settings, label: "Pengaturan", roles: ["ADMIN"] },
  { path: "/log", icon: Activity, label: "Log Aktivitas", roles: ["ADMIN"] },
];

export default function DashboardLayout() {
  const { user, isAuthenticated, logout, isAdmin, isHR } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated && !isLoading()) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  function isLoading() {
    return false;
  }

  const filteredMenu = menuItems.filter((item) => {
    if (!item.roles) return true;
    if (item.roles.includes("ADMIN") && isAdmin) return true;
    if (item.roles.includes("HR") && isHR) return true;
    return false;
  });

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-16"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
            <Link to="/dashboard" className="flex items-center gap-2 overflow-hidden">
              <img src="/logo-lifemedia.png" alt="LifeMedia" className="h-7 w-auto min-w-[28px]" />
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap"
                >
                  LifeAbsensi
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => { setSidebarOpen(!sidebarOpen); setMobileOpen(false); }}
              className="hidden lg:flex p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-4 h-4 text-slate-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-500" />
              )}
            </button>
            <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredMenu.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-l-3 border-blue-600"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className={`w-5 h-5 min-w-[20px] ${isActive ? "text-blue-600" : ""}`} />
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-700">
            <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold min-w-[32px]">
                {user?.name?.charAt(0) ?? "U"}
              </div>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                    {user?.name ?? "User"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.role ?? "EMPLOYEE"}
                  </p>
                </motion.div>
              )}
            </div>
            {sidebarOpen && (
              <button
                onClick={logout}
                className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-16"}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {location.pathname === "/dashboard" && "Dashboard"}
              {location.pathname === "/absensi" && "Absensi"}
              {location.pathname === "/riwayat" && "Riwayat Absensi"}
              {location.pathname === "/karyawan" && "Manajemen Karyawan"}
              {location.pathname === "/perangkat" && "Manajemen Perangkat"}
              {location.pathname === "/pengaturan" && "Pengaturan Sistem"}
              {location.pathname === "/log" && "Log Aktivitas"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-slate-500" />
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
                  >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                      <h3 className="font-semibold text-slate-900 dark:text-white">Notifikasi</h3>
                    </div>
                    <div className="p-4 text-center text-sm text-slate-500">
                      Tidak ada notifikasi baru
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.charAt(0) ?? "U"}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}