import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui";

const features = [
  {
    title: "Personalized AI job matches",
    body: "Score roles against your real skills and resume — not keyword spam.",
  },
  {
    title: "Job-specific tailored resume",
    body: "Rewrite your resume for each JD in seconds with an OpenAI-compatible model or local fallback.",
  },
  {
    title: "Application tracker",
    body: "Save, apply, interview, offer — keep every pipeline stage in one place.",
  },
  {
    title: "24/7 career copilot",
    body: "Ask for interview prep, resume advice, and search strategy anytime.",
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader appName={process.env.NEXT_PUBLIC_APP_NAME || "JobSeeker"} />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-6 pb-20 pt-14">
        <section className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
              Self-hosted · Docker-ready · OpenAI / Ollama compatible
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-6xl">
              No more solo job hunting.{" "}
              <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                Do it with AI.
              </span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              JobSeeker is an open, self-hosted take on platforms like{" "}
              <a
                className="text-cyan-300 underline-offset-2 hover:underline"
                href="https://jobright.ai/"
                target="_blank"
                rel="noreferrer"
              >
                Jobright
              </a>
              : matched jobs, tailored resumes, tracking, and a career copilot — on your machine.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-violet-500/25"
              >
                Try for free
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-4 text-center">
              {[
                ["Local-first", "Your data stays with you"],
                ["AI optional", "Works without an API key"],
                ["Docker", "One-command deploy"],
              ].map(([title, subtitle]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
                  <div className="text-sm font-semibold text-white">{title}</div>
                  <div className="mt-1 text-[11px] text-slate-400">{subtitle}</div>
                </div>
              ))}
            </div>
          </div>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-cyan-400/5" />
            <div className="relative space-y-4">
              <div className="text-sm font-medium text-slate-300">Today&apos;s matches</div>
              {[
                { role: "Senior Full-Stack Engineer", company: "Nova Labs", score: 92 },
                { role: "AI Platform Engineer", company: "Orbit AI", score: 87 },
                { role: "Product Engineer", company: "Harbor", score: 81 },
              ].map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3"
                >
                  <div>
                    <div className="font-medium text-white">{item.role}</div>
                    <div className="text-xs text-slate-400">{item.company}</div>
                  </div>
                  <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-xs font-semibold text-emerald-300">
                    {item.score}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{feature.body}</p>
            </Card>
          ))}
        </section>
      </main>
      <footer className="border-t border-white/10 px-6 py-8 text-center text-xs text-slate-500">
        JobSeeker — self-hosted AI job search. Inspired by Jobright; not affiliated.
      </footer>
    </div>
  );
}
