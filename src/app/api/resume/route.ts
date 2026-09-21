import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { chatCompletion, isAiConfigured } from "@/lib/ai";
import { extractSkillsFromText } from "@/lib/matching";
import { parseJsonArray, toJsonArray } from "@/lib/utils";

const schema = z.object({
  resumeText: z.string().min(40).max(50000),
  headline: z.string().max(120).optional(),
  location: z.string().max(120).optional(),
  workModel: z.enum(["remote", "hybrid", "onsite", "any"]).optional(),
  experienceLevel: z.enum(["entry", "mid", "senior", "lead"]).optional(),
  targetTitles: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    profile: {
      ...user.profile,
      skills: parseJsonArray(user.profile.skills),
      targetTitles: parseJsonArray(user.profile.targetTitles),
    },
    aiEnabled: isAiConfigured(),
  });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = schema.parse(await request.json());
    let skills = body.skills?.length
      ? body.skills
      : extractSkillsFromText(body.resumeText);
    let summary = body.resumeText.slice(0, 400);

    if (isAiConfigured()) {
      try {
        const aiRaw = await chatCompletion(
          `You extract structured resume insights. Return ONLY valid JSON with keys summary (string) and skills (string array).`,
          `Resume:\n${body.resumeText.slice(0, 12000)}`,
          { temperature: 0.2 },
        );
        const jsonMatch = aiRaw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as {
            summary?: string;
            skills?: string[];
          };
          if (parsed.summary) summary = parsed.summary;
          if (parsed.skills?.length) {
            skills = Array.from(new Set([...skills, ...parsed.skills]));
          }
        }
      } catch {
        // Fall back to local extraction
      }
    }

    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        resumeText: body.resumeText,
        resumeSummary: summary,
        headline: body.headline || user.profile?.headline || "Job seeker",
        location: body.location || null,
        workModel: body.workModel || "any",
        experienceLevel: body.experienceLevel || "mid",
        skills: toJsonArray(skills),
        targetTitles: toJsonArray(body.targetTitles || []),
      },
      update: {
        resumeText: body.resumeText,
        resumeSummary: summary,
        headline: body.headline ?? undefined,
        location: body.location ?? undefined,
        workModel: body.workModel ?? undefined,
        experienceLevel: body.experienceLevel ?? undefined,
        skills: toJsonArray(skills),
        targetTitles: body.targetTitles
          ? toJsonArray(body.targetTitles)
          : undefined,
      },
    });

    return NextResponse.json({
      profile: {
        ...profile,
        skills: parseJsonArray(profile.skills),
        targetTitles: parseJsonArray(profile.targetTitles),
      },
      aiEnabled: isAiConfigured(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || "Invalid input" },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: "Failed to save resume" }, { status: 500 });
  }
}
