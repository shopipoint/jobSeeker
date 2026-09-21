import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { rankJobs } from "@/lib/matching";
import { formatSalary, parseJsonArray } from "@/lib/utils";

export async function GET() {
  const user = await getCurrentUser();
  if (!user?.profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!user.profile.resumeText && parseJsonArray(user.profile.skills).length === 0) {
    return NextResponse.json({
      matches: [],
      message: "Add your resume first to unlock personalized matches.",
    });
  }

  const jobs = await prisma.job.findMany({ orderBy: { postedAt: "desc" }, take: 200 });
  const ranked = rankJobs(user.profile, jobs).slice(0, 30);

  return NextResponse.json({
    matches: ranked.map(({ job, score, matchedSkills, reasons }) => ({
      ...job,
      skills: parseJsonArray(job.skills),
      salaryLabel: formatSalary(job.salaryMin, job.salaryMax, job.currency),
      matchScore: score,
      matchedSkills,
      reasons,
    })),
  });
}
