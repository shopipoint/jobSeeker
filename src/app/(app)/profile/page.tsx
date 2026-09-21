"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/rbac";

type ProfileUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleLabel: string;
  permissions: string[];
  manager?: { id: string; name: string; email: string; role: string } | null;
  profile: {
    headline?: string | null;
    location?: string | null;
    phone?: string | null;
    bio?: string | null;
    workModel?: string | null;
    experienceLevel?: string | null;
    timezone?: string | null;
    skills: string[];
    targetTitles: string[];
  } | null;
  settings: {
    notifyEmail: boolean;
    notifyInApp: boolean;
    notifyMatchAlerts: boolean;
    notifyAppUpdates: boolean;
    preferredLanguage: string;
    theme: string;
    defaultWorkModel: string;
    defaultExperience: string;
    aiAssistEnabled: boolean;
    weeklyDigest: boolean;
  } | null;
  subscription: {
    status: string;
    billingInterval: string;
    plan: { code: string; name: string; description: string } | null;
  } | null;
};

type Plan = {
  id: string;
  code: string;
  name: string;
  description: string;
  priceMonthlyCents: number;
  maxSeats: number;
  maxApplications: number;
  maxAiRequests: number;
  features: string[];
};

const tabs = [
  { id: "account", label: "Account" },
  { id: "career", label: "Career profile" },
  { id: "preferences", label: "Preferences" },
  { id: "security", label: "Security" },
  { id: "subscription", label: "Subscription" },
  { id: "role", label: "Role & access" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function ProfilePage() {
  const [tab, setTab] = useState<TabId>("account");
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const [profileRes, plansRes] = await Promise.all([
      fetch("/api/profile"),
      fetch("/api/billing/plans"),
    ]);
    const profileData = await profileRes.json();
    const plansData = await plansRes.json();
    setUser(profileData.user);
    setPlans(plansData.plans || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function save(section: string, data: Record<string, unknown>) {
    setLoading(true);
    setStatus("");
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section, data }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setStatus(json.error || "Save failed");
      return;
    }
    setUser(json.user);
    setStatus("Saved");
  }

  async function onAccount(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await save("profile", {
      name: String(form.get("name") || ""),
      phone: String(form.get("phone") || ""),
      location: String(form.get("location") || ""),
      timezone: String(form.get("timezone") || "UTC"),
      bio: String(form.get("bio") || ""),
    });
  }

  async function onCareer(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await save("profile", {
      headline: String(form.get("headline") || ""),
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
    });
  }

  async function onPreferences(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await save("settings", {
      notifyEmail: form.get("notifyEmail") === "on",
      notifyInApp: form.get("notifyInApp") === "on",
      notifyMatchAlerts: form.get("notifyMatchAlerts") === "on",
      notifyAppUpdates: form.get("notifyAppUpdates") === "on",
      weeklyDigest: form.get("weeklyDigest") === "on",
      aiAssistEnabled: form.get("aiAssistEnabled") === "on",
      preferredLanguage: String(form.get("preferredLanguage") || "en"),
      theme: String(form.get("theme") || "dark"),
      defaultWorkModel: String(form.get("defaultWorkModel") || "any"),
      defaultExperience: String(form.get("defaultExperience") || "mid"),
    });
  }

  async function onPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    await save("password", {
      currentPassword: String(form.get("currentPassword") || ""),
      newPassword: String(form.get("newPassword") || ""),
    });
    if (status === "Saved") e.currentTarget.reset();
  }

  if (!user) {
    return <p className="text-sm text-slate-400">Loading profile...</p>;
  }

  const settings = user.settings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Profile & settings</h1>
        <p className="mt-1 text-slate-400">
          Manage your account, career details, notifications, security, and plan preview.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={
              tab === item.id
                ? "rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-3.5 py-2 text-sm font-semibold text-slate-950"
                : "rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-slate-300 hover:bg-white/10"
            }
          >
            {item.label}
          </button>
        ))}
      </div>

      {status ? <p className="text-sm text-cyan-300">{status}</p> : null}

      {tab === "account" ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Account</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onAccount}>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Name</label>
              <Input name="name" defaultValue={user.name} required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Email</label>
              <Input value={user.email} disabled />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Phone</label>
              <Input name="phone" defaultValue={user.profile?.phone || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Location</label>
              <Input name="location" defaultValue={user.profile?.location || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Timezone</label>
              <Input name="timezone" defaultValue={user.profile?.timezone || "UTC"} />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-slate-400">Bio</label>
              <Textarea name="bio" rows={4} defaultValue={user.profile?.bio || ""} />
            </div>
            <div className="md:col-span-2">
              <Button disabled={loading}>{loading ? "Saving..." : "Save account"}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {tab === "career" ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Career profile</h2>
          <p className="mt-1 text-sm text-slate-400">
            Used for matching. Full resume text is edited on the Resume page.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCareer}>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-slate-400">Headline</label>
              <Input name="headline" defaultValue={user.profile?.headline || ""} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Work model</label>
              <Select name="workModel" defaultValue={user.profile?.workModel || "any"}>
                <option value="any">Any</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Experience</label>
              <Select
                name="experienceLevel"
                defaultValue={user.profile?.experienceLevel || "mid"}
              >
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
              </Select>
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-slate-400">
                Target titles (comma-separated)
              </label>
              <Input
                name="targetTitles"
                defaultValue={(user.profile?.targetTitles || []).join(", ")}
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs text-slate-400">
                Skills (comma-separated)
              </label>
              <Input name="skills" defaultValue={(user.profile?.skills || []).join(", ")} />
            </div>
            <div className="md:col-span-2">
              <Button disabled={loading}>{loading ? "Saving..." : "Save career profile"}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {tab === "preferences" && settings ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Preferences</h2>
          <form className="mt-4 space-y-4" onSubmit={onPreferences}>
            <div className="grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["notifyEmail", "Email notifications"],
                  ["notifyInApp", "In-app notifications"],
                  ["notifyMatchAlerts", "Match alerts"],
                  ["notifyAppUpdates", "Application updates"],
                  ["weeklyDigest", "Weekly digest"],
                  ["aiAssistEnabled", "AI assist features"],
                ] as const
              ).map(([name, label]) => (
                <label
                  key={name}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 px-3 py-3 text-sm text-slate-200"
                >
                  <input
                    type="checkbox"
                    name={name}
                    defaultChecked={Boolean(settings[name])}
                    className="size-4 accent-cyan-400"
                  />
                  {label}
                </label>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Language</label>
                <Select name="preferredLanguage" defaultValue={settings.preferredLanguage}>
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Theme</label>
                <Select name="theme" defaultValue={settings.theme}>
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Default work model</label>
                <Select name="defaultWorkModel" defaultValue={settings.defaultWorkModel}>
                  <option value="any">Any</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </Select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs text-slate-400">Default experience</label>
                <Select name="defaultExperience" defaultValue={settings.defaultExperience}>
                  <option value="entry">Entry</option>
                  <option value="mid">Mid</option>
                  <option value="senior">Senior</option>
                  <option value="lead">Lead</option>
                </Select>
              </div>
            </div>
            <Button disabled={loading}>{loading ? "Saving..." : "Save preferences"}</Button>
          </form>
        </Card>
      ) : null}

      {tab === "security" ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Security</h2>
          <form className="mt-4 grid max-w-md gap-3" onSubmit={onPassword}>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">Current password</label>
              <Input name="currentPassword" type="password" required />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-slate-400">New password</label>
              <Input name="newPassword" type="password" minLength={8} required />
            </div>
            <Button disabled={loading}>{loading ? "Updating..." : "Update password"}</Button>
          </form>
        </Card>
      ) : null}

      {tab === "subscription" ? (
        <div className="space-y-4">
          <Card>
            <h2 className="text-lg font-semibold text-white">Current plan</h2>
            <p className="mt-2 text-sm text-slate-300">
              {user.subscription?.plan?.name || "Free"} ·{" "}
              <span className="capitalize">{user.subscription?.status || "active"}</span>
            </p>
            <p className="mt-2 text-xs text-amber-200/90">
              Billing checkout is planned for v2. Plans below are seeded for preview only.
            </p>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const current = user.subscription?.plan?.code === plan.code;
              return (
                <Card
                  key={plan.id}
                  className={current ? "border-cyan-400/40 bg-cyan-400/5" : undefined}
                >
                  <div className="text-xs uppercase tracking-wide text-slate-400">{plan.code}</div>
                  <h3 className="mt-1 text-lg font-semibold text-white">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    ${(plan.priceMonthlyCents / 100).toFixed(0)}
                    <span className="text-sm font-normal text-slate-400">/mo</span>
                  </p>
                  <ul className="mt-3 space-y-1 text-xs text-slate-300">
                    <li>• {plan.maxSeats} seat(s)</li>
                    <li>• {plan.maxApplications} applications / mo</li>
                    <li>• {plan.maxAiRequests} AI requests / mo</li>
                    {plan.features.map((f) => (
                      <li key={f}>• {f}</li>
                    ))}
                  </ul>
                  <Button className="mt-4 w-full" variant="secondary" disabled>
                    {current ? "Current plan" : "Coming in v2"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      ) : null}

      {tab === "role" ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Role & access</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3">
              <div className="text-xs uppercase tracking-wide text-slate-400">Your role</div>
              <div className="mt-1 text-lg font-semibold text-white">{user.roleLabel}</div>
              <p className="mt-1 text-sm text-slate-400">{ROLE_DESCRIPTIONS[user.role]}</p>
            </div>
            {user.manager ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-slate-300">
                Reports to{" "}
                <span className="font-medium text-white">{user.manager.name}</span> (
                {ROLE_LABELS[user.manager.role as Role] || user.manager.role})
              </div>
            ) : null}
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-slate-400">
                Permissions
              </div>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((p) => (
                  <span
                    key={p}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-300"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Hierarchy: Super Admin → Project Manager → Bidder / Caller / Developer. Role
              changes are managed by Super Admin or your Project Manager on the Team page.
            </p>
          </div>
        </Card>
      ) : null}
    </div>
  );
}
