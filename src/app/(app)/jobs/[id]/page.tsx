"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, MatchBadge } from "@/components/ui";

type JobDetail = {
  job: {
    id: string;
    title: string;
    company: string;
    location: string;
    workModel: string;
    experience: string;
    salaryLabel: string;
    description: string;
    requirements: string;
    skills: string[];
    sourceUrl?: string | null;
  };
  match: { score: number; matchedSkills: string[]; reasons: string[] };
  application: { status: string; tailoredResume?: string | null } | null;
};

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<JobDetail | null>(null);
  const [tailored, setTailored] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState("");

  async function load() {
    const res = await fetch(`/api/jobs/${params.id}`);
    const json = await res.json();
    setData(json);
    setTailored(json.application?.tailoredResume || "");
  }

  useEffect(() => {
    load();
  }, [params.id]);

  async function save(nextStatus: string) {
    setBusy("save");
    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: params.id, status: nextStatus }),
    });
    const json = await res.json();
    setBusy("");
    if (!res.ok) {
      setStatus(json.error || "Failed");
      return;
    }
    setStatus(`Marked as ${nextStatus}`);
    load();
  }

  async function tailor() {
    setBusy("tailor");
    const res = await fetch("/api/tailor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId: params.id }),
    });
    const json = await res.json();
    setBusy("");
    if (!res.ok) {
      setStatus(json.error || "Tailor failed");
      return;
    }
    setTailored(json.tailoredResume);
    setStatus(json.aiEnabled ? "Tailored with AI" : "Tailored with local fallback");
  }

  if (!data?.job) {
    return <p className="text-sm text-slate-400">Loading job...</p>;
  }

  const { job, match } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <MatchBadge score={match.score} />
            {data.application ? (
              <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs capitalize text-slate-300">
                {data.application.status}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-semibold text-white">{job.title}</h1>
          <p className="mt-1 text-slate-400">
            {job.company} · {job.location} · {job.workModel} · {job.experience}
          </p>
          <p className="mt-1 text-slate-300">{job.salaryLabel}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={busy === "save"} onClick={() => save("saved")}>
            Save
          </Button>
          <Button disabled={busy === "save"} onClick={() => save("applied")}>
            Mark applied
          </Button>
          <Button variant="secondary" disabled={busy === "tailor"} onClick={tailor}>
            {busy === "tailor" ? "Tailoring..." : "Tailor resume"}
          </Button>
        </div>
      </div>

      {status ? <p className="text-sm text-cyan-300">{status}</p> : null}

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-white">Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {job.description}
            </p>
          </Card>
          <Card>
            <h2 className="font-semibold text-white">Requirements</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-300">
              {job.requirements}
            </p>
          </Card>
          {tailored ? (
            <Card>
              <h2 className="font-semibold text-white">Tailored resume</h2>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-6 text-slate-300">
                {tailored}
              </pre>
            </Card>
          ) : null}
        </div>
        <div className="space-y-4">
          <Card>
            <h2 className="font-semibold text-white">Why it matches</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-300">
              {match.reasons.map((reason) => (
                <li key={reason}>• {reason}</li>
              ))}
            </ul>
            {match.matchedSkills.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {match.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-xs text-cyan-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : null}
          </Card>
          <Card>
            <h2 className="font-semibold text-white">Skills on JD</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                >
                  {skill}
                </span>
              ))}
            </div>
            {job.sourceUrl ? (
              <a
                className="mt-4 inline-block text-sm text-cyan-300 hover:underline"
                href={job.sourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original listing →
              </a>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
}
