import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const jobs = [
  {
    title: "Senior Full-Stack Engineer",
    company: "Nova Labs",
    location: "Remote - US",
    workModel: "remote",
    experience: "senior",
    salaryMin: 160000,
    salaryMax: 210000,
    description:
      "Build product features end-to-end across Next.js and Node services. Own reliability, DX, and shipping velocity for a fast-growing SaaS platform.",
    requirements:
      "- 5+ years full-stack experience\n- Strong TypeScript, React, Node.js\n- Experience with Postgres and Redis\n- Comfortable with AWS and CI/CD",
    skills: ["TypeScript", "React", "Next.js", "Node.js", "Postgres", "AWS", "Docker"],
    sourceUrl: "https://example.com/jobs/nova-fullstack",
  },
  {
    title: "AI Platform Engineer",
    company: "Orbit AI",
    location: "San Francisco, CA",
    workModel: "hybrid",
    experience: "senior",
    salaryMin: 180000,
    salaryMax: 240000,
    description:
      "Design and operate LLM application infrastructure: retrieval pipelines, evaluation harnesses, and low-latency inference services.",
    requirements:
      "- Experience shipping LLM/RAG systems\n- Python and FastAPI\n- Vector databases and observability\n- Strong product sense with ML stakeholders",
    skills: ["Python", "FastAPI", "LLM", "RAG", "Docker", "Kubernetes", "Postgres"],
    sourceUrl: "https://example.com/jobs/orbit-ai",
  },
  {
    title: "Product Engineer",
    company: "Harbor",
    location: "New York, NY",
    workModel: "hybrid",
    experience: "mid",
    salaryMin: 140000,
    salaryMax: 175000,
    description:
      "Partner with design and PM to ship customer-facing workflows. Balance polish with pragmatic engineering in a TypeScript monorepo.",
    requirements:
      "- 3+ years web product engineering\n- React and TypeScript\n- Empathy for UX and analytics\n- Bonus: GraphQL",
    skills: ["TypeScript", "React", "GraphQL", "Node.js", "Product Management"],
    sourceUrl: "https://example.com/jobs/harbor-product",
  },
  {
    title: "Backend Engineer",
    company: "Ledgerly",
    location: "Austin, TX",
    workModel: "onsite",
    experience: "mid",
    salaryMin: 130000,
    salaryMax: 165000,
    description:
      "Own payment and ledger services with strong correctness guarantees. Work closely with compliance and data teams.",
    requirements:
      "- Strong Java or Go\n- Relational data modeling\n- Event-driven systems\n- Interest in fintech reliability",
    skills: ["Java", "Go", "SQL", "Kafka", "Postgres", "Docker"],
    sourceUrl: "https://example.com/jobs/ledgerly-backend",
  },
  {
    title: "Machine Learning Engineer",
    company: "SignalForge",
    location: "Remote - Global",
    workModel: "remote",
    experience: "senior",
    salaryMin: 170000,
    salaryMax: 230000,
    description:
      "Train and productionize ranking and recommendation models used across the job matching funnel.",
    requirements:
      "- PyTorch experience\n- Feature stores and online inference\n- Strong experimental rigor\n- Collaboration with product analytics",
    skills: ["Python", "PyTorch", "Machine Learning", "SQL", "AWS"],
    sourceUrl: "https://example.com/jobs/signalforge-ml",
  },
  {
    title: "Frontend Engineer",
    company: "Canvasly",
    location: "Seattle, WA",
    workModel: "hybrid",
    experience: "mid",
    salaryMin: 125000,
    salaryMax: 155000,
    description:
      "Craft delightful UI for a collaborative design tool. Focus on performance, accessibility, and component systems.",
    requirements:
      "- Expert React\n- Strong CSS/Tailwind craft\n- Accessibility mindset\n- Experience with design systems",
    skills: ["React", "TypeScript", "UI/UX", "Figma", "JavaScript"],
    sourceUrl: "https://example.com/jobs/canvasly-fe",
  },
  {
    title: "DevOps Engineer",
    company: "Stackwright",
    location: "Remote - US",
    workModel: "remote",
    experience: "senior",
    salaryMin: 150000,
    salaryMax: 190000,
    description:
      "Automate cloud infrastructure and developer platforms. Improve build times, deployments, and incident response.",
    requirements:
      "- Kubernetes and Terraform\n- CI/CD expertise\n- Observability tooling\n- Linux and networking fundamentals",
    skills: ["Kubernetes", "Terraform", "Docker", "AWS", "Linux", "CI/CD"],
    sourceUrl: "https://example.com/jobs/stackwright-devops",
  },
  {
    title: "Junior Software Engineer",
    company: "BrightPath",
    location: "Chicago, IL",
    workModel: "hybrid",
    experience: "entry",
    salaryMin: 85000,
    salaryMax: 105000,
    description:
      "Join a mentorship-heavy team building internal tools for education nonprofits. Learn by shipping real features weekly.",
    requirements:
      "- Solid fundamentals in JavaScript or Python\n- Curiosity and communication\n- Internship or project portfolio\n- Willingness to learn React",
    skills: ["JavaScript", "Python", "React", "SQL", "Communication"],
    sourceUrl: "https://example.com/jobs/brightpath-junior",
  },
  {
    title: "Growth Marketing Manager",
    company: "Pulseboard",
    location: "Remote - US",
    workModel: "remote",
    experience: "mid",
    salaryMin: 110000,
    salaryMax: 140000,
    description:
      "Own acquisition experiments across SEO, content, and lifecycle messaging for a B2B analytics product.",
    requirements:
      "- Hands-on SEO and content ops\n- Experimentation mindset\n- Comfort with analytics tools\n- Clear writing",
    skills: ["SEO", "Marketing", "Copywriting", "Data Analysis", "Excel"],
    sourceUrl: "https://example.com/jobs/pulseboard-growth",
  },
  {
    title: "Staff Software Engineer",
    company: "Northwind Systems",
    location: "Boston, MA",
    workModel: "hybrid",
    experience: "lead",
    salaryMin: 210000,
    salaryMax: 270000,
    description:
      "Set technical direction for a multi-team platform. Mentor seniors, drive architecture reviews, and unblock delivery.",
    requirements:
      "- 10+ years engineering experience\n- Distributed systems leadership\n- Excellent communication\n- Track record of org-level impact",
    skills: ["Leadership", "TypeScript", "Java", "Kubernetes", "Kafka", "AWS"],
    sourceUrl: "https://example.com/jobs/northwind-staff",
  },
];

