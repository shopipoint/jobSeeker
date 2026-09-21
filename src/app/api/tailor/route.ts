import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { chatCompletion, isAiConfigured } from "@/lib/ai";
import { parseJsonArray } from "@/lib/utils";

const schema = z.object({
  jobId: z.string().min(1),
});

function localTailor(resumeText: string, jobTitle: string, company: string, skills: string[]) {
  const highlight = skills.slice(0, 8).join(", ") || "relevant experience";
  return `${resumeText.trim()}

---
Tailored focus for ${jobTitle} at ${company}
Emphasize: ${highlight}
Reordered summary: Experienced professional targeting ${jobTitle}, with strengths in ${highlight}. Ready to contribute immediately.
`;
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user?.profile?.resumeText) {
    return NextResponse.json(
      { error: "Upload a resume before tailoring" },
      { status: 400 },
    );
  }

  try {
    const { jobId } = schema.parse(await request.json());
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const skills = parseJsonArray(job.skills);
    let tailored: string;

    if (isAiConfigured()) {
      tailored = await chatCompletion(
        `You are an expert resume writer. Rewrite the candidate resume to better match the job while staying truthful. Keep professional plain text. Do not invent employers or degrees.`,
        `Job: ${job.title} at ${job.company}\nRequirements:\n${job.requirements}\n\nDescription:\n${job.description}\n\nCandidate resume:\n${user.profile.resumeText}`,
        { temperature: 0.35 },
      );
    } else {
      tailored = localTailor(
        user.profile.resumeText,
        job.title,
        job.company,
        skills,
      );
    }

    const application = await prisma.application.upsert({
      where: { userId_jobId: { userId: user.id, jobId: job.id } },
      create: {
        userId: user.id,
        jobId: job.id,
        status: "saved",
        tailoredResume: tailored,
      },
      update: { tailoredResume: tailored },
    });

    return NextResponse.json({
      tailoredResume: tailored,
      applicationId: application.id,
      aiEnabled: isAiConfigured(),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    return NextResponse.json({ error: "Tailoring failed" }, { status: 500 });
  }
}
