import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Save, Clock, Shield, Bell, Palette, Sliders } from "lucide-react";

type TabKey = "umum" | "jamkerja" | "notifikasi" | "keamanan" | "tema";

export default function SettingsPage() {
  const utils = trpc.useUtils();
  const [activeTab, setActiveTab] = useState<TabKey>("jamkerja");

  const { data: currentSettings, isLoading } = trpc.setting.get.useQuery();

  const updateSettings = trpc.setting.update.useMutation({
    onSuccess: () => {
      alert("✅ Pengaturan berhasil disimpan!");
      utils.setting.get.invalidate();
    },
    onError: (err) => alert(`❌ Gagal menyimpan: ${err.message}`),
  });

  const [form, setForm] = useState({
    companyName:   "LifeMedia",
    timezone:      "Asia/Jakarta",
    workStartTime: "06:00",
    workEndTime:   "16:00",
    workDays:      "1,2,3,4,5",
  });

  useEffect(() => {
    if (currentSettings) {
      const s = currentSettings as any;
      setForm({
        companyName:   s.companyName   ?? "LifeMedia",
        timezone:      s.timezone      ?? "Asia/Jakarta",
        workStartTime: s.workStartTime ?? "06:00",
        workEndTime:   s.workEndTime   ?? "16:00",
        workDays:      s.workDays      ?? "1,2,3,4,5",
      });
    }
  }, [currentSettings]);

  const handleDayToggle = (dayIndex: string) => {
    let days = form.workDays.split(",").filter(Boolean);
    if (days.includes(dayIndex)) {
      days = days.filter((d) => d !== dayIndex);
    } else {
      days.push(dayIndex);
    }
    setForm({ ...form, workDays: days.sort().join(",") });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({
      companyName:   form.companyName,
      timezone:      form.timezone,
      workStartTime: form.workStartTime,
      workEndTime:   form.workEndTime,
      workDays:      form.workDays,
    });
  };

  const tabs = [
    { key: "umum",       label: "Umum",        icon: Sliders  },
    { key: "jamkerja",   label: "Jam Kerja",   icon: Clock    },
    { key: "notifikasi", label: "Notifikasi",  icon: Bell     },
    { key: "keamanan",   label: "Keamanan",    icon: Shield   },
    { key: "tema",       label: "Tema",        icon: Palette  },
  ] as const;

  if (isLoading) {
    return (
      <div className="p-6 text-sm text-slate-500 flex items-center gap-2">
        <Clock className="w-4 h-4 animate-spin text-blue-500" />
        Memuat pengaturan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pengaturan Sistem</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi sistem absensi sesuai kebutuhan perusahaan
        </p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-white dark:bg-slate-800 rounded-xl p-3 border border-slate-200 dark:border-slate-700 h-fit space-y-1 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold"
                  : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">

          {/* === UMUM === */}
          {activeTab === "umum" && (
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Pengaturan Umum
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Perusahaan</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Zona Waktu</label>
                <select
                  value={form.timezone}
                  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>
              <button type="submit" disabled={updateSettings.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50">
                <Save className="w-4 h-4" />
                {updateSettings.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}

          {/* === JAM KERJA === */}
          {activeTab === "jamkerja" && (
            <form onSubmit={handleSave} className="space-y-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Pengaturan Jam Kerja
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Masuk</label>
                  <input type="time" value={form.workStartTime}
                    onChange={(e) => setForm({ ...form, workStartTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Jam Pulang</label>
                  <input type="time" value={form.workEndTime}
                    onChange={(e) => setForm({ ...form, workEndTime: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg outline-none text-sm dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Hari Kerja</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { idx: "1", label: "Senin"  },
                    { idx: "2", label: "Selasa" },
                    { idx: "3", label: "Rabu"   },
                    { idx: "4", label: "Kamis"  },
                    { idx: "5", label: "Jumat"  },
                    { idx: "6", label: "Sabtu"  },
                    { idx: "0", label: "Minggu" },
                  ].map((day) => {
                    const isChecked = form.workDays.split(",").filter(Boolean).includes(day.idx);
                    return (
                      <label key={day.idx} className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm cursor-pointer select-none transition-all ${
                        isChecked
                          ? "bg-blue-50 border-blue-200 text-blue-600 font-medium dark:bg-blue-900/30 dark:border-blue-800 dark:text-blue-400"
                          : "bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400"
                      }`}>
                        <input type="checkbox" checked={isChecked}
                          onChange={() => handleDayToggle(day.idx)} className="hidden" />
                        {day.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Info jam absensi */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-sm space-y-1">
                <p className="font-semibold text-blue-700 dark:text-blue-400 mb-2">Info Aturan Absensi Saat Ini:</p>
                <p className="text-blue-600 dark:text-blue-300">🟢 <strong>Tepat Waktu:</strong> 06:00 – 08:00</p>
                <p className="text-amber-600 dark:text-amber-400">🟡 <strong>Terlambat:</strong> 08:01 – 15:59</p>
                <p className="text-indigo-600 dark:text-indigo-400">🔵 <strong>Pulang:</strong> 16:00 – 23:59</p>
              </div>

              <button type="submit" disabled={updateSettings.isPending}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition disabled:opacity-50">
                <Save className="w-4 h-4" />
                {updateSettings.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}

          {/* === NOTIFIKASI === */}
          {activeTab === "notifikasi" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Pengaturan Notifikasi
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Notifikasi karyawan terlambat", desc: "Kirim alert saat ada karyawan masuk setelah 08:00" },
                  { label: "Notifikasi karyawan belum absen", desc: "Reminder harian untuk karyawan yang belum absen" },
                  { label: "Laporan harian otomatis", desc: "Kirim ringkasan absensi setiap akhir hari kerja" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 mt-0.5">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">* Fitur notifikasi akan tersedia di versi berikutnya.</p>
            </div>
          )}

          {/* === KEAMANAN === */}
          {activeTab === "keamanan" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Pengaturan Keamanan
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Autentikasi dua faktor",        desc: "Tambah lapisan keamanan saat login admin" },
                  { label: "Session timeout (30 menit)",    desc: "Otomatis logout jika tidak ada aktivitas" },
                  { label: "Log aktivitas admin",           desc: "Catat semua aksi yang dilakukan admin" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4 mt-0.5">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-10 h-5 bg-slate-200 peer-checked:bg-blue-600 rounded-full transition-colors" />
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform" />
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">* Fitur keamanan lanjutan akan tersedia di versi berikutnya.</p>
            </div>
          )}

          {/* === TEMA === */}
          {activeTab === "tema" && (
            <div className="space-y-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-2">
                Pengaturan Tema
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { key: "light", label: "Terang",  bg: "bg-white",           border: "border-blue-500",  text: "text-slate-900" },
                  { key: "dark",  label: "Gelap",   bg: "bg-slate-900",       border: "border-slate-500", text: "text-white"     },
                ].map((theme) => (
                  <div key={theme.key}
                    className={`${theme.bg} border-2 ${theme.border} rounded-xl p-4 cursor-pointer flex flex-col gap-2`}>
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="space-y-1.5">
                      <div className={`h-2 rounded ${theme.key === "light" ? "bg-slate-200" : "bg-slate-700"} w-3/4`} />
                      <div className={`h-2 rounded ${theme.key === "light" ? "bg-slate-100" : "bg-slate-800"} w-1/2`} />
                    </div>
                    <p className={`text-xs font-semibold ${theme.text} mt-1`}>{theme.label}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">* Ganti tema lewat tombol bulan/matahari di pojok kanan atas.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}