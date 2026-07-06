"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminLayout({ children }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      router.replace("/login");
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "admin") {
    return <div className="login-wrap"><p style={{ color: "#f7f3ea" }}>Loading…</p></div>;
  }

  const isActive = (href) => (pathname === href ? "active" : "");

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">PRATHASTU</div>
        <div className="brand-sub">AstroVastu & Numerology</div>
        <nav>
          <Link href="/admin" className={isActive("/admin")}>Dashboard</Link>
          <Link href="/admin/clients" className={isActive("/admin/clients")}>Clients</Link>
          <button onClick={signOut}>Sign out</button>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
