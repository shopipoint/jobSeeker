"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { hasAnyPermission, type Permission } from "@/lib/rbac";

export function SiteHeader({
  authed,
  dense,
  appName = "JobSeeker",
}: {
  authed?: boolean;
  dense?: boolean;
  appName?: string;
}) {
  const [canManageTeam, setCanManageTeam] = useState(false);

  useEffect(() => {
    if (!authed) return;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        const perms = (data.user?.permissions || []) as Permission[];
        setCanManageTeam(
          hasAnyPermission(
            data.user?.role || "DEVELOPER",
            ["users:view", "team:manage"],
          ) || perms.includes("users:view") || perms.includes("team:manage"),
        );
      })
      .catch(() => undefined);
  }, [authed]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b border-white/10 bg-[#070b14]/90 backdrop-blur-xl",
        dense ? "px-4" : "px-6",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href={authed ? "/dashboard" : "/"} className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 text-sm font-bold text-white">
            JS
          </span>
          <span className="text-lg font-semibold tracking-tight text-white">{appName}</span>
        </Link>
        <nav className="hidden items-center gap-1 text-sm sm:flex">
          {authed ? (
            <>
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/jobs">Jobs</NavLink>
              <NavLink href="/resume">Resume</NavLink>
              <NavLink href="/applications">Tracker</NavLink>
              <NavLink href="/copilot">Copilot</NavLink>
              <NavLink href="/profile">Profile</NavLink>
              {canManageTeam ? <NavLink href="/team">Team</NavLink> : null}
              <button
                type="button"
                className="rounded-lg px-3 py-2 text-slate-400 hover:bg-white/5 hover:text-white"
                onClick={async () => {
                  await fetch("/api/auth/logout", { method: "POST" });
                  window.location.href = "/";
                }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link className="rounded-lg px-3 py-2 text-slate-300 hover:text-white" href="/login">
                Sign in
              </Link>
              <Link
                className="rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 font-medium text-slate-950 shadow-lg shadow-violet-500/20"
                href="/register"
              >
                Try for free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      className="rounded-lg px-3 py-2 text-slate-300 hover:bg-white/5 hover:text-white"
      href={href}
    >
      {children}
    </Link>
  );
}
