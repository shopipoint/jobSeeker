export const ROLES = [
  "SUPER_ADMIN",
  "PROJECT_MANAGER",
  "BIDDER",
  "CALLER",
  "DEVELOPER",
] as const;

export type Role = (typeof ROLES)[number];

/** Higher number = more privilege. BIDDER/CALLER/DEVELOPER share the same rank. */
export const ROLE_RANK: Record<Role, number> = {
  SUPER_ADMIN: 100,
  PROJECT_MANAGER: 50,
  BIDDER: 10,
  CALLER: 10,
  DEVELOPER: 10,
};

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  PROJECT_MANAGER: "Project Manager",
  BIDDER: "Bidder",
  CALLER: "Caller",
  DEVELOPER: "Developer",
};

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  SUPER_ADMIN: "Full system access: users, roles, plans, and all modules.",
  PROJECT_MANAGER: "Owns team delivery; assigns Bidder / Caller / Developer seats.",
  BIDDER: "Sources and submits job applications / bids.",
  CALLER: "Owns outreach, follow-ups, and pipeline calling.",
  DEVELOPER: "Owns resume/AI tooling and technical job matching.",
};

export const PERMISSIONS = [
  "jobs:view",
  "jobs:apply",
  "applications:view_own",
  "applications:view_team",
  "applications:manage_own",
  "applications:manage_team",
  "resume:view",
  "resume:edit",
  "copilot:use",
  "profile:edit_own",
  "team:view",
  "team:manage",
  "users:view",
  "users:manage",
  "roles:assign",
  "admin:settings",
  "billing:view",
  "billing:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SUPER_ADMIN: [...PERMISSIONS],
  PROJECT_MANAGER: [
    "jobs:view",
    "jobs:apply",
    "applications:view_own",
    "applications:view_team",
    "applications:manage_own",
    "applications:manage_team",
    "resume:view",
    "resume:edit",
    "copilot:use",
    "profile:edit_own",
    "team:view",
    "team:manage",
    "users:view",
    "roles:assign",
    "billing:view",
  ],
  BIDDER: [
    "jobs:view",
    "jobs:apply",
    "applications:view_own",
    "applications:manage_own",
    "resume:view",
    "resume:edit",
    "copilot:use",
    "profile:edit_own",
    "billing:view",
  ],
  CALLER: [
    "jobs:view",
    "applications:view_own",
    "applications:view_team",
    "applications:manage_own",
    "applications:manage_team",
    "resume:view",
    "copilot:use",
    "profile:edit_own",
    "team:view",
    "billing:view",
  ],
  DEVELOPER: [
    "jobs:view",
    "applications:view_own",
    "applications:manage_own",
    "resume:view",
    "resume:edit",
    "copilot:use",
    "profile:edit_own",
    "billing:view",
  ],
};

export function isRole(value: string): value is Role {
  return (ROLES as readonly string[]).includes(value);
}

export function normalizeRole(value?: string | null): Role {
  if (value && isRole(value)) return value;
  return "DEVELOPER";
}

export function hasPermission(role: string, permission: Permission): boolean {
  const normalized = normalizeRole(role);
  return ROLE_PERMISSIONS[normalized].includes(permission);
}

export function hasAnyPermission(role: string, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function canAssignRole(actorRole: string, targetRole: string): boolean {
  const actor = normalizeRole(actorRole);
  const target = normalizeRole(targetRole);

  if (actor === "SUPER_ADMIN") return true;
  if (actor === "PROJECT_MANAGER") {
    return target === "BIDDER" || target === "CALLER" || target === "DEVELOPER";
  }
  return false;
}

export function assignableRolesFor(actorRole: string): Role[] {
  const actor = normalizeRole(actorRole);
  if (actor === "SUPER_ADMIN") return [...ROLES];
  if (actor === "PROJECT_MANAGER") return ["BIDDER", "CALLER", "DEVELOPER"];
  return [];
}

export function roleRank(role: string): number {
  return ROLE_RANK[normalizeRole(role)];
}

export function permissionsFor(role: string): Permission[] {
  return [...ROLE_PERMISSIONS[normalizeRole(role)]];
}
