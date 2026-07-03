import { Link } from "react-router";
import { motion } from "framer-motion";
import {
  Camera,
  Activity,
  Cpu,
  Shield,
  BarChart3,
  Monitor,
  Zap,
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

const features = [
  {
    icon: Camera,
    title: "Pengenalan Wajah AI",
    desc: "Teknologi deep learning dengan akurasi 99.7% untuk identifikasi wajah dalam < 1 detik.",
  },
  {
    icon: Activity,
    title: "Real-time Dashboard",
    desc: "Pantau kehadiran karyawan secara live dengan update otomatis setiap detik.",
  },
  {
    icon: Cpu,
    title: "Integrasi Jetson Nano",
    desc: "Terhubung langsung dengan perangkat NVIDIA Jetson Nano untuk pemrosesan edge.",
  },
  {
    icon: Shield,
    title: "Keamanan Tingkat Tinggi",
    desc: "Anti spoofing dengan liveness detection dan enkripsi end-to-end.",
  },
  {
    icon: BarChart3,
    title: "Laporan & Analitik",
    desc: "Generate laporan kehadiran harian, mingguan, bulanan dengan grafik interaktif.",
  },
  {
    icon: Monitor,
    title: "Akses Multi-Perangkat",
    desc: "Akses dari laptop, tablet, atau smartphone. Responsif di semua layar.",
  },
];

const steps = [
  {
    num: "01",
    title: "Daftarkan Wajah",
    desc: "Upload foto karyawan atau daftarkan langsung via webcam. Sistem akan mengekstrak fitur wajah unik.",
  },
  {
    num: "02",
    title: "Absensi Otomatis",
    desc: "Karyawan hadir, kamera Jetson Nano mendeteksi wajah, sistem mencatat kehadiran secara otomatis.",
  },
  {
    num: "03",
    title: "Pantau & Analisis",
    desc: "Lihat laporan real-time, export data, dan analisis tren kehadiran dari dashboard.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-lifemedia.png" alt="LifeMedia" className="h-8 w-auto" />
            <span className="text-sm font-medium text-slate-500 ml-1">
              LifeAbsensi
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold bg-gradient-to-r from-blue-600 to-sky-500 text-white rounded-full">
                BETA
              </span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#fitur" className="hover:text-blue-600 transition-colors">Fitur</a>
            <a href="#cara-kerja" className="hover:text-blue-600 transition-colors">Cara Kerja</a>
            <a href="#dokumentasi" className="hover:text-blue-600 transition-colors">Dokumentasi</a>
          </div>
          <div className="flex items-center">
            <Link
              to="/login"
              className="px-5 py-2 text-sm font-semibold text-white gradient-primary rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all"
            >
              Masuk
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            <motion.div custom={0} variants={fadeInUp} initial="hidden" animate="visible">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold text-white gradient-primary rounded-full">
                <Zap className="w-3.5 h-3.5" />
                Sistem Absensi Masa Depan
              </span>
            </motion.div>

            <motion.h1
              custom={1}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold leading-tight text-slate-900"
            >
              Absensi Wajah{" "}
              <span className="text-gradient">Instan, Akurat,</span>{" "}
              dan Profesional
            </motion.h1>

            <motion.p
              custom={2}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="text-lg text-slate-500 max-w-lg leading-relaxed"
            >
              LifeAbsensi menghadirkan teknologi pengenalan wajah berbasis AI yang
              terintegrasi dengan NVIDIA Jetson Nano. Pantau kehadiran karyawan secara
              real-time, otomatis, dan bebas penipuan.
            </motion.p>

            <motion.div
              custom={3}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-4"
            >
              <Link
                to="/login"
                className="px-7 py-3.5 text-base font-semibold text-white gradient-primary rounded-xl hover:shadow-xl hover:shadow-blue-500/30 transition-all flex items-center gap-2"
              >
                Lihat Demo Dashboard
              </Link>
            </motion.div>

            <motion.div
              custom={4}
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              className="flex flex-wrap gap-8 pt-4"
            >
              {[
                { num: "500+", label: "Perusahaan" },
                { num: "99.7%", label: "Akurasi" },
                { num: "< 1s", label: "Proses Absensi" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-slate-900">{stat.num}</div>
                  <div className="text-xs font-medium text-slate-500">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="absolute -top-10 -right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-sky-400/10 rounded-full blur-3xl" />
            <img
              src="/hero-illustration.png"
              alt="Face Recognition"
              className="relative z-10 w-full max-w-md lg:max-w-lg animate-float"
            />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
              Fitur Unggulan
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">
              Semua yang Anda Butuhkan untuk Absensi Modern
            </h2>
            <p className="mt-3 text-slate-500">
              Sistem lengkap dengan teknologi AI dan integrasi hardware untuk solusi absensi tanpa sentuh.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="group p-8 bg-white border border-slate-200 rounded-xl hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300"
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-xl gradient-primary text-white mb-5">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="cara-kerja" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <span className="text-xs font-semibold tracking-wider text-blue-600 uppercase">
              Cara Kerja
            </span>
            <h2 className="mt-3 text-3xl font-bold text-slate-900">Tiga Langkah Mudah</h2>
            <p className="mt-3 text-slate-500">
              Mulai absensi dengan sistem modern dalam hitungan menit.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <motion.div
                key={s.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative text-center"
              >
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-blue-200" />
                )}
                <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full border-2 border-blue-600 text-blue-600 text-xl font-bold bg-white mb-5 relative z-10">
                  {s.num}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center gradient-primary rounded-3xl p-12 md:p-16"
        >
          <h2 className="text-3xl font-bold text-white mb-3">
            Siap untuk Modernisasi Absensi?
          </h2>
          <p className="text-white/90 mb-8 max-w-lg mx-auto">
            Gunakan sistem cerdas berbasis kecerdasan buatan untuk mengelola data kehadiran instan dan real-time.
          </p>
          <Link
            to="/login"
            className="inline-flex px-8 py-3.5 text-base font-semibold text-blue-600 bg-white rounded-xl hover:bg-slate-50 hover:shadow-lg transition-all"
          >
            Masuk Sekarang
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <img src="/logo-lifemedia.png" alt="LifeMedia" className="h-8 w-auto mb-4 brightness-200" />
            <p className="text-sm leading-relaxed max-w-sm">
              LifeAbsensi powered by LifeMedia. Solusi absensi wajah modern untuk perusahaan Anda.
              Integrasi AI dan IoT untuk sistem kehadiran yang akurat dan efisien.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Produk</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer">LifeAbsensi</span></li>
              <li><span className="hover:text-white cursor-pointer">LifeMedia CMS</span></li>
              <li><span className="hover:text-white cursor-pointer">LifeStream</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Dukungan</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="hover:text-white cursor-pointer">Dokumentasi</span></li>
              <li><span className="hover:text-white cursor-pointer">API Reference</span></li>
              <li><span className="hover:text-white cursor-pointer">Kontak</span></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
          <p>&copy; 2026 LifeMedia. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}