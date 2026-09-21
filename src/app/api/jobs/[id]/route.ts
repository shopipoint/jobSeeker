import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { scoreJobMatch } from "@/lib/matching";
import { formatSalary, parseJsonArray } from "@/lib/utils";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  const application = await prisma.application.findUnique({
    where: { userId_jobId: { userId: user.id, jobId: job.id } },
  });

  const match = user.profile
    ? scoreJobMatch(user.profile, job)
    : { score: 0, matchedSkills: [], reasons: [] };

  return NextResponse.json({
    job: {
      ...job,
      skills: parseJsonArray(job.skills),
      salaryLabel: formatSalary(job.salaryMin, job.salaryMax, job.currency),
    },
    match,
    application,
  });
}
