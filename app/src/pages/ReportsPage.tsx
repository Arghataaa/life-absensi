import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { TrendingUp, Clock, Users, AlertTriangle } from "lucide-react";

export default function ReportsPage() {
  const [period, setPeriod] = useState("bulan");
  const { data: monthlyData } = trpc.attendance.getMonthly.useQuery();

  const deptStats = monthlyData?.departmentStats ?? [];
  const dailyTrend = monthlyData?.dailyTrend ?? [];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Laporan & Analitik</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Analisis tren kehadiran dan produktivitas
        </p>
      </motion.div>

      {/* Period Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2"
      >
        {["hari", "minggu", "bulan", "tahun"].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              period === p
                ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50"
            }`}
          >
            {p === "hari" ? "Hari Ini" : p === "minggu" ? "Minggu Ini" : p === "bulan" ? "Bulan Ini" : "Tahun Ini"}
          </button>
        ))}
      </motion.div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Rata-rata Kehadiran", value: "94.2%", icon: TrendingUp, color: "text-emerald-500" },
          { label: "Rata-rata Keterlambatan", value: "12 menit", icon: Clock, color: "text-amber-500" },
          { label: "Karyawan Rajin", value: "5 orang", icon: Users, color: "text-blue-500" },
          { label: "Sering Terlambat", value: "3 orang", icon: AlertTriangle, color: "text-red-500" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700"
          >
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <p className="text-xl font-bold text-slate-900 dark:text-white">{s.value}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Trend Kehadiran Harian
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyTrend.slice(-15)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => v.slice(8)} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Legend fontSize={11} />
              <Line type="monotone" dataKey="hadir" stroke="#10b981" strokeWidth={2} dot={false} name="Hadir" />
              <Line type="monotone" dataKey="terlambat" stroke="#f59e0b" strokeWidth={2} dot={false} name="Terlambat" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
            Kehadiran per Departemen
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={deptStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" stroke="#94a3b8" fontSize={11} />
              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={80} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="hadir" fill="#10b981" radius={[0, 4, 4, 0]} name="Hadir" />
              <Bar dataKey="terlambat" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Terlambat" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700"
      >
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">
          Ringkasan Kehadiran
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase">
                <th className="px-4 py-3 text-left">Departemen</th>
                <th className="px-4 py-3 text-left">Total Karyawan</th>
                <th className="px-4 py-3 text-left">Hadir</th>
                <th className="px-4 py-3 text-left">Terlambat</th>
                <th className="px-4 py-3 text-left">Tingkat Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {deptStats.map((dept) => {
                const rate = dept.total > 0 ? ((dept.hadir / (dept.total * 30)) * 100).toFixed(1) : "0";
                return (
                  <tr key={dept.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{dept.name}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{dept.total}</td>
                    <td className="px-4 py-3 text-emerald-600">{dept.hadir}</td>
                    <td className="px-4 py-3 text-amber-600">{dept.terlambat}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min(100, Number(rate))}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
