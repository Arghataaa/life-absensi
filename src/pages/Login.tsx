import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { User, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"; // 👈 Mengganti Camera dengan ArrowLeft

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: (data) => {
      if (data.success && data.token) {
        localStorage.setItem("local_auth_token", data.token);
        localStorage.setItem("user_role", "admin");
        window.location.href = "/dashboard";
      } else {
        setError(data.error || "Login gagal");
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // === VALIDASI & INJEKSI COOKIE ADMIN LIFEMEDIA ===
    if (username === "lifemedia" && password === "s0t0kudus") {
      localStorage.setItem("local_auth_token", "simulated-admin-token");
      localStorage.setItem("user_role", "admin");
      document.cookie = "faceabsensi_session=simulated-admin-token; path=/; max-age=86400;";
      window.location.href = "/dashboard";
      return;
    }

    loginMutation.mutate({ email: username, password });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-200/50 p-8 sm:p-10 relative" // 👈 Ditambahkan 'relative' untuk posisi tombol kembali
      >
        {/* 🛠️ TOMBOL KEMBALI KE BERANDA (Atas Kiri Elegan) */}
        <button 
          type="button" 
          onClick={() => navigate("/")} // Mengarah ke beranda utama website
          className="absolute top-5 left-5 flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-blue-600 transition group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Beranda
        </button>

        <div className="text-center mb-8 pt-4"> {/* 👈 Ditambahkan padding-top sedikit agar pas dengan tombol */}
          <img src="/logo-lifemedia.png" alt="LifeMedia" className="h-10 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang Kembali</h1>
          <p className="text-sm text-slate-500 mt-1">Masuk ke Portal Admin LifeAbsensi</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username / Email</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username atau email"
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-600">
              <input type="checkbox" className="rounded border-slate-300" />
              Ingat saya
            </label>
          </div>

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full py-2.5 text-sm font-semibold text-white gradient-primary rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            {loginMutation.isPending ? "Memuat..." : "Masuk"}
          </button>
        </form>

        {/* ❌ Garis pembatas 'atau' dan tombol 'Masuk dengan Wajah' sudah dibersihkan total dari sini */}
      </motion.div>
    </div>
  );
}