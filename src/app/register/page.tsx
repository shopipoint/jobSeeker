"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button, Card, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    router.push("/resume");
    router.refresh();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader appName={process.env.NEXT_PUBLIC_APP_NAME || "JobSeeker"} />
      <div className="mx-auto flex max-w-6xl justify-center px-6 py-16">
        <Card className="w-full max-w-md">
          <h1 className="text-2xl font-semibold text-white">Create your account</h1>
          <p className="mt-1 text-sm text-slate-400">
            Start matching jobs in under a minute.
          </p>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Name</label>
              <Input name="name" required placeholder="Alex Chen" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Email</label>
              <Input name="email" type="email" required placeholder="you@example.com" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Password</label>
              <Input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <Button className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Get started"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-400">
            Already have an account?{" "}
            <Link className="text-cyan-300 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
