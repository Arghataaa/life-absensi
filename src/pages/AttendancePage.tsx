import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { trpc } from "@/providers/trpc";
import { Camera, Scan, CheckCircle, AlertCircle, Info, Loader2 } from "lucide-react";
import * as faceapi from "face-api.js";

export default function AttendancePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isModelReady, setModelReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [attendanceType, setAttendanceType] = useState<"MASUK" | "PULANG">("MASUK");
  const [employeeInfo, setEmployeeInfo] = useState<{ name: string; nip: string } | null>(null);

  // Ambil data seluruh karyawan dari database untuk dicocokkan wajahnya
  const { data: employees } = trpc.karyawan.list.useQuery();

  // Ambil data mutasi checkIn backend tRPC
  const createAttendance = trpc.attendance.checkIn.useMutation({
    onSuccess: (data: any) => {
      if (data.success) {
        setResult("success");
        // Status diambil dinamis langsung dari server (Tepat Waktu / Terlambat / Pulang)
        setMessage(`Absen Berhasil Tercatat sebagai [${data.status}]!`);
      } else {
        setResult("error");
        // 🛠️ PERBAIKAN: Membaca properti data.error asli dari backend router
        setMessage(data.error || "Gagal mencatat absensi ke database");
      }
    },
    onError: (err) => {
      setResult("error");
      setMessage("Error Database: " + err.message);
    },
  });

  // Mempersiapkan model face-api.js
  useEffect(() => {
    let isMounted = true;
    async function loadModels() {
      try {
        const URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(URL)
        ]);
        if (isMounted) setModelReady(true);
      } catch (err) {
        console.error("Gagal memuat model absensi:", err);
      }
    }
    loadModels();
    return () => { isMounted = false; };
  }, []);

  const stopCamera = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsScanning(false);
  }, []);

  // Proses pencocokan wajah real-time
  const startFaceRecognition = async () => {
    if (!employees || employees.length === 0) {
      setResult("error");
      setMessage("Data referensi karyawan kosong.");
      return;
    }

    setResult(null);
    setMessage("");
    setEmployeeInfo(null);
    setIsScanning(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        // Buat data referensi wajah berdasarkan data pendaftaran karyawan
        const labeledDescriptors = await Promise.all(
          employees.map(async (emp: any) => {
            if (!emp.facePhoto) return null;
            try {
              const img = await faceapi.fetchImage(emp.facePhoto);
              const fullFaceDescription = await faceapi
                .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
                .withFaceLandmarks()
                .withFaceDescriptor();
              
              if (!fullFaceDescription) return null;
              return new faceapi.LabeledFaceDescriptors(emp.nip, [fullFaceDescription.descriptor]);
            } catch {
              return null;
            }
          })
        );

        const validDescriptors = labeledDescriptors.filter((d) => d !== null) as faceapi.LabeledFaceDescriptors[];
        
        if (validDescriptors.length === 0) {
          throw new Error("Gagal memuat token wajah referensi.");
        }

        const faceMatcher = new faceapi.FaceMatcher(validDescriptors, 0.6);

        // Jalankan loop pencocokan frame kamera
        const scanLoop = async () => {
          if (!videoRef.current || videoRef.current.paused || videoRef.current.ended) return;

          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
            .withFaceLandmarks()
            .withFaceDescriptor();

          if (detection) {
            const bestMatch = faceMatcher.findBestMatch(detection.descriptor);
            
            if (bestMatch.label !== "unknown") {
              const matchedEmp = employees.find((e: any) => e.nip === bestMatch.label);
              if (matchedEmp) {
                stopCamera();
                
                setEmployeeInfo({ name: matchedEmp.nama, nip: matchedEmp.nip });
                setMessage("Sedang menyimpan data...");

                // 🛠️ SEKARANG SUDAH BERSIH DAN AMAN TANPA PERINGATAN KUNING
                createAttendance.mutate({
                  employeeId: Number(matchedEmp.nip),
                });
                return;
              }
            }
          }
          rafRef.current = requestAnimationFrame(scanLoop);
        };

        rafRef.current = requestAnimationFrame(scanLoop);
      }
    } catch (err: any) {
      setResult("error");
      setMessage(err.message || "Gagal membuka kamera.");
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 p-4">
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-slate-900">Absensi Real-Time Wajah</h1>
        <p className="text-xs text-slate-500 mt-0.5">Silakan pilih jenis absensi dan posisikan wajah ke kamera</p>
      </motion.div>

      {/* Type Selector */}
      <div className="flex gap-2">
        {(["MASUK", "PULANG"] as const).map((type) => (
          <button
            key={type}
            onClick={() => setAttendanceType(type)}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${
              attendanceType === type
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/25"
                : "bg-white text-slate-600 border hover:bg-slate-50"
            }`}
          >
            Absen {type === "MASUK" ? "Masuk" : "Pulang"}
          </button>
        ))}
      </div>

      {/* Area Kamera Kotak */}
      <div className="relative aspect-square bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
        <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover scale-x-[-1] ${!isScanning ? "hidden" : ""}`} />
        
        {!isScanning && !result && (
          <div className="text-center text-slate-400 space-y-1">
            <Camera className="w-8 h-8 mx-auto opacity-30" />
            <p className="text-xs opacity-50">Kamera belum aktif</p>
          </div>
        )}

        {/* Scan Efek Animation */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-48 h-48 border border-blue-500/40 rounded-full animate-pulse bg-blue-500/5" />
            <Scan className="absolute w-10 h-10 text-blue-500 animate-spin" />
          </div>
        )}

        {/* Hasil Sukses */}
        {result === "success" && (
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="text-center space-y-1 bg-white p-4 rounded-xl shadow-xl max-w-[240px]">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-slate-900 font-bold text-sm">{employeeInfo?.name}</p>
              <p className="text-[10px] font-mono text-slate-400">{employeeInfo?.nip}</p>
              <p className="text-xs text-emerald-600 font-medium pt-1">{message}</p>
            </div>
          </div>
        )}

        {/* Loading Proses Menyimpan Data ke DB */}
        {createAttendance.isPending && (
          <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="text-center space-y-2 bg-white p-4 rounded-xl shadow-xl">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-slate-800 font-semibold text-xs">Mencatat riwayat absensi...</p>
            </div>
          </div>
        )}

        {result === "error" && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center p-4">
            <div className="text-center space-y-1 bg-white p-4 rounded-xl shadow-xl">
              <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
              <p className="text-slate-800 font-semibold text-xs">{message}</p>
              <button onClick={startFaceRecognition} className="text-[11px] text-blue-600 font-bold underline pt-1 block mx-auto">Coba Lagi</button>
            </div>
          </div>
        )}
      </div>

      {/* Tombol Eksekusi */}
      <div className="flex justify-center">
        <button
          onClick={isScanning ? stopCamera : startFaceRecognition}
          disabled={!isModelReady || createAttendance.isPending}
          className={`w-full py-2.5 text-xs font-bold text-white rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm ${
            isScanning ? "bg-red-500 hover:bg-red-600" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {!isModelReady ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Memuat AI Absensi...
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" />
              {isScanning ? "Batalkan Pemindaian" : `Mulai Absen ${attendanceType}`}
            </>
          )}
        </button>
      </div>

      <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
        <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-blue-700 leading-relaxed">
          Dekatkan wajah Anda ke kamera. AI akan otomatis memvalidasi wajah dan menyimpan riwayat absensi Anda langsung ke database utama.
        </p>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}