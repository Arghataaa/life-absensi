import { trpc } from "@/providers/trpc";
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  BarChart as BarIcon, 
  PieChart as PieIcon 
} from "lucide-react";
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from "recharts";

export default function Dashboard() {
  // 🛠️ FIX ROUTER NAME: Kembalikan ke karyawan.list sesuai bawaan project abang biar ga merah!
  const { data: attendanceData, isLoading: loadingAttendance } = trpc.attendance.list.useQuery(undefined, {
    refetchInterval: 2000, 
  });
  const { data: karyawanData, isLoading: loadingEmployees } = trpc.karyawan.list.useQuery({});

  const allRecords = Array.isArray(attendanceData) ? attendanceData : [];
  // Sesuaikan pembacaan jika backend mengembalikan bentuk objek { data: [...] }
  const allEmployees = Array.isArray(karyawanData) ? karyawanData : (karyawanData as any)?.data || [];

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const today = todayStr();
  const todayRecords = allRecords.filter((r: any) => r.tanggal === today);

  const tepatWaktu = todayRecords.filter((r: any) => (r.status || "").toUpperCase().includes("TEPAT") || (r.status || "").toUpperCase() === "HADIR").length;
  const terlambat  = todayRecords.filter((r: any) => (r.status || "").toUpperCase().includes("TERLAMBAT")).length;
  const totalHadirHariIni = tepatWaktu + terlambat;

  const idKaryawanSudahAbsen = todayRecords
    .filter((r: any) => (r.type || "").toUpperCase() === "MASUK")
    .map((r: any) => String(r.employeeId || r.nip || r.id_karyawan));

  const belumAbsen = Math.max(allEmployees.length - idKaryawanSudahAbsen.length, 0);

  const pieData = totalHadirHariIni === 0 && belumAbsen === 0
    ? [{ name: "Belum Ada Data", value: 1, color: "#cbd5e1" }]
    : [
        { name: "Tepat Waktu", value: tepatWaktu, color: "#10b981" },
        { name: "Terlambat", value: terlambat, color: "#f59e0b" },
        { name: "Belum Absen", value: belumAbsen, color: "#ef4444" },
      ];

  // 🛠️ FIX BAR DATA: Hitung otomatis 6 hari ke belakang murni asli dari database biar ga lawak!
  const barData = (() => {
    const HARI = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const str = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
      const rows = allRecords.filter((r: any) => r.tanggal === str);
      result.push({
        name: HARI[d.getDay()],
        Hadir: rows.filter((r: any) => (r.status || "").toUpperCase().includes("TEPAT") || (r.status || "").toUpperCase() === "HADIR").length,
        Terlambat: rows.filter((r: any) => (r.status || "").toUpperCase().includes("TERLAMBAT")).length,
      });
    }
    return result;
  })();

  if (loadingAttendance || loadingEmployees) {
    return <div className="p-6 text-sm text-slate-500">Memuat analisis dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Absensi</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Status kehadiran karyawan PT. LifeMedia hari ini secara real-time
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-medium text-slate-400">Total Karyawan</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{allEmployees.length}</p>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg"><Users className="w-5 h-5" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-medium text-slate-400">Tepat Waktu</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{tepatWaktu}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg"><UserCheck className="w-5 h-5" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-medium text-slate-400">Terlambat</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{terlambat}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg"><Clock className="w-5 h-5" /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-sm font-medium text-slate-400">Belum Absen</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">{belumAbsen}</p>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg"><UserX className="w-5 h-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <PieIcon className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Persentase Kehadiran</h3>
          </div>
          
          <div className="w-full h-64 flex items-center justify-center relative mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute text-center">
              <p className="text-3xl font-extrabold text-slate-800 dark:text-white">
                {totalHadirHariIni}
              </p>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Total Hadir</p>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs font-medium pt-2 text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Tepat</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Telat</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Belum</div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
            <BarIcon className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Statistik Kehadiran Mingguan</h3>
          </div>

          <div className="w-full h-72 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }} />
                <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                <Bar dataKey="Hadir" fill="#10b981" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="Terlambat" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}