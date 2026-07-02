import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { sql } from "drizzle-orm";

export const attendanceRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.execute(sql`SELECT * FROM presensi_cloud ORDER BY id DESC`);
    const rows: any[] = (result as any)[0] ?? [];

    return rows.map((item: any) => {
      const nama = item.nama || item.employee_name || "?";
      const waktu = (item.jam_masuk && item.jam_masuk !== "-" && item.jam_masuk !== null)
        ? item.jam_masuk
        : item.jam_pulang || "-";

      return {
        id:            item.id,
        nama:          nama,
        employee_name: nama,
        user_id:       item.user_id,
        tanggal:       item.tanggal    || "-",
        jam_masuk:     waktu,
        jam_pulang:    item.jam_pulang || "-",
        type:          item.type       || "MASUK",
        status:        item.status     || "Hadir",
        shift:         item.shift      || "Regular",
      };
    });
  }),

  checkIn: publicQuery
    .input(z.object({ employeeId: z.number() }))
    .mutation(async ({ input }) => {
      const db  = getDb();
      const now = new Date();

      const jam   = now.getHours();
      const menit = now.getMinutes();
      const detik = now.getSeconds();

      const totalMenitNow = jam * 60 + menit;

      // ⚙️ NILAI DEFAULT (Jika database kosong / gagal fetch)
      let dbStartHour = 8, dbStartMin = 0;
      let dbEndHour = 17, dbEndMin = 0;
      let dbTolerance = 15;

      // 🔍 AMBIL PENGATURAN ASLI DARI DATABASE AIVEN
      try {
        const configResult = await db.execute(sql`SELECT * FROM settings LIMIT 1`);
        const configRows: any[] = (configResult as any)[0] ?? [];
        if (configRows.length > 0) {
          const cfg = configRows[0];
          
          // Pecah format "08:00:00" menjadi jam dan menit
          if (cfg.work_start_time) {
            const parts = cfg.work_start_time.split(":");
            dbStartHour = parseInt(parts[0]) || 8;
            dbStartMin = parseInt(parts[1]) || 0;
          }
          // Pecah format "17:00:00" menjadi jam dan menit
          if (cfg.work_end_time) {
            const parts = cfg.work_end_time.split(":");
            dbEndHour = parseInt(parts[0]) || 17;
            dbEndMin = parseInt(parts[1]) || 0;
          }
          // Ambil nilai toleransi terlambat
          if (cfg.late_tolerance !== undefined && cfg.late_tolerance !== null) {
            dbTolerance = Number(cfg.late_tolerance);
          }
        }
      } catch (e) {
        console.error("Gagal sinkronisasi opsi database, menggunakan default:", e);
      }

      // 📐 HITUNG LOGIKA BATAS JAM ABSEN SECARA DINAMIS
      const MASUK_MULAI  = (dbStartHour - 2) * 60; // Pintu absen dibuka 2 jam sebelum jam masuk kerja
      const MASUK_ACUAN  = dbStartHour * 60 + dbStartMin;
      const MASUK_BATAS  = MASUK_ACUAN + dbTolerance; // Jam masuk ditambah menit toleransi
      
      const PULANG_MULAI = dbEndHour * 60 + dbEndMin;
      const PULANG_AKHIR = 24 * 60 - 1; // Sampai jam 23:59 malam

      let tipe: string;
      let status: string;

      if (totalMenitNow >= MASUK_MULAI && totalMenitNow <= MASUK_BATAS) {
        tipe   = "MASUK";
        status = "Tepat Waktu";
      } else if (totalMenitNow > MASUK_BATAS && totalMenitNow < PULANG_MULAI) {
        tipe   = "MASUK";
        status = "Terlambat";
      } else if (totalMenitNow >= PULANG_MULAI && totalMenitNow <= PULANG_AKHIR) {
        tipe   = "PULANG";
        status = "Pulang";
      } else {
        return { 
          success: false, 
          status: "Di luar jam kerja", 
          nama: "",
          message: `Absensi tidak diizinkan pada jam ini.` 
        };
      }

      const tanggal   = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
      const jamFormat = `${String(jam).padStart(2,"0")}:${String(menit).padStart(2,"0")}:${String(detik).padStart(2,"0")}`;
      const nipStr    = String(input.employeeId);

      let nama = "Karyawan";
      try {
        const res  = await db.execute(sql`SELECT nama_lengkap FROM karyawan_cloud WHERE nip = ${nipStr} LIMIT 1`);
        const rows: any[] = (res as any)[0] ?? [];
        if (rows.length > 0 && rows[0].nama_lengkap) {
          nama = rows[0].nama_lengkap;
        }
      } catch (e) {
        console.error("Gagal ambil nama:", e);
      }

      await db.execute(sql`
        INSERT INTO presensi_cloud 
          (user_id, nama, tanggal, status, jam_masuk, jam_pulang, shift, type, employee_name)
        VALUES (
          ${nipStr},
          ${nama},
          ${tanggal},
          ${status},
          ${tipe === "MASUK"  ? jamFormat : "-"},
          ${tipe === "PULANG" ? jamFormat : "-"},
          'Regular',
          ${tipe},
          ${nama}
        )
      `);

      return { success: true, status, nama };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.execute(sql`DELETE FROM presensi_cloud WHERE id = ${input.id}`);
      return { success: true };
    }),
});