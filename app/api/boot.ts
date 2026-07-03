import { Hono } from "hono";
import { cors } from "hono/cors";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { Paths } from "@contracts/constants";
import { attendanceEvents } from "./sse";

const app = new Hono<{ Bindings: HttpBindings }>();

// 1. Amankan CORS paling pertama
// 1. Amankan CORS paling pertama
// 1. Amankan CORS paling pertama
app.use(
  "/*",
  cors({
    origin: "https://life-absensi-gamma.vercel.app",
    credentials: true,
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "x-local-auth-token"], // <-- TAMBAHKAN INI DI SINI YA BANG!
    exposeHeaders: ["Content-Length"],
  })
);
app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// 2. Rute tRPC dipasang menggunakan app.all() di posisi atas
app.all("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// 3. Rute pendukung lainnya
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// SSE endpoint for real-time attendance updates
app.get("/api/sse/attendance", async (c) => {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));
      const unsubscribe = attendanceEvents.subscribe((data) => {
        try {
          controller.enqueue(encoder.encode(`event: attendance\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {}
      });
      c.req.raw.signal.addEventListener("abort", () => {
        unsubscribe();
        controller.close();
      });
    },
  });
  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

// 4. Rute fallback ditaruh paling bawah agar tidak mencegat tRPC
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Handle static files secara aman di production
if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const fs = await import("fs");
  const path = await import("path");

  const publicPath = path.resolve(process.cwd(), "../dist/public");
  if (fs.existsSync(publicPath)) {
    const { serveStatic } = await import("@hono/node-server/serve-static");
    app.use("/*", serveStatic({ root: "../dist/public" }));
  } else {
    console.log("⚠️ Folder dist/public belum ada, mode API-only aktif.");
  }
  
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

export default app;