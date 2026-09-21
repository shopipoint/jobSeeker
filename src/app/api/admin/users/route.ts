import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requirePermission, hashPassword } from "@/lib/auth";
import { forbidden, handleAuthError, jsonError } from "@/lib/api";
import {
  ROLES,
  ROLE_LABELS,
  assignableRolesFor,
  canAssignRole,
  isRole,
  normalizeRole,
} from "@/lib/rbac";

const updateSchema = z.object({
  userId: z.string().min(1),
  role: z.string().optional(),
  isActive: z.boolean().optional(),
  managerId: z.string().nullable().optional(),
});

const createSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  role: z.string(),
  managerId: z.string().nullable().optional(),
});

export async function GET() {
  try {
    const actor = await requirePermission("users:view");
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        managerId: true,
        createdAt: true,
        manager: { select: { id: true, name: true, email: true } },
        subscription: { include: { plan: true } },
      },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...u,
        roleLabel: ROLE_LABELS[normalizeRole(u.role)],
        plan: u.subscription?.plan?.name ?? "—",
      })),
      assignableRoles: assignableRolesFor(actor.role),
      allRoles: ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] })),
      actor: { id: actor.id, role: actor.role },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(request: Request) {
  try {
    const actor = await requirePermission("team:manage");
    const body = createSchema.parse(await request.json());
    if (!isRole(body.role) || !canAssignRole(actor.role, body.role)) {
      return forbidden("You cannot assign that role");
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email.toLowerCase() } });
    if (existing) return jsonError("Email already registered", 409);

    const freePlan = await prisma.subscriptionPlan.findUnique({ where: { code: "free" } });

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email.toLowerCase(),
        passwordHash: await hashPassword(body.password),
        role: body.role,
        managerId:
          body.managerId ??
          (normalizeRole(actor.role) === "PROJECT_MANAGER" ? actor.id : null),
        profile: { create: { headline: body.role, skills: "[]", targetTitles: "[]" } },
        settings: { create: {} },
        ...(freePlan
          ? {
              subscription: {
                create: {
                  planId: freePlan.id,
                  status: "active",
                  billingInterval: "monthly",
                },
              },
            }
          : {}),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.create",
        targetType: "user",
        targetId: user.id,
        meta: JSON.stringify({ role: user.role }),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input", 400);
    }
    return handleAuthError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const actor = await requirePermission("roles:assign");
    const body = updateSchema.parse(await request.json());
    const target = await prisma.user.findUnique({ where: { id: body.userId } });
    if (!target) return jsonError("User not found", 404);

    if (body.role) {
      if (!isRole(body.role) || !canAssignRole(actor.role, body.role)) {
        return forbidden("You cannot assign that role");
      }
      if (
        normalizeRole(actor.role) !== "SUPER_ADMIN" &&
        ROLE_LABELS[normalizeRole(target.role)] &&
        !canAssignRole(actor.role, target.role)
      ) {
        return forbidden("You cannot change this user");
      }
    }

    if (
      normalizeRole(actor.role) === "PROJECT_MANAGER" &&
      target.managerId !== actor.id &&
      target.id !== actor.id
    ) {
      // PMs may only manage their reports (and not elevate themselves)
      if (body.role || typeof body.isActive === "boolean" || body.managerId !== undefined) {
        if (target.managerId !== actor.id) {
          return forbidden("You can only manage your team members");
        }
      }
    }

    const user = await prisma.user.update({
      where: { id: body.userId },
      data: {
        role: body.role,
        isActive: body.isActive,
        managerId: body.managerId === undefined ? undefined : body.managerId,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true, managerId: true },
    });

    await prisma.auditLog.create({
      data: {
        actorId: actor.id,
        action: "user.update",
        targetType: "user",
        targetId: user.id,
        meta: JSON.stringify(body),
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input", 400);
    }
    return handleAuthError(error);
  }
}
