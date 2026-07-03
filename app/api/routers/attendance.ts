import { z } from "zod";
import { createRouter, publicQuery } from "../middleware"; 
import { getDb } from "../queries/connection";
import { TRPCError } from "@trpc/server";
import { presensi, karyawan } from "@db/schema"; 
import { eq } from "drizzle-orm";

export const attendanceRouter = createRouter({
  // 🔥 PRIORITAS TINGGI: Endpoint Check-In untuk Jetson Nano
  checkIn: publicQuery 
    .input(
      z.object({
        employeeId: z.number(), 
        status: z.string().optional(), // Diubah jadi optional agar front-end lama tidak error
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Ambil token dari header request (Menggunakan ctx.req sesuai arsitektur proyekmu)
      const deviceToken = ctx.req?.headers.get('x-device-token') || undefined;
      const apiKey = ctx.req?.headers.get('x-api-key') || undefined;

      // Jalankan validasi device token
      const isValidDevice = deviceToken === "lns-key-JETSON-NANO-01" && apiKey === "lns-key-JETSON-NANO-01";
      
      // PRIORITAS RENDAH: Error response dibuat super jelas
      if (!isValidDevice && !ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid device credentials or user session expired",
        });
      }

      try {
        const db = await getDb();
        const sekarang = new Date();
        const tanggalStr = sekarang.toISOString().split('T')[0]; 
        const jamStr = sekarang.toTimeString().split(' ')[0];   

        // Cari nama lengkap karyawan terlebih dahulu berdasarkan ID database internal
        const dataKaryawan = await db.select()
          .from(karyawan)
          .where(eq(karyawan.id, input.employeeId))
          .limit(1)
          .execute(); // 👈 Ditambahkan .execute() agar stabil

        if (dataKaryawan.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Employee not found in the database",
          });
        }

        const namaKaryawan = dataKaryawan[0].namaLengkap;

        // Simpan data absensi ke tabel presensi_cloud
        await db.insert(presensi).values({
          userId: input.employeeId, 
          nama: namaKaryawan,
          tanggal: tanggalStr,
          jamMasuk: jamStr,
          status: "H", 
          type: input.status || "Masuk", 
        }).execute();

        return {
          success: true,
          message: `Absensi berhasil dicatat untuk ${namaKaryawan}`,
        };
      } catch (error: any) {
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database insertion failed: " + error.message,
        });
      }
    }),

  // Endpoint bawaan untuk front-end web browser (Riwayat)
  list: publicQuery.query(async () => {
    try {
      const db = await getDb();
      return await db.select().from(presensi).execute();
    } catch (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Gagal mengambil data riwayat" });
    }
  }),

  // Endpoint bawaan untuk front-end web browser (Hapus) - 🔥 SEKARANG SUDAH BISA MENGHAPUS DATA
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => { // 👈 Ambil objek input untuk tahu ID mana yang mau dihapus
      try {
        const db = await getDb();
        // ── AKSI NYATA HAPUS DATA DARI DATABASE ──
        await db.delete(presensi)
          .where(eq(presensi.id, input.id))
          .execute();

        return { success: true, message: "Data berhasil dihapus" };
      } catch (error: any) {
        throw new TRPCError({ 
          code: "INTERNAL_SERVER_ERROR", 
          message: "Gagal menghapus data: " + error.message 
        });
      }
    }),
});