import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { unauthorized, jsonError } from "@/lib/api";
import { parseJsonArray, toJsonArray } from "@/lib/utils";
import { ROLE_LABELS, normalizeRole, permissionsFor } from "@/lib/rbac";

const profileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  headline: z.string().max(120).optional().nullable(),
  location: z.string().max(120).optional().nullable(),
  phone: z.string().max(40).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  workModel: z.enum(["remote", "hybrid", "onsite", "any"]).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
  timezone: z.string().max(64).optional(),
  targetTitles: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

const settingsSchema = z.object({
  notifyEmail: z.boolean().optional(),
  notifyInApp: z.boolean().optional(),
  notifyMatchAlerts: z.boolean().optional(),
  notifyAppUpdates: z.boolean().optional(),
  preferredLanguage: z.string().max(16).optional(),
  theme: z.enum(["dark", "light", "system"]).optional(),
  defaultWorkModel: z.enum(["remote", "hybrid", "onsite", "any"]).optional(),
  defaultExperience: z.enum(["entry", "mid", "senior", "lead"]).optional(),
  aiAssistEnabled: z.boolean().optional(),
  weeklyDigest: z.boolean().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

function serializeUser(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>) {
  const role = normalizeRole(user.role);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role,
    roleLabel: ROLE_LABELS[role],
    permissions: permissionsFor(role),
    profile: user.profile
      ? {
          ...user.profile,
          skills: parseJsonArray(user.profile.skills),
          targetTitles: parseJsonArray(user.profile.targetTitles),
        }
      : null,
    settings: user.settings,
    subscription: user.subscription
      ? {
          status: user.subscription.status,
          billingInterval: user.subscription.billingInterval,
          plan: user.subscription.plan
            ? {
                code: user.subscription.plan.code,
                name: user.subscription.plan.name,
                description: user.subscription.plan.description,
              }
            : null,
        }
      : null,
    manager: user.manager,
  };
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();
  return NextResponse.json({ user: serializeUser(user) });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  try {
    const body = await request.json();
    const section = body.section as string;

    if (section === "profile") {
      const data = profileSchema.parse(body.data);
      if (data.name) {
        await prisma.user.update({ where: { id: user.id }, data: { name: data.name } });
      }
      const profile = await prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          headline: data.headline ?? null,
          location: data.location ?? null,
          phone: data.phone ?? null,
          bio: data.bio ?? null,
          workModel: data.workModel ?? "any",
          experienceLevel: data.experienceLevel ?? "mid",
          timezone: data.timezone ?? "UTC",
          skills: toJsonArray(data.skills || []),
          targetTitles: toJsonArray(data.targetTitles || []),
        },
        update: {
          headline: data.headline === undefined ? undefined : data.headline,
          location: data.location === undefined ? undefined : data.location,
          phone: data.phone === undefined ? undefined : data.phone,
          bio: data.bio === undefined ? undefined : data.bio,
          workModel: data.workModel,
          experienceLevel: data.experienceLevel,
          timezone: data.timezone,
          skills: data.skills ? toJsonArray(data.skills) : undefined,
          targetTitles: data.targetTitles ? toJsonArray(data.targetTitles) : undefined,
        },
      });
      void profile;
    } else if (section === "settings") {
      const data = settingsSchema.parse(body.data);
      await prisma.userSettings.upsert({
        where: { userId: user.id },
        create: { userId: user.id, ...data },
        update: data,
      });
    } else if (section === "password") {
      const data = passwordSchema.parse(body.data);
      const fresh = await prisma.user.findUnique({ where: { id: user.id } });
      if (!fresh || !(await verifyPassword(data.currentPassword, fresh.passwordHash))) {
        return jsonError("Current password is incorrect", 400);
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: await hashPassword(data.newPassword) },
      });
    } else {
      return jsonError("Unknown section", 400);
    }

    const updated = await getCurrentUser();
    return NextResponse.json({ user: updated ? serializeUser(updated) : null });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message || "Invalid input", 400);
    }
    return jsonError("Failed to update profile", 500);
  }
}
