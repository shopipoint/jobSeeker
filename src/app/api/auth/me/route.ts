import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";
import { permissionsFor, ROLE_LABELS, normalizeRole } from "@/lib/rbac";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });

  const role = normalizeRole(user.role);
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role,
      roleLabel: ROLE_LABELS[role],
      permissions: permissionsFor(role),
      isActive: user.isActive,
      manager: user.manager,
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
            currentPeriodEnd: user.subscription.currentPeriodEnd,
            plan: user.subscription.plan
              ? {
                  code: user.subscription.plan.code,
                  name: user.subscription.plan.name,
                  description: user.subscription.plan.description,
                }
              : null,
          }
        : null,
    },
  });
}
