"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";

type Profile = {
  resumeText?: string | null;
  resumeSummary?: string | null;
  headline?: string | null;
  location?: string | null;
  workModel?: string | null;
  experienceLevel?: string | null;
  skills: string[];
  targetTitles: string[];
};

export default function ResumePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/resume")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data.profile);
        setAiEnabled(Boolean(data.aiEnabled));
      });
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const form = new FormData(e.currentTarget);
    const payload = {
      resumeText: String(form.get("resumeText") || ""),
      headline: String(form.get("headline") || ""),
      location: String(form.get("location") || ""),
      workModel: String(form.get("workModel") || "any"),
      experienceLevel: String(form.get("experienceLevel") || "mid"),
      targetTitles: String(form.get("targetTitles") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      skills: String(form.get("skills") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    const res = await fetch("/api/resume", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setStatus(data.error || "Save failed");
      return;
    }
    setProfile(data.profile);
    setAiEnabled(Boolean(data.aiEnabled));
    setStatus("Resume saved. Skills and summary refreshed.");
  }

  if (!profile) {
    return <p className="text-sm text-slate-400">Loading resume...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Resume AI</h1>
        <p className="mt-1 text-slate-400">
          Paste your resume once. We extract skills
          {aiEnabled ? " with your configured LLM" : " locally (add OPENAI_API_KEY for richer summaries)"}.
        </p>
      </div>

      <form className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]" onSubmit={onSubmit}>
        <Card>
          <label className="mb-2 block text-sm text-slate-300">Resume text</label>
          <Textarea
            name="resumeText"
            required
            rows={22}
            defaultValue={profile.resumeText || ""}
            placeholder="Paste your full resume here..."
          />
        </Card>

        <div className="space-y-4">
          <Card className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Headline</label>
              <Input name="headline" defaultValue={profile.headline || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Location</label>
              <Input name="location" defaultValue={profile.location || ""} placeholder="Austin, TX" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Work model</label>
              <Select name="workModel" defaultValue={profile.workModel || "any"}>
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Experience</label>
              <Select name="experienceLevel" defaultValue={profile.experienceLevel || "mid"}>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Target titles (comma-separated)</label>
              <Input
                name="targetTitles"
                defaultValue={(profile.targetTitles || []).join(", ")}
                placeholder="Software Engineer, Full-Stack Engineer"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Skills (comma-separated)</label>
              <Input
                name="skills"
                defaultValue={(profile.skills || []).join(", ")}
                placeholder="TypeScript, React, PostgreSQL"
              />
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save resume profile"}
            </Button>
            {status ? <p className="text-sm text-cyan-300">{status}</p> : null}
          </Card>

          {profile.resumeSummary ? (
            <Card>
              <h2 className="font-semibold text-white">Summary</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">{profile.resumeSummary}</p>
            </Card>
          ) : null}
        </div>
      </form>
    </div>
  );
}
