import OpenAI from "openai";

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
}

export function getOpenAI() {
  if (!isAiConfigured()) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });
}

export function getModel() {
  return process.env.OPENAI_MODEL || "gpt-4o-mini";
}

export async function chatCompletion(
  system: string,
  user: string,
  options?: { temperature?: number },
) {
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: getModel(),
    temperature: options?.temperature ?? 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });
  return response.choices[0]?.message?.content?.trim() || "";
}
