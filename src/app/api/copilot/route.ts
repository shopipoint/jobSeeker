import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { chatCompletion, isAiConfigured } from "@/lib/ai";
import { parseJsonArray } from "@/lib/utils";

const schema = z.object({
  message: z.string().min(1).max(4000),
});

function localCopilotReply(message: string, context: string) {
  const lower = message.toLowerCase();
  if (lower.includes("interview")) {
    return `Interview prep tip:\n1. Map 3 stories to STAR format from your experience.\n2. Prepare a 60-second pitch tied to the target role.\n3. Ask about success metrics for the first 90 days.\n\nYour profile context:\n${context.slice(0, 500)}`;
  }
  if (lower.includes("resume")) {
    return `Resume tip: keep a master resume, then tailor bullets to each JD with the Tailor Resume action on a job page. Quantify impact (%, $, time saved) wherever possible.\n\n${context.slice(0, 400)}`;
  }
  return `I'm your local career copilot. With an OpenAI-compatible API key configured, I give richer answers. For now:\n- Keep applying to roles with 70%+ match scores\n- Tailor your resume per job\n- Track every application status\n\nYou asked: "${message}"\n\nProfile snapshot:\n${context.slice(0, 600)}`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({ messages, aiEnabled: isAiConfigured() });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { message } = schema.parse(await request.json());
    await prisma.chatMessage.create({
      data: { userId: user.id, role: "user", content: message },
    });

    const context = [
      `Name: ${user.name}`,
      `Headline: ${user.profile?.headline || ""}`,
      `Skills: ${parseJsonArray(user.profile?.skills).join(", ")}`,
      `Targets: ${parseJsonArray(user.profile?.targetTitles).join(", ")}`,
      `Summary: ${user.profile?.resumeSummary || ""}`,
    ].join("\n");

    let reply: string;
    if (isAiConfigured()) {
      reply = await chatCompletion(
        `You are Orion, a practical AI career copilot for a self-hosted job search app. Be concise, actionable, and honest. Use the candidate context when relevant.`,
        `Candidate context:\n${context}\n\nUser message:\n${message}`,
      );
    } else {
      reply = localCopilotReply(message, context);
    }

    const assistant = await prisma.chatMessage.create({
      data: { userId: user.id, role: "assistant", content: reply },
    });

    return NextResponse.json({ message: assistant, aiEnabled: isAiConfigured() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }
    return NextResponse.json({ error: "Copilot failed" }, { status: 500 });
  }
}