const plans = [
  {
    code: "free",
    name: "Free",
    description: "Core job matching and tracking for individuals.",
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    maxSeats: 1,
    maxApplications: 50,
    maxAiRequests: 20,
    featuresJson: JSON.stringify(["Job matches", "Application tracker", "Local AI fallback"]),
    sortOrder: 1,
  },
  {
    code: "pro",
    name: "Pro",
    description: "Higher AI limits and tailored resume volume.",
    priceMonthlyCents: 2900,
    priceYearlyCents: 29000,
    maxSeats: 1,
    maxApplications: 300,
    maxAiRequests: 500,
    featuresJson: JSON.stringify([
      "Everything in Free",
      "Priority matching",
      "Resume tailoring credits",
    ]),
    sortOrder: 2,
  },
  {
    code: "team",
    name: "Team",
    description: "For Project Managers with Bidder / Caller / Developer seats.",
    priceMonthlyCents: 9900,
    priceYearlyCents: 99000,
    maxSeats: 10,
    maxApplications: 2000,
    maxAiRequests: 2000,
    featuresJson: JSON.stringify([
      "Everything in Pro",
      "Team RBAC",
      "Shared pipeline",
      "Seat management",
    ]),
    sortOrder: 3,
  },
  {
    code: "enterprise",
    name: "Enterprise",
    description: "Custom limits, SSO, and dedicated support (v2+).",
    priceMonthlyCents: 0,
    priceYearlyCents: 0,
    maxSeats: 100,
    maxApplications: 100000,
    maxAiRequests: 100000,
    featuresJson: JSON.stringify(["SSO", "Audit exports", "Custom SLAs", "Dedicated support"]),
    sortOrder: 4,
  },
];

async function seedPlans() {
  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { code: plan.code },
      create: plan,
      update: plan,
    });
  }
  console.log(`Seeded ${plans.length} subscription plans`);
}

async function seedUsers() {
  const freePlan = await prisma.subscriptionPlan.findUnique({ where: { code: "free" } });
  const teamPlan = await prisma.subscriptionPlan.findUnique({ where: { code: "team" } });
  const passwordHash = await bcrypt.hash("password123", 10);

  async function ensureUser(data: {
    email: string;
    name: string;
    role: string;
    managerId?: string | null;
    planId?: string | null;
  }) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) return existing;
    return prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        role: data.role,
        passwordHash,
        managerId: data.managerId ?? null,
        profile: {
          create: {
            headline: data.role,
            skills: "[]",
            targetTitles: "[]",
          },
        },
        settings: { create: {} },
        ...(data.planId
          ? {
              subscription: {
                create: {
                  planId: data.planId,
                  status: "active",
                  billingInterval: "monthly",
                },
              },
            }
          : {}),
      },
    });
  }

  const admin = await ensureUser({
    email: "admin@jobseeker.local",
    name: "Super Admin",
    role: "SUPER_ADMIN",
    planId: teamPlan?.id || freePlan?.id,
  });

  const pm = await ensureUser({
    email: "pm@jobseeker.local",
    name: "Jordan Lee",
    role: "PROJECT_MANAGER",
    planId: teamPlan?.id || freePlan?.id,
  });

  await ensureUser({
    email: "bidder@jobseeker.local",
    name: "Sam Bidder",
    role: "BIDDER",
    managerId: pm.id,
    planId: freePlan?.id,
  });
  await ensureUser({
    email: "caller@jobseeker.local",
    name: "Casey Caller",
    role: "CALLER",
    managerId: pm.id,
    planId: freePlan?.id,
  });
  await ensureUser({
    email: "dev@jobseeker.local",
    name: "Dev Rivera",
    role: "DEVELOPER",
    managerId: pm.id,
    planId: freePlan?.id,
  });

  console.log("Seeded demo users (password: password123)");
  console.log(`  admin: ${admin.email}`);
  console.log(`  pm:    ${pm.email}`);
}

async function seedJobs() {
  const existing = await prisma.job.count();
  if (existing > 0 && process.env.FORCE_SEED !== "true") {
    console.log(`Skipping jobs seed (${existing} jobs already present).`);
    return;
  }

  if (process.env.FORCE_SEED === "true") {
    await prisma.application.deleteMany();
    await prisma.job.deleteMany();
  }

  for (const job of jobs) {
    await prisma.job.create({
      data: {
        ...job,
        skills: JSON.stringify(job.skills),
      },
    });
  }
  console.log(`Seeded ${jobs.length} jobs`);
}

async function main() {
  await seedPlans();
  await seedUsers();
  await seedJobs();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
