import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/providers/trpc";
import {
  Cpu,
  Plus,
  Wifi,
  WifiOff,
  Pencil,
  Trash2,
  X,
  Router,
  MapPin,
  Key,
} from "lucide-react";

export default function DeviceManagement() {
  const [showAdd, setShowAdd] = useState(false);
  const [editingDevice, setEditingDevice] = useState<any>(null);
  const [form, setForm] = useState({ deviceId: "", name: "", location: "", ipAddress: "" });
  const [editForm, setEditForm] = useState({ id: 0, name: "", location: "", ipAddress: "" });

  const utils = trpc.useUtils();
  const { data: devices } = trpc.device.list.useQuery();
  
  const createDevice = trpc.device.create.useMutation({
    onSuccess: () => { 
      utils.device.list.invalidate(); 
      setShowAdd(false); 
      setForm({ deviceId: "", name: "", location: "", ipAddress: "" }); 
    },
  });

  // 🛠️ Mutasi untuk update data ke database backend
  const updateDevice = trpc.device.update.useMutation({
    onSuccess: () => {
      utils.device.list.invalidate();
      setEditingDevice(null);
    }
  });

  const deleteDevice = trpc.device.delete.useMutation({
    onSuccess: () => utils.device.list.invalidate(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDevice.mutate(form);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateDevice.mutate(editForm);
  };

  const startEdit = (device: any) => {
    setEditingDevice(device);
    setEditForm({
      id: device.id as number,
      name: device.name ?? "",
      location: device.location ?? "",
      ipAddress: device.ipAddress ?? ""
    });
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Perangkat</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kelola perangkat Jetson Nano yang terhubung
        </p>
      </motion.div>

      {/* Device Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* ✅ AMAN: Menambahkan tipe data ': any' eksplisit untuk membungkam eror implicitly 'any' */}
        {devices?.map((device: any, i: any) => {
          const isDeviceActive = !!(device as any).status || !!(device as any).isActive || !!device.lastSeen; 
          const deviceIdValid = device.id as number;

          return (
            <motion.div
              key={device.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center text-white">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{device.name ?? "Jetson Nano"}</h3>
                    <span className="flex items-center gap-1 text-xs mt-0.5">
                      {isDeviceActive && device.lastSeen ? (
                        <>
                          <Wifi className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-600">Online</span>
                        </>
                      ) : (
                        <>
                          <WifiOff className="w-3 h-3 text-slate-400" />
                          <span className="text-slate-400">Offline</span>
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => startEdit(device)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (device.id !== null) {
                        deleteDevice.mutate({ id: deviceIdValid });
                      }
                    }}
                    disabled={deleteDevice.isPending}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{device.location ?? "Lokasi belum diatur"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Router className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs">{device.ipAddress ?? "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <Key className="w-3.5 h-3.5" />
                  <span className="font-mono text-xs truncate">{(device as any).apiKey ?? "lns-key-" + (device.deviceId || "jetson")}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-slate-400">
                  Device ID: <span className="font-mono">{device.deviceId ?? "-"}</span>
                </p>
                {device.lastSeen && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    Terakhir aktif: {new Date(device.lastSeen).toLocaleString("id-ID")}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* Add Device Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setShowAdd(true)}
          className="flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all min-h-[200px]"
        >
          <Plus className="w-8 h-8 text-slate-400" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Tambah Perangkat Baru</span>
        </motion.button>
      </div>

      {/* Add Device Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tambah Perangkat</h3>
                <button onClick={() => setShowAdd(false)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Device ID</label>
                  <input
                    value={form.deviceId}
                    onChange={(e) => setForm({ ...form, deviceId: e.target.value })}
                    placeholder="JETSON-OFFICE-03"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Perangkat</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Jetson Nano - Lantai 3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
                  <input
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Kantor Pusat - Lantai 3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IP Address</label>
                  <input
                    value={form.ipAddress}
                    onChange={(e) => setForm({ ...form, ipAddress: e.target.value })}
                    placeholder="192.168.1.103"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={createDevice.isPending}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {createDevice.isPending ? "Menyimpan..." : "Simpan"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Edit Perangkat */}
      <AnimatePresence>
        {editingDevice && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setEditingDevice(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ubah Perangkat</h3>
                <button onClick={() => setEditingDevice(null)} className="p-1 rounded-lg hover:bg-slate-100">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nama Perangkat</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Lokasi</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">IP Address</label>
                  <input
                    value={editForm.ipAddress}
                    onChange={(e) => setEditForm({ ...editForm, ipAddress: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none text-sm dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateDevice.isPending}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {updateDevice.isPending ? "Memperbarui..." : "Simpan Perubahan"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}