import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { scoreJobMatch } from "@/lib/matching";
import { formatSalary, parseJsonArray } from "@/lib/utils";

const createSchema = z.object({
  jobId: z.string().min(1),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).optional(),
  notes: z.string().max(5000).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["saved", "applied", "interview", "offer", "rejected"]).optional(),
  notes: z.string().max(5000).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apps = await prisma.application.findMany({
    where: { userId: user.id },
    include: { job: true },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    applications: apps.map((app) => ({
      id: app.id,
      status: app.status,
      notes: app.notes,
      matchScore: app.matchScore,
      tailoredResume: app.tailoredResume,
      updatedAt: app.updatedAt,
      job: {
        ...app.job,
        skills: parseJsonArray(app.job.skills),
        salaryLabel: formatSalary(
          app.job.salaryMin,
          app.job.salaryMax,
          app.job.currency,
        ),
      },
    })),
  });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = createSchema.parse(await request.json());
    const job = await prisma.job.findUnique({ where: { id: body.jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const matchScore = user.profile ? scoreJobMatch(user.profile, job).score : null;

    const application = await prisma.application.upsert({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
      create: {
        userId: user.id,
        jobId: job.id,
        status: body.status || "saved",
        notes: body.notes,
        matchScore: matchScore ?? undefined,
      },
      update: {
        status: body.status || undefined,
        notes: body.notes,
        matchScore: matchScore ?? undefined,
      },
      include: { job: true },
    });

    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save application" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = updateSchema.parse(await request.json());
    const existing = await prisma.application.findFirst({
      where: { id: body.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const application = await prisma.application.update({
      where: { id: body.id },
      data: {
        status: body.status,
        notes: body.notes,
      },
      include: { job: true },
    });

    return NextResponse.json({ application });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
