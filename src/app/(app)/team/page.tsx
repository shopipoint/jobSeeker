"use client";

import { FormEvent, useEffect, useState } from "react";
import { Button, Card, Input, Select } from "@/components/ui";
import { ROLE_LABELS, type Role } from "@/lib/rbac";

type UserRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  managerId: string | null;
  manager?: { id: string; name: string; email: string } | null;
  plan: string;
};

export default function TeamAdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [assignableRoles, setAssignableRoles] = useState<Role[]>([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [forbidden, setForbidden] = useState(false);

  async function load() {
    setError("");
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (res.status === 403 || res.status === 401) {
      setForbidden(true);
      setError(data.error || "You do not have access to team management.");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Failed to load users");
      return;
    }
    setForbidden(false);
    setUsers(data.users || []);
    setAssignableRoles(data.assignableRoles || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function updateUser(userId: string, patch: Record<string, unknown>) {
    setStatus("");
    const res = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, ...patch }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Update failed");
      return;
    }
    setStatus("Updated");
    load();
  }

  async function createUser(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("");
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Create failed");
      return;
    }
    setStatus(`Created ${data.user.email}`);
    e.currentTarget.reset();
    load();
  }

  if (forbidden) {
    return (
      <Card>
        <h1 className="text-xl font-semibold text-white">Team access restricted</h1>
        <p className="mt-2 text-sm text-slate-400">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Team & roles</h1>
        <p className="mt-1 text-slate-400">
          Super Admin manages everyone. Project Managers assign Bidder / Caller / Developer.
        </p>
      </div>

      {status ? <p className="text-sm text-cyan-300">{status}</p> : null}
      {error ? <p className="text-sm text-rose-300">{error}</p> : null}

      {assignableRoles.length > 0 ? (
        <Card>
          <h2 className="text-lg font-semibold text-white">Invite teammate</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-5" onSubmit={createUser}>
            <Input name="name" placeholder="Name" required />
            <Input name="email" type="email" placeholder="Email" required />
            <Input name="password" type="password" placeholder="Temp password" minLength={8} required />
            <Select name="role" defaultValue={assignableRoles[0]}>
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {ROLE_LABELS[role]}
                </option>
              ))}
            </Select>
            <Button type="submit">Create user</Button>
          </form>
        </Card>
      ) : null}

      <div className="grid gap-3">
        {users.map((user) => (
          <Card key={user.id} className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-semibold text-white">{user.name}</div>
              <div className="text-sm text-slate-400">
                {user.email}
                {user.manager ? ` · reports to ${user.manager.name}` : ""}
                {` · ${user.plan}`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                className="w-44"
                value={user.role}
                disabled={assignableRoles.length === 0}
                onChange={(e) => updateUser(user.id, { role: e.target.value })}
              >
                {(assignableRoles.includes(user.role as Role)
                  ? assignableRoles
                  : [user.role as Role, ...assignableRoles]
                ).map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role] || role}
                  </option>
                ))}
              </Select>
              <Button
                variant="secondary"
                onClick={() => updateUser(user.id, { isActive: !user.isActive })}
              >
                {user.isActive ? "Disable" : "Enable"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
