"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function Home() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    } else if (role === "admin") {
      router.replace("/admin");
    } else if (role === "client") {
      router.replace("/client");
    } else {
      router.replace("/login");
    }
  }, [user, role, loading, router]);

  return (
    <div className="login-wrap">
      <p style={{ color: "#f7f3ea" }}>Loading PRATHASTU…</p>
    </div>
  );
}
