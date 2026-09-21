import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api";
import { parseJsonArray } from "@/lib/utils";

/** Read-only plans for Profile → Subscription (billing checkout is v2). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    current: user.subscription
      ? {
          status: user.subscription.status,
          billingInterval: user.subscription.billingInterval,
          currentPeriodEnd: user.subscription.currentPeriodEnd,
          plan: user.subscription.plan,
        }
      : null,
    plans: plans.map((p) => ({
      ...p,
      features: parseJsonArray(p.featuresJson),
    })),
    billingEnabled: false,
    note: "Subscriptions are planned for v2. Plans are seeded for UI preview only.",
  });
}
