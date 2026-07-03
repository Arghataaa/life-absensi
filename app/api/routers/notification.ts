import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { notifications } from "@db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export const notificationRouter = createRouter({
  list: publicQuery
    .input(
      z.object({
        userId: z.number(),
        unreadOnly: z.boolean().default(false),
        page: z.number().default(1),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input }) => {
      const db = getDb();
      const offset = (input.page - 1) * input.limit;

      const conditions = [eq(notifications.userId, input.userId)];
      if (input.unreadOnly) conditions.push(eq(notifications.isRead, false));

      const data = await db.select().from(notifications)
        .where(and(...conditions))
        .orderBy(desc(notifications.createdAt))
        .limit(input.limit)
        .offset(offset);

      const countResult = await db.select({ count: sql<number>`count(*)` })
        .from(notifications)
        .where(and(...conditions));

      return {
        data,
        unreadCount: data.filter((n) => !n.isRead).length,
        pagination: { page: input.page, limit: input.limit, total: countResult[0]?.count ?? 0 },
      };
    }),

  create: publicQuery
    .input(
      z.object({
        userId: z.number(),
        title: z.string(),
        message: z.string(),
        type: z.enum(["ATTENDANCE", "LATE", "ABSENCE", "DEVICE", "SYSTEM"]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(notifications).values({
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: input.type,
        isRead: false,
      });
      return { success: true };
    }),

  markRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, input.id));
      return { success: true };
    }),

  markAllRead: publicQuery
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.userId, input.userId), eq(notifications.isRead, false)));
      return { success: true };
    }),
});
