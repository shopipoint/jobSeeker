import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rankJobs } from "@/lib/matching";
import { formatSalary, parseJsonArray } from "@/lib/utils";
import { Card, MatchBadge } from "@/components/ui";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [jobCount, applications, jobs] = await Promise.all([
    prisma.job.count(),
    prisma.application.findMany({
      where: { userId: user.id },
      include: { job: true },
      orderBy: { updatedAt: "desc" },
      take: 5,
    }),
    prisma.job.findMany({ orderBy: { postedAt: "desc" }, take: 100 }),
  ]);

  const topMatches = user.profile?.resumeText
    ? rankJobs(user.profile, jobs).slice(0, 5)
    : [];

  const stats = [
    { label: "Jobs indexed", value: String(jobCount) },
    {
      label: "Applications",
      value: String(await prisma.application.count({ where: { userId: user.id } })),
    },
    {
      label: "Skills on profile",
      value: String(parseJsonArray(user.profile?.skills).length),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold text-white">Hi, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-slate-400">
          Your AI job search hub.{" "}
          {!user.profile?.resumeText ? (
            <Link className="text-cyan-300 hover:underline" href="/resume">
              Add a resume
            </Link>
          ) : (
            "Matches update as your profile improves."
          )}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <div className="text-xs uppercase tracking-wide text-slate-400">{stat.label}</div>
            <div className="mt-2 text-3xl font-semibold text-white">{stat.value}</div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Top matches</h2>
            <Link href="/jobs" className="text-sm text-cyan-300 hover:underline">
              Browse all
            </Link>
          </div>
          <div className="space-y-3">
            {topMatches.length === 0 ? (
              <p className="text-sm text-slate-400">
                Save your resume to unlock ranked matches.
              </p>
            ) : (
              topMatches.map(({ job, score }) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}`}
                  className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 hover:border-cyan-400/30"
                >
                  <div>
                    <div className="font-medium text-white">{job.title}</div>
                    <div className="text-xs text-slate-400">
                      {job.company} · {job.location} ·{" "}
                      {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                    </div>
                  </div>
                  <MatchBadge score={score} />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recent applications</h2>
            <Link href="/applications" className="text-sm text-cyan-300 hover:underline">
              Tracker
            </Link>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-slate-400">No applications yet. Save a job to start.</p>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-white">{app.job.title}</div>
                    <div className="text-xs text-slate-400">{app.job.company}</div>
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">
                    {app.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
