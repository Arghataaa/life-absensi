import { useState } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
// ✅ SEKARANG SUDAH DITAMBAHKAN IKON TRASH2
import { Search, Calendar, RotateCcw, Trash2 } from "lucide-react";

export default function AttendanceHistory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");

  const utils = trpc.useUtils();

  // Ambil data real-time via tRPC dengan polling interval 2 detik
  const { data, isLoading } = trpc.attendance.list.useQuery(undefined, {
    refetchInterval: 2000,
  });

  // ✅ BARU: Mutasi pemicu hapus data riwayat ke backend router
  const deleteAttendance = trpc.attendance.delete.useMutation({
    onSuccess: () => {
      // Refresh data tabel otomatis setelah sukses menghapus
      utils.attendance.list.invalidate();
    },
  });

  const records = Array.isArray(data) ? data : [];

  const filteredRecords = records.filter((record: any) => {
    const displayNama = record.nama || record.employee_name || "Karyawan";
    const matchSearch = search ? displayNama.toLowerCase().includes(search.toLowerCase()) : true;
    const matchStatus = status ? (record.status || "").toUpperCase() === status.toUpperCase() : true;
    const matchType   = type ? (record.type || "").toUpperCase() === type.toUpperCase() : true;
    const matchDate   = filterDate ? record.tanggal === filterDate : true;

    return matchSearch && matchStatus && matchType && matchDate;
  });

  const getStatusBadge = (s: string) => {
    const currentStatus = (s || "").toUpperCase();
    if (currentStatus.includes("TEPAT") || currentStatus === "HADIR") {
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
    } else if (currentStatus.includes("TERLAMBAT")) {
      return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
    } else {
      return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400";
    }
  };

  const getTypeBadge = (t: string) => {
    if ((t || "").toUpperCase() === "PULANG") return "text-indigo-600 font-semibold";
    return "text-emerald-600 font-semibold";
  };

  return (
    <div className="space-y-6 p-2">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Riwayat Absensi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola dan filter data kehadiran karyawan
        </p>
      </motion.div>

      {/* FILTER AREA */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama karyawan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none focus:ring-1 focus:ring-blue-500 text-slate-900 dark:text-white"
          />
        </div>
        
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-300">
          <option value="">Semua Status</option>
          <option value="TEPAT WAKTU">Tepat Waktu</option>
          <option value="TERLAMBAT">Terlambat</option>
          <option value="PULANG">Pulang</option>
        </select>
        
        <select value={type} onChange={(e) => setType(e.target.value)} className="px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-300">
          <option value="">Semua Tipe</option>
          <option value="MASUK">Masuk</option>
          <option value="PULANG">Pulang</option>
        </select>

        <div className="relative flex items-center">
          <Calendar className="absolute left-3 w-4 h-4 text-slate-400 pointer-events-none" />
          <input 
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 outline-none text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-blue-500 cursor-pointer"
          />
          {filterDate && (
            <button 
              onClick={() => setFilterDate("")}
              title="Reset Tanggal"
              className="ml-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Menampilkan <span className="text-blue-600 font-bold">{filteredRecords.length}</span> data absensi
        </p>
      </div>

      {/* Table Area */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-3 text-left font-semibold">Nama</th>
                <th className="px-4 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-4 py-3 text-left font-semibold">Waktu / Jam</th>
                <th className="px-4 py-3 text-left font-semibold">Tipe</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                {/* ✅ DITAMBAHKAN HEADER KOLOM AKSI HAPUS DI SAMPING SHIFT */}
                <th className="px-4 py-3 text-left font-semibold">Shift</th>
                <th className="px-4 py-3 text-center font-semibold w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-slate-700">
              {isLoading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-slate-400">Menghubungkan database...</td></tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-medium bg-slate-50/50 italic">
                    Tidak ada data absensi yang cocok pada kriteria ini.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record: any, idx: number) => {
                  const displayNama = record.nama || record.employee_name || "Karyawan";
                  const waktuReal = record.jam_masuk && record.jam_masuk !== '-' ? record.jam_masuk : record.jam_pulang || "-";
                  return (
                    <tr key={record.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shadow-xs">
                            {displayNama.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-white">{displayNama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">{record.tanggal || "-"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-300">{waktuReal}</td>
                      <td className="px-4 py-3 text-xs">
                        <span className={getTypeBadge(record.type || "MASUK")}>{record.type || "MASUK"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(record.status)}`}>{record.status || "Hadir"}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500 font-medium">{record.shift || "Regular"}</td>
                      
                      {/* ✅ TOMBOL SAMPAH NYENTRIK DI SAMPING KOLOM SHIFT */}
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Hapus data absensi ${displayNama}?`)) {
                              deleteAttendance.mutate({ id: Number(record.id) });
                            }
                          }}
                          disabled={deleteAttendance.isPending}
                          className="p-1.5 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-40"
                          title="Hapus Log Absensi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}