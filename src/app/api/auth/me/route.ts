import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseJsonArray } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile
        ? {
            ...user.profile,
            skills: parseJsonArray(user.profile.skills),
            targetTitles: parseJsonArray(user.profile.targetTitles),
          }
        : null,
    },
  });
}
