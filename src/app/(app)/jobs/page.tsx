"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, MatchBadge, Select } from "@/components/ui";

type JobCard = {
  id: string;
  title: string;
  company: string;
  location: string;
  workModel: string;
  experience: string;
  salaryLabel: string;
  matchScore?: number;
  reasons?: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobCard[]>([]);
  const [mode, setMode] = useState<"matched" | "browse">("matched");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadMatched() {
    setLoading(true);
    setMode("matched");
    const res = await fetch("/api/match");
    const data = await res.json();
    setJobs(data.matches || []);
    setMessage(data.message || "");
    setLoading(false);
  }

  async function loadBrowse(e?: FormEvent<HTMLFormElement>) {
    e?.preventDefault();
    setLoading(true);
    setMode("browse");
    const form = e ? new FormData(e.currentTarget) : null;
    const params = new URLSearchParams();
    if (form) {
      for (const key of ["q", "workModel", "experience", "location"]) {
        const value = String(form.get(key) || "");
        if (value && value !== "any") params.set(key, value);
      }
    }
    const res = await fetch(`/api/jobs?${params.toString()}`);
    const data = await res.json();
    setJobs(data.jobs || []);
    setMessage("");
    setLoading(false);
  }

  useEffect(() => {
    loadMatched();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white">Jobs</h1>
          <p className="mt-1 text-slate-400">
            Personalized matches or full browse of your local job hub.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant={mode === "matched" ? "primary" : "secondary"} onClick={loadMatched}>
            AI matches
          </Button>
          <Button
            variant={mode === "browse" ? "primary" : "secondary"}
            onClick={() => loadBrowse()}
          >
            Browse
          </Button>
        </div>
      </div>

      <Card>
        <form className="grid gap-3 md:grid-cols-5" onSubmit={loadBrowse}>
          <Input name="q" placeholder="Title, company, keyword" />
          <Input name="location" placeholder="City / region" />
          <Select name="workModel" defaultValue="any">
            <option value="any">Any work model</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </Select>
          <Select name="experience" defaultValue="">
            <option value="">Any experience</option>
            <option value="entry">Entry</option>
            <option value="mid">Mid</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </Select>
          <Button type="submit">Search</Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm text-slate-400">Loading jobs...</p>
      ) : message ? (
        <Card>
          <p className="text-sm text-slate-300">{message}</p>
          <Link className="mt-3 inline-block text-sm text-cyan-300 hover:underline" href="/resume">
            Go to resume →
          </Link>
        </Card>
      ) : (
        <div className="grid gap-3">
          {jobs.map((job) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="transition hover:border-cyan-400/30">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">{job.title}</h2>
                    <p className="text-sm text-slate-400">
                      {job.company} · {job.location} · {job.workModel} · {job.experience}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{job.salaryLabel}</p>
                    {job.reasons?.length ? (
                      <p className="mt-2 text-xs text-slate-500">{job.reasons[0]}</p>
                    ) : null}
                  </div>
                  {typeof job.matchScore === "number" ? (
                    <MatchBadge score={job.matchScore} />
                  ) : null}
                </div>
              </Card>
            </Link>
          ))}
          {jobs.length === 0 ? (
            <p className="text-sm text-slate-400">No jobs found. Seed the database to get started.</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
