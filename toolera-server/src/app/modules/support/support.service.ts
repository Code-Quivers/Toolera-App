import { eq, desc, and, sql, ilike, or } from "drizzle-orm";
import httpStatus from "http-status";
import { db } from "../../../db";
import { tooleraSupportTickets, tooleraSupportTicketReplies } from "../../../db/schema";
import ApiError from "../../../errors/ApiError";

function genTicketNumber() {
  return `TKT-${Date.now().toString().slice(-6)}`;
}

const getAll = async (query: { page?: number; limit?: number; status?: string; priority?: string; search?: string }) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const offset = (page - 1) * limit;

  const conditions: any[] = [];
  if (query.status) conditions.push(eq(tooleraSupportTickets.status, query.status as any));
  if (query.priority) conditions.push(eq(tooleraSupportTickets.priority, query.priority as any));
  if (query.search) {
    conditions.push(
      or(
        ilike(tooleraSupportTickets.subject, `%${query.search}%`),
        ilike(tooleraSupportTickets.sellerName, `%${query.search}%`),
        ilike(tooleraSupportTickets.sellerEmail, `%${query.search}%`),
        ilike(tooleraSupportTickets.ticketNumber, `%${query.search}%`),
      )
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(tooleraSupportTickets)
    .where(where);

  const tickets = await db
    .select()
    .from(tooleraSupportTickets)
    .where(where)
    .orderBy(desc(tooleraSupportTickets.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    meta: { page, limit, total: countResult.count, totalPages: Math.ceil(countResult.count / limit) },
    data: tickets,
  };
};

const getStats = async () => {
  const statuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
  const results = await Promise.all(
    statuses.map(s =>
      db.select({ count: sql<number>`count(*)::int` })
        .from(tooleraSupportTickets)
        .where(eq(tooleraSupportTickets.status, s))
        .then(([r]) => ({ [s]: r.count }))
    )
  );
  return Object.assign({}, ...results) as Record<string, number>;
};

const getById = async (ticketId: string) => {
  const [ticket] = await db
    .select()
    .from(tooleraSupportTickets)
    .where(eq(tooleraSupportTickets.ticketId, ticketId));
  if (!ticket) throw new ApiError(httpStatus.NOT_FOUND, "Ticket not found");
  return ticket;
};

const getReplies = async (ticketId: string) => {
  await getById(ticketId);
  return db
    .select()
    .from(tooleraSupportTicketReplies)
    .where(eq(tooleraSupportTicketReplies.ticketId, ticketId))
    .orderBy(tooleraSupportTicketReplies.createdAt);
};

const create = async (body: {
  sellerGoogleId?: string;
  sellerEmail?: string;
  sellerName?: string;
  subject: string;
  message: string;
  priority?: string;
}) => {
  const [created] = await db
    .insert(tooleraSupportTickets)
    .values({
      ticketNumber: genTicketNumber(),
      sellerGoogleId: body.sellerGoogleId ?? null,
      sellerEmail: body.sellerEmail ?? null,
      sellerName: body.sellerName ?? null,
      subject: body.subject.trim(),
      message: body.message.trim(),
      status: "OPEN",
      priority: (body.priority as any) ?? "MEDIUM",
    })
    .returning();
  return created;
};

const addReply = async (ticketId: string, body: { message: string; authorId?: string; authorType?: string }) => {
  await getById(ticketId);
  const [reply] = await db
    .insert(tooleraSupportTicketReplies)
    .values({
      ticketId,
      authorId: body.authorId ?? null,
      authorType: body.authorType ?? "admin",
      message: body.message.trim(),
    })
    .returning();

  // Move to IN_PROGRESS on first admin reply if still OPEN
  if (body.authorType !== "seller") {
    await db
      .update(tooleraSupportTickets)
      .set({ status: "IN_PROGRESS" as any, updatedAt: new Date() })
      .where(
        and(
          eq(tooleraSupportTickets.ticketId, ticketId),
          eq(tooleraSupportTickets.status, "OPEN")
        )
      );
  }

  return reply;
};

const updateStatus = async (ticketId: string, status: string) => {
  await getById(ticketId);
  const patch: any = { status: status as any, updatedAt: new Date() };
  if (status === "RESOLVED") patch.resolvedAt = new Date();
  const [updated] = await db
    .update(tooleraSupportTickets)
    .set(patch)
    .where(eq(tooleraSupportTickets.ticketId, ticketId))
    .returning();
  return updated;
};

const updatePriority = async (ticketId: string, priority: string) => {
  await getById(ticketId);
  const [updated] = await db
    .update(tooleraSupportTickets)
    .set({ priority: priority as any, updatedAt: new Date() })
    .where(eq(tooleraSupportTickets.ticketId, ticketId))
    .returning();
  return updated;
};

const assign = async (ticketId: string, adminId: string | null) => {
  await getById(ticketId);
  const [updated] = await db
    .update(tooleraSupportTickets)
    .set({ assignedTo: adminId, updatedAt: new Date() })
    .where(eq(tooleraSupportTickets.ticketId, ticketId))
    .returning();
  return updated;
};

export const SupportService = {
  getAll,
  getStats,
  getById,
  getReplies,
  create,
  addReply,
  updateStatus,
  updatePriority,
  assign,
};
