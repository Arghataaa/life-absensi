import { Hono } from "hono";
import { serveStatic } from "@hono/node-server/serve-static"; // <-- Tambah import ini
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

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));
app.get(Paths.oauthCallback, createOAuthCallbackHandler());

// SSE endpoint for real-time attendance updates
app.get("/api/sse/attendance", async (c) => {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(
        encoder.encode("event: connected\ndata: {}\n\n")
      );

      const unsubscribe = attendanceEvents.subscribe((data) => {
        try {
          controller.enqueue(
            encoder.encode(`event: attendance\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          // Stream might be closed
        }
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

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

// Handle static files secara aman di production tanpa warning dari Vite
if (env.isProduction && !process.env.VERCEL) {
  // Jika folder dist/public ada di luar folder api (sejajar folder api)
  app.use("/*", serveStatic({ root: "../dist/public" })); 
  
  // Catatan: Jika nanti web/gambar tidak muncul, abang tinggal ganti jalur root di atas
  // menjadi: root: "./dist/public" atau menyesuaikan posisi aslinya.

  const { serve } = await import("@hono/node-server");
  
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

export default app;