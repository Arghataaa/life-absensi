import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    // Menggunakan trik globalThis agar TypeScript tidak eror merah
    url: (globalThis as any).process?.env?.DATABASE_URL || "",
  },
});