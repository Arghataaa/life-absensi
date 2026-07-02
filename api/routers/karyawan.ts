import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { karyawan } from "@db/schema";
import { eq, sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

export const karyawanRouter = createRouter({
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

      // Simpan Foto
      if (input.images?.length > 0) {
        const dirPath = path.join(process.cwd(), "public", "uploads", "karyawan", input.nip);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath, { recursive: true });
        }

        input.images.forEach((base64Str, index) => {
          const cleanBase64 = base64Str.replace(/^data:image\/\w+;base64,/, "");
          const buffer = Buffer.from(cleanBase64, "base64");
          fs.writeFileSync(path.join(dirPath, `${index + 1}.jpg`), buffer);
        });
      }

      // INSERT dengan Raw SQL (paling stabil)
      await db.execute(sql`
        INSERT INTO karyawan_cloud 
          (nip, nama_lengkap, divisi, user_id, employee_id, department, position, phone, join_date, face_photo)
        VALUES 
          (${input.nip}, 
           ${input.namaLengkap}, 
           ${input.divisi}, 
           0, 
           ${input.nip}, 
           ${input.divisi}, 
           'Karyawan', 
           '-', 
           ${joinDate}, 
           ${targetPath})
      `);

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
          nama_lengkap: input.namaLengkap,
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
        nama: item.nama_lengkap || item.namaLengkap,
        nip: item.nip,
        divisi: item.divisi,
        facePhoto: item.face_photo,
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