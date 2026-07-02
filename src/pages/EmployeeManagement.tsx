import { useState, useRef, useEffect, useCallback } from "react";
import { trpc } from "@/providers/trpc";
import { X, Camera, Loader2, Search, Plus, Trash2, Pencil, CheckCircle2, RotateCcw } from "lucide-react";
import * as faceapi from "face-api.js";

const PHOTOS_PER_STEP = 30;
const CAPTURE_MS      = 100;

type Step = "IDLE" | "CENTER" | "RIGHT" | "LEFT" | "UPLOADING" | "SUCCESS";

const STEPS: { key: Step; label: string; hint: string }[] = [
  { key: "CENTER", label: "Tengah", hint: "Hadapkan wajah lurus ke kamera" },
  { key: "RIGHT",  label: "Kanan",  hint: "Tolehkan kepala ke kanan perlahan" },
  { key: "LEFT",   label: "Kiri",   hint: "Tolehkan kepala ke kiri perlahan" },
];

export default function EmployeeManagement() {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nip: "", name: "", department: "IT" });
  const [step, setStepState] = useState<Step>("IDLE");
  const [isModelReady, setReady] = useState(false);
  const [isCameraOn, setCameraOn] = useState(false);
  const [captureCount, setCapCount] = useState(0);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  
  // 🛠️ Tambahan State Mode Edit
  const [isEditMode, setIsEditMode] = useState(false);

  const videoRef     = useRef<HTMLVideoElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const streamRef    = useRef<MediaStream | null>(null);
  const rafRef       = useRef<number | null>(null);
  const stepRef      = useRef<Step>("IDLE");
  const stepCountRef = useRef(0);
  const imageBufferRef = useRef<string[]>([]);

  const utils = trpc.useUtils();
  const response = trpc.karyawan.list.useQuery({ search: search || undefined });
  const employees = response.data ?? [];
  const isLoading = response.isLoading;

  // Mutation untuk simpan/tambah data
  const createKaryawan = trpc.karyawan.add.useMutation({
    onSuccess: () => {
      utils.karyawan.list.invalidate();
      setStepState("SUCCESS");
      stepRef.current = "SUCCESS";
    },
    onError: (e) => {
      setErrMsg("Error: " + e.message);
      setStepState("IDLE");
      stepRef.current = "IDLE";
    },
  });

  // 🛠️ Mutation untuk update data (Gunakan endpoint add yang dicustom atau update jika ada)
  // 🛠️ PERBAIKAN: Diarahkan ke fungsi update, bukan add lagi!
  const updateKaryawan = trpc.karyawan.update.useMutation({
    onSuccess: () => {
      utils.karyawan.list.invalidate();
      alert("Berhasil memperbarui data karyawan!");
      closeModal();
    },
    onError: (e) => setErrMsg("Error update: " + e.message),
  });
  const deleteKaryawan = trpc.karyawan.delete.useMutation({
    onSuccess: () => utils.karyawan.list.invalidate(),
  });

  useEffect(() => {
    (async () => {
      try {
        const URL = "https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights";
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(URL),
        ]);
        setReady(true);
      } catch (e) { console.error(e); }
    })();
  }, []);

  const setStep = (s: Step) => {
    stepRef.current = s;
    stepCountRef.current = 0;
    setStepState(s);
    setCapCount(0);
  };

  const captureFrame = useCallback(() => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const size = 400;
    canvas.width  = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, size, size);
    ctx.restore();

    const base64Data = canvas.toDataURL("image/jpeg", 0.8);
    setLastFrame(base64Data);
    imageBufferRef.current.push(base64Data);
    
    stepCountRef.current += 1;
    setCapCount(stepCountRef.current);
  }, []);

  const runLoop = useCallback(async () => {
    const cur = stepRef.current;
    if (["IDLE", "UPLOADING", "SUCCESS"].includes(cur)) return;
    if (!videoRef.current || videoRef.current.paused) return;

    try {
      const det = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.4 }))
        .withFaceLandmarks();

      if (det) {
        const nose = det.landmarks.getNose();
        const jaw  = det.landmarks.getJawOutline();
        const ratio = (nose[6].x - jaw[0].x) / (jaw[16].x - nose[6].x);

        const ok =
          (cur === "CENTER" && ratio > 0.75 && ratio < 1.25) ||
          (cur === "RIGHT"  && (ratio < 0.65 || ratio > 1.6)) ||
          (cur === "LEFT"   && (ratio > 1.4 || ratio < 0.5));

        if (ok) {
          captureFrame();
          if (stepCountRef.current >= PHOTOS_PER_STEP) {
            if (cur === "CENTER") { setTimeout(() => setStep("RIGHT"), 200); }
            else if (cur === "RIGHT") { setTimeout(() => setStep("LEFT"), 200); }
            else if (cur === "LEFT") {
              stopCamera();
              setStepState("UPLOADING");
              stepRef.current = "UPLOADING";
              createKaryawan.mutate({
                nip: formData.nip,
                namaLengkap: formData.name,
                divisi: formData.department,
                images: imageBufferRef.current,
              });
              return;
            }
          }
        }
      }
    } catch { /* skip */ }

    setTimeout(() => {
      if (stepRef.current !== "IDLE" && stepRef.current !== "SUCCESS" && stepRef.current !== "UPLOADING") {
        rafRef.current = requestAnimationFrame(runLoop);
      }
    }, CAPTURE_MS);
  }, [captureFrame, formData, createKaryawan]);

  const startCamera = async () => {
    setErrMsg(null);
    imageBufferRef.current = [];
    setLastFrame(null);
    setCameraOn(true);
    setStep("CENTER");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setTimeout(() => { rafRef.current = requestAnimationFrame(runLoop); }, 600);
      }
    } catch {
      setErrMsg("Gagal membuka kamera. Cek izin browser.");
      setCameraOn(false);
      setStep("IDLE");
    }
  };

  const stopCamera = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  };

  const resetScan = () => {
    stopCamera();
    imageBufferRef.current = [];
    setLastFrame(null);
    setErrMsg(null);
    setStep("IDLE");
  };

  // Fungsi saat klik tombol Edit
  const handleEditClick = (emp: any) => {
    setIsEditMode(true);
    setFormData({
      nip: emp.nip,
      name: emp.nama ?? emp.namaLengkap,
      department: emp.divisi || "IT",
    });
    setShowModal(true);
  };

  const closeModal = () => {
    resetScan();
    setShowModal(false);
    setIsEditMode(false);
    setFormData({ nip: "", name: "", department: "IT" });
  };

  const activeIdx = STEPS.findIndex((s) => s.key === step);
  const doneSteps = step === "UPLOADING" || step === "SUCCESS" ? 3 : Math.max(activeIdx, 0);
  const totalPct  = Math.round(((doneSteps * PHOTOS_PER_STEP + (activeIdx >= 0 ? captureCount : 0)) / (PHOTOS_PER_STEP * 3)) * 100);
  const currentHint = STEPS.find((s) => s.key === step)?.hint ?? "";

  return (
    <div className="space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Manajemen Karyawan</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Kelola data dan pendaftaran wajah karyawan</p>
      </div>

      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input placeholder="Cari nama/NIP..." className="w-full pl-9 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg outline-none bg-white dark:bg-slate-800 dark:text-white" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button disabled={!isModelReady} onClick={() => { setIsEditMode(false); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-60">
          {!isModelReady ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          {!isModelReady ? "Memuat AI..." : "Tambah Karyawan"}
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">Nama</th>
              <th className="px-4 py-3 text-left">NIP</th>
              <th className="px-4 py-3 text-left">Divisi</th>
              <th className="px-4 py-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y text-slate-700">
  {isLoading ? <tr><td colSpan={4} className="p-4 text-center">Memuat...</td></tr> : 
   employees.length === 0 ? <tr><td colSpan={4} className="p-4 text-center">Belum ada karyawan</td></tr> : 
   employees.map((emp: any) => (
    <tr key={emp.nip} className="hover:bg-slate-50">
      {/* Pakai emp.namaLengkap langsung tanpa fallback property gabung/hancur */}
      <td className="px-4 py-3 font-medium">{emp.namaLengkap}</td>
      <td className="px-4 py-3 font-mono text-xs">{emp.nip}</td>
      <td className="px-4 py-3">{emp.divisi}</td>
      <td className="px-4 py-3 flex items-center justify-center gap-3">
        <button onClick={() => handleEditClick(emp)} className="p-1 text-slate-400 hover:text-blue-600 transition" title="Edit Data">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={() => deleteKaryawan.mutate({ nip: emp.nip })} className="p-1 text-red-400 hover:text-red-600 transition" title="Hapus Karyawan">
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  ))}
</tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <h3 className="font-bold text-sm text-slate-900">{isEditMode ? "Edit Data Karyawan" : "Registrasi Face ID"}</h3>
                <p className="text-[11px] text-slate-400">{isEditMode ? "Perbarui informasi nama dan divisi" : "Ambil 3 sudut wajah otomatis"}</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-slate-100"><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              <div className="space-y-2">
                {/* NIP dikunci kalau lagi edit mode biar gak merusak primary key DB */}
                <input placeholder="NIP *" className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400" value={formData.nip} onChange={(e) => setFormData({ ...formData, nip: e.target.value })} disabled={isCameraOn || step === "UPLOADING" || isEditMode} />
                <input placeholder="Nama Lengkap *" className="w-full px-3 py-2 border rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={step === "UPLOADING"} />
              </div>

              {/* Sembunyikan bagian scan wajah kalau hanya mengedit data teks biasa */}
              {!isEditMode && (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    {STEPS.map((s, i) => (
                      <div key={s.key} className="flex-1 flex flex-col items-center gap-0.5">
                        <div className={`w-full h-1 rounded-full ${doneSteps > i ? "bg-green-500" : step === s.key ? "bg-blue-500" : "bg-slate-200"}`} />
                        <span className={`text-[10px] font-medium ${doneSteps > i ? "text-green-600" : step === s.key ? "text-blue-600" : "text-slate-400"}`}>{s.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-950 border shadow-inner">
                    <video ref={videoRef} autoPlay playsInline muted className={`absolute inset-0 w-full h-full object-cover scale-x-[-1] ${!isCameraOn ? "hidden" : ""}`} />
                    {lastFrame && !isCameraOn && step !== "IDLE" && <img src={lastFrame} className="absolute inset-0 w-full h-full object-cover" alt="" />}
                    
                    {step === "IDLE" && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-600">
                        <Camera className="w-8 h-8 opacity-30" />
                        <p className="text-xs opacity-50">Kamera belum aktif</p>
                      </div>
                    )}
                    
                    {isCameraOn && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-44 h-56 rounded-[50%] border border-dashed border-white/40 bg-black/5" />
                      </div>
                    )}
                    
                    {isCameraOn && currentHint && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 py-2"><p className="text-white text-[11px] font-medium text-center">{currentHint}</p></div>
                    )}
                    {isCameraOn && <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">{captureCount}/{PHOTOS_PER_STEP}</div>}
                    {step === "SUCCESS" && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center"><div className="bg-white rounded-full p-2.5 shadow-xl"><CheckCircle2 className="w-8 h-8 text-green-500" /></div></div>}
                    {step === "UPLOADING" && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1.5"><Loader2 className="w-6 h-6 text-white animate-spin" /><p className="text-white text-[11px]">Mengunggah 90 foto...</p></div>
                    )}
                  </div>

                  {step !== "IDLE" && (
                    <div className="space-y-1 py-1">
                      <div className="flex justify-between text-[10px] text-slate-400"><span>{Math.min(doneSteps * PHOTOS_PER_STEP + captureCount, 90)} / 90 foto</span><span className="font-semibold">{Math.min(totalPct, 100)}%</span></div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500 transition-all duration-200" style={{ width: `${Math.min(totalPct, 100)}%` }} /></div>
                    </div>
                  )}
                </>
              )}

              {errMsg && <p className="text-[11px] text-red-500 bg-red-50 p-2 rounded-lg border border-red-100">{errMsg}</p>}

              <div className="flex gap-2 pt-1 border-t">
                <button onClick={closeModal} className="flex-1 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition">Batal</button>
                
                {/* Logika Tombol Sesuai Mode Tambah / Edit */}
                {isEditMode ? (
                  <button 
  type="button" 
  onClick={() => updateKaryawan.mutate({ nip: formData.nip, namaLengkap: formData.name, divisi: formData.department })} 
  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition shadow-sm"
>
  Simpan Perubahan
</button>
                ) : (
                  <>
                    {step === "IDLE" && <button onClick={() => { if(formData.nip.trim() && formData.name.trim()) startCamera(); else setErrMsg("NIP/Nama wajib diisi."); }} className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm"><Camera className="w-3.5 h-3.5" /> Mulai Scan</button>}
                    {["CENTER", "RIGHT", "LEFT"].includes(step) && <button onClick={resetScan} className="flex-1 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm"><RotateCcw className="w-3.5 h-3.5" /> Ulangi</button>}
                    {step === "SUCCESS" && <button onClick={closeModal} className="flex-1 py-2 text-xs font-semibold text-white bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center gap-1.5 transition shadow-sm"><CheckCircle2 className="w-3.5 h-3.5" /> Selesai</button>}
                  </>
                )}
              </div>

            </div>
          </div>
          <canvas ref={canvasRef} className="hidden" />
        </div>
      )}
    </div>
  );
}