"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Button, Card, Input } from "@/components/ui";

type Message = { id: string; role: string; content: string };

export default function CopilotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/copilot");
    const data = await res.json();
    setMessages(data.messages || []);
    setAiEnabled(Boolean(data.aiEnabled));
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const message = String(formData.get("message") || "").trim();
    if (!message) return;
    form.reset();
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: `tmp-${Date.now()}`, role: "user", content: message },
    ]);
    const res = await fetch("/api/copilot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.message) {
      setMessages((prev) => [...prev.filter((m) => !m.id.startsWith("tmp-")), { id: `u-${Date.now()}`, role: "user", content: message }, data.message]);
      setAiEnabled(Boolean(data.aiEnabled));
    }
    await load();
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-white">Career copilot</h1>
        <p className="mt-1 text-slate-400">
          Ask about resumes, interviews, and search strategy.
          {aiEnabled
            ? " Connected to your OpenAI-compatible model."
            : " Running in local fallback mode — set OPENAI_API_KEY for full AI."}
        </p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden p-0">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-slate-400">
              Try: “How should I prep for a senior full-stack interview?” or “Rewrite my summary for AI platform roles.”
            </div>
          ) : null}
          {messages.map((message) => (
            <div
              key={message.id}
              className={
                message.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-3 text-sm text-slate-950"
                  : "mr-auto max-w-[85%] rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200"
              }
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          ))}
          {loading ? (
            <div className="mr-auto rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
              Thinking...
            </div>
          ) : null}
          <div ref={bottomRef} />
        </div>
        <form className="flex gap-2 border-t border-white/10 p-4" onSubmit={onSubmit}>
          <Input name="message" placeholder="Ask your copilot..." disabled={loading} />
          <Button type="submit" disabled={loading}>
            Send
          </Button>
        </form>
      </Card>
    </div>
  );
}
