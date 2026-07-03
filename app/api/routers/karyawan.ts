import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { karyawan } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server"; // Tambahan pengaman eror untuk Jetson
import fs from "fs";
import path from "path";

export const karyawanRouter = createRouter({
  // 🔥 1. ENDPOINT BARU: Auto-Fetch Data untuk Jetson Nano
  listAll: publicQuery
    .query(async ({ ctx }) => {
      // Ambil token dari header request
      const deviceToken = ctx.req?.headers.get('x-device-token') || undefined;
      const apiKey = ctx.req?.headers.get('x-api-key') || undefined;
      const isValidDevice = deviceToken === "lns-key-JETSON-NANO-01" && apiKey === "lns-key-JETSON-NANO-01";

      // Proteksi token bypass IoT
      if (!isValidDevice && !ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid device credentials",
        });
      }

      try {
        const db = await getDb();
        
        // Memilih kolom minimal agar response ringan & mudah di-parse di Python Jetson
        const data = await db.select({
          id: karyawan.id,
          nama: karyawan.namaLengkap,
          nip: karyawan.nip
        }).from(karyawan).execute();

        return data;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch employee list",
        });
      }
    }),

  // ── 2. METHOD BAWAAN ASLI WEB ABANG (FITUR REGISTRASI SCAN) ───────────────────
  add: publicQuery
    .input(z.object({
      nip: z.string(),
      namaLengkap: z.string(),
      divisi: z.string(),
      images: z.array(z.string()),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      const targetPath = `/uploads/karyawan/${input.nip}/1.jpg`;
      const joinDate = new Date().toISOString().split("T")[0];

      if (input.images && input.images.length > 0) {
        const dirPath = path.join(process.cwd(), "public", "uploads", "karyawan", input.nip);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }
        input.images.forEach((base64Str, index) => {
          const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(cleanBase64, "base64");
          const filePath = path.join(dirPath, `${index + 1}.jpg`);
          fs.writeFileSync(filePath, buffer);
        });
      }

      await db.insert(karyawan).values({
        nip: input.nip,
        namaLengkap: input.namaLengkap,
        divisi: input.divisi,
        userId: 0,
        employeeId: input.nip,
        department: input.divisi,
        position: "Karyawan",
        phone: "-",
        joinDate: joinDate,
        facePhoto: targetPath,
      }).execute();

      return { success: true, message: "Berhasil menyimpan karyawan dan foto" };
    }),
    
  update: publicQuery
    .input(z.object({
      nip: z.string(),
      namaLengkap: z.string(),
      divisi: z.string(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();

      await db.update(karyawan)
        .set({
          namaLengkap: input.namaLengkap, 
          divisi: input.divisi,
          department: input.divisi,
        })
        .where(eq(karyawan.nip, input.nip))
        .execute();

      return { success: true, message: "Berhasil memperbarui data karyawan" };
    }),

  list: publicQuery
    .input(z.object({ search: z.string().optional() }).optional())
    .query(async () => {
      const db = await getDb();
      const data = await db.select().from(karyawan).execute();

      return data.map((item: any) => ({
        namaLengkap: item.namaLengkap, 
        nip: item.nip,
        divisi: item.divisi,
        facePhoto: item.facePhoto,
      }));
    }),

  delete: publicQuery
    .input(z.object({ nip: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();

      await db.delete(karyawan)
        .where(eq(karyawan.nip, input.nip))
        .execute();

      try {
        const dirPath = path.join(process.cwd(), "public", "uploads", "karyawan", input.nip);
        if (fs.existsSync(dirPath)) {
          fs.rmSync(dirPath, { recursive: true, force: true });
        }
      } catch (e) {
        console.error("Gagal menghapus folder foto:", e);
      }

      return { success: true, message: "Berhasil menghapus karyawan" };
    }),
});