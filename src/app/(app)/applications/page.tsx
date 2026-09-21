"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card, MatchBadge, Select } from "@/components/ui";

type ApplicationRow = {
  id: string;
  status: string;
  matchScore?: number | null;
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    salaryLabel: string;
  };
};

const statuses = ["saved", "applied", "interview", "offer", "rejected"] as const;

export default function ApplicationsPage() {
  const [apps, setApps] = useState<ApplicationRow[]>([]);

  async function load() {
    const res = await fetch("/api/applications");
    const data = await res.json();
    setApps(data.applications || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateStatus(id: string, status: string) {
    await fetch("/api/applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Application tracker</h1>
        <p className="mt-1 text-slate-400">
          Keep every opportunity moving — saved through offer.
        </p>
      </div>

      <div className="grid gap-3">
        {apps.map((app) => (
          <Card key={app.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Link href={`/jobs/${app.job.id}`} className="text-lg font-semibold text-white hover:text-cyan-200">
                {app.job.title}
              </Link>
              <p className="text-sm text-slate-400">
                {app.job.company} · {app.job.location} · {app.job.salaryLabel}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {typeof app.matchScore === "number" ? <MatchBadge score={app.matchScore} /> : null}
              <Select
                className="w-36"
                value={app.status}
                onChange={(e) => updateStatus(app.id, e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </Select>
            </div>
          </Card>
        ))}
        {apps.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-400">
              No applications yet. Open a job and click Save or Mark applied.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
