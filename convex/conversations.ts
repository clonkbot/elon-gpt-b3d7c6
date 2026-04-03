import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const now = Date.now();
    return await ctx.db.insert("conversations", {
      userId,
      title: "New Chat with Elon",
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTitle = mutation({
  args: { id: v.id("conversations"), title: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    await ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() });
  },
});

export const remove = mutation({
  args: { id: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const conv = await ctx.db.get(args.id);
    if (!conv || conv.userId !== userId) throw new Error("Not found");
    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.id))
      .collect();
    for (const msg of messages) {
      await ctx.db.delete(msg._id);
    }
    await ctx.db.delete(args.id);
  },
});
