"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientLayout({ children }) {
  const { user, role, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || role !== "client")) {
      router.replace("/login");
    }
  }, [user, role, loading, router]);

  if (loading || !user || role !== "client") {
    return <div className="login-wrap"><p style={{ color: "#f7f3ea" }}>Loading…</p></div>;
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">PRATHASTU</div>
        <div className="brand-sub">AstroVastu & Numerology</div>
        <nav>
          <button onClick={signOut}>Sign out</button>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
