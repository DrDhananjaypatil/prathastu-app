"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, collectionGroup, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ clients: 0, unpaidInvoices: 0, revenueThisMonth: 0, upcomingAppointments: 0 });
  const [recentClients, setRecentClients] = useState([]);

  useEffect(() => {
    async function load() {
      const clientsSnap = await getDocs(collection(db, "clients"));
      const clients = clientsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setRecentClients(clients.slice(-5).reverse());

      let unpaid = 0;
      let revenue = 0;
      const now = new Date();
      try {
        const invSnap = await getDocs(collectionGroup(db, "invoices"));
        invSnap.forEach((d) => {
          const inv = d.data();
          if (inv.status === "unpaid") unpaid += 1;
          if (inv.status === "paid" && inv.createdAt) {
            const created = new Date(inv.createdAt);
            if (created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear()) {
              revenue += Number(inv.amount || 0);
            }
          }
        });
      } catch (e) {
        // collectionGroup query may need an index on first run — safe to ignore initially
      }

      let upcoming = 0;
      try {
        const apptSnap = await getDocs(collectionGroup(db, "appointments"));
        apptSnap.forEach((d) => {
          const a = d.data();
          if (a.date && new Date(a.date) >= now) upcoming += 1;
        });
      } catch (e) {}

      setStats({ clients: clients.length, unpaidInvoices: unpaid, revenueThisMonth: revenue, upcomingAppointments: upcoming });
    }
    load();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="number-cell">
          <div className="value">{stats.clients}</div>
          <div className="label">Total Clients</div>
        </div>
        <div className="number-cell">
          <div className="value">₹{stats.revenueThisMonth}</div>
          <div className="label">Revenue This Month</div>
        </div>
        <div className="number-cell">
          <div className="value">{stats.unpaidInvoices}</div>
          <div className="label">Unpaid Invoices</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h2>Recently Added Clients</h2>
          <Link href="/admin/clients" className="btn btn-ghost">View all</Link>
        </div>
        {recentClients.length === 0 ? (
          <p className="empty-state">No clients yet. Add your first client to get started.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>City</th></tr>
            </thead>
            <tbody>
              {recentClients.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/admin/clients/${c.id}`}>{c.firstName} {c.lastName}</Link></td>
                  <td>{c.mobile}</td>
                  <td>{c.city}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
