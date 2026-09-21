import { parseJsonArray } from "./utils";

export type MatchableProfile = {
  skills: string;
  resumeText?: string | null;
  resumeSummary?: string | null;
  targetTitles?: string;
  experienceLevel?: string | null;
  workModel?: string | null;
  location?: string | null;
};

export type MatchableJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  workModel: string;
  experience: string;
  skills: string;
  description: string;
  requirements: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
  sourceUrl?: string | null;
  postedAt: Date;
};

function normalize(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9+#.\s-]/g, " ");
}

function tokenize(text: string): Set<string> {
  return new Set(
    normalize(text)
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let intersection = 0;
  for (const token of a) if (b.has(token)) intersection += 1;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

export function scoreJobMatch(profile: MatchableProfile, job: MatchableJob) {
  const profileSkills = parseJsonArray(profile.skills).map((s) => s.toLowerCase());
  const jobSkills = parseJsonArray(job.skills).map((s) => s.toLowerCase());
  const targetTitles = parseJsonArray(profile.targetTitles || "[]").map((s) =>
    s.toLowerCase(),
  );

  const skillSet = new Set(profileSkills);
  const matchedSkills = jobSkills.filter((s) =>
    [...skillSet].some((ps) => ps.includes(s) || s.includes(ps)),
  );
  const skillScore =
    jobSkills.length === 0 ? 0.4 : matchedSkills.length / jobSkills.length;

  const resumeBlob = [
    profile.resumeText || "",
    profile.resumeSummary || "",
    profileSkills.join(" "),
    targetTitles.join(" "),
  ].join(" ");

  const jobBlob = [job.title, job.description, job.requirements, jobSkills.join(" ")].join(
    " ",
  );
  const textScore = jaccard(tokenize(resumeBlob), tokenize(jobBlob));

  let titleBonus = 0;
  const title = job.title.toLowerCase();
  if (targetTitles.some((t) => title.includes(t) || t.includes(title))) {
    titleBonus = 0.15;
  }

  let experienceBonus = 0;
  if (profile.experienceLevel && profile.experienceLevel === job.experience) {
    experienceBonus = 0.1;
  }

  let workModelBonus = 0;
  if (
    !profile.workModel ||
    profile.workModel === "any" ||
    profile.workModel === job.workModel
  ) {
    workModelBonus = 0.05;
  }

  let locationBonus = 0;
  if (
    profile.location &&
    (job.location.toLowerCase().includes(profile.location.toLowerCase()) ||
      job.workModel === "remote")
  ) {
    locationBonus = 0.05;
  }

  const raw =
    skillScore * 0.55 +
    textScore * 0.2 +
    titleBonus +
    experienceBonus +
    workModelBonus +
    locationBonus;

  const score = Math.max(1, Math.min(99, Math.round(raw * 100)));

  return {
    score,
    matchedSkills,
    reasons: [
      matchedSkills.length
        ? `Matched skills: ${matchedSkills.slice(0, 6).join(", ")}`
        : "Limited skill overlap — review the JD carefully",
      titleBonus > 0 ? "Title aligns with your targets" : null,
      experienceBonus > 0 ? "Experience level matches" : null,
      job.workModel === "remote" ? "Remote-friendly role" : null,
    ].filter(Boolean) as string[],
  };
}

export function rankJobs(profile: MatchableProfile, jobs: MatchableJob[]) {
  return jobs
    .map((job) => ({ job, ...scoreJobMatch(profile, job) }))
    .sort((a, b) => b.score - a.score);
}

export function extractSkillsFromText(text: string): string[] {
  const common = [
    "javascript",
    "typescript",
    "python",
    "java",
    "go",
    "rust",
    "react",
    "next.js",
    "node.js",
    "vue",
    "angular",
    "aws",
    "azure",
    "gcp",
    "docker",
    "kubernetes",
    "sql",
    "postgres",
    "mongodb",
    "redis",
    "graphql",
    "rest",
    "ci/cd",
    "terraform",
    "linux",
    "figma",
    "product management",
    "agile",
    "scrum",
    "machine learning",
    "pytorch",
    "tensorflow",
    "llm",
    "rag",
    "langchain",
    "fastapi",
    "django",
    "spring",
    "kafka",
    "spark",
    "data analysis",
    "excel",
    "salesforce",
    "seo",
    "marketing",
    "copywriting",
    "ui/ux",
    "communication",
    "leadership",
  ];

  const lower = text.toLowerCase();
  return common.filter((skill) => lower.includes(skill));
}
