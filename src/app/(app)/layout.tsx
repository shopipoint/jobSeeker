import { SiteHeader } from "@/components/site-header";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <SiteHeader authed appName={process.env.NEXT_PUBLIC_APP_NAME || "JobSeeker"} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
