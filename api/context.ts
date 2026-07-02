import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";

// Kita buat interface manual di sini agar tidak perlu import dari @db/schema yang bikin error
export interface CustomUser {
  id: any;
  unionId: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  user?: CustomUser; // Menggunakan interface kustom kita
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  
  // === BYPASS DI LEVEL CONTEXT ===
  const rawCookie = opts.req.headers.get("cookie") || "";
  if (rawCookie.includes("faceabsensi_session=simulated-admin-token")) {
    ctx.user = {
      id: 9999, 
      unionId: "admin-bypass",
      email: "admin@lifemedia.id",
      name: "LifeMedia Admin",
      role: "admin",
      avatar: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return ctx;
  }

  // Jika bukan token simulasi, panggil modul auth bawaan secara dinamis
  try {
    const { authenticateRequest } = await import("./kimi/auth");
    ctx.user = await authenticateRequest(opts.req.headers) as any;
  } catch {
    // Authentication is optional here
  }
  return ctx;
}