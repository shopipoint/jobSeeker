import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatSalary, parseJsonArray } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() || "";
  const workModel = searchParams.get("workModel") || "";
  const experience = searchParams.get("experience") || "";
  const location = searchParams.get("location")?.trim() || "";

  const jobs = await prisma.job.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { title: { contains: q } },
                { company: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {},
        workModel && workModel !== "any" ? { workModel } : {},
        experience ? { experience } : {},
        location ? { location: { contains: location } } : {},
      ],
    },
    orderBy: { postedAt: "desc" },
    take: 100,
  });

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      ...job,
      skills: parseJsonArray(job.skills),
      salaryLabel: formatSalary(job.salaryMin, job.salaryMax, job.currency),
    })),
  });
}
