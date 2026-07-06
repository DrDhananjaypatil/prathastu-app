"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientPortal() {
  const { clientId } = useAuth();
  const [client, setClient] = useState(null);
  const [reports, setReports] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (!clientId) return;
    async function load() {
      const snap = await getDoc(doc(db, "clients", clientId));
      if (snap.exists()) setClient({ id: snap.id, ...snap.data() });

      const repSnap = await getDocs(
        query(collection(db, "clients", clientId, "numerologyReports"), where("published", "==", true))
      );
      setReports(repSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const invSnap = await getDocs(
        query(collection(db, "clients", clientId, "invoices"), orderBy("createdAt", "desc"))
      );
      setInvoices(invSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

      const apptSnap = await getDocs(
        query(collection(db, "clients", clientId, "appointments"), orderBy("date", "asc"))
      );
      setAppointments(apptSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    load();
  }, [clientId]);

  if (!client) return <p>Loading your dashboard…</p>;

  const outstanding = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <div>
      <h1>Welcome, {client.firstName}</h1>

      <div className="card">
        <h3>Your Reports</h3>
        {reports.length === 0 ? (
          <p className="empty-state">No reports have been shared yet.</p>
        ) : (
          reports.map((r) => (
            <div key={r.id} style={{ borderBottom: "1px solid var(--line)", padding: "10px 0" }}>
              <strong>{r.system} Numerology Report</strong> — {new Date(r.generatedAt).toLocaleDateString()}
              <div className="grid-3" style={{ marginTop: 10 }}>
                <MiniStat label="Name Number" value={r.nameNumber.reduced} />
                <MiniStat label="Life Path" value={r.lifePathNumber.reduced} />
                <MiniStat label="Birth Number" value={r.birthNumber.reduced} />
              </div>
            </div>
          ))
        )}
      </div>

      <div className="card">
        <h3>Upcoming Appointments</h3>
        {appointments.filter((a) => a.status === "scheduled").length === 0 ? (
          <p className="empty-state">No upcoming appointments.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Type</th></tr></thead>
            <tbody>
              {appointments.filter((a) => a.status === "scheduled").map((a) => (
                <tr key={a.id}><td>{new Date(a.date).toLocaleString()}</td><td>{a.type}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="card">
        <div className="card-title-row">
          <h3>Billing</h3>
          <span style={{ fontWeight: 600 }}>Outstanding: ₹{outstanding}</span>
        </div>
        {invoices.length === 0 ? (
          <p className="empty-state">No invoices yet.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Service</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>{inv.service}</td>
                  <td>₹{inv.amount}</td>
                  <td><span className={`badge ${inv.status === "paid" ? "badge-paid" : "badge-unpaid"}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="number-cell">
      <div className="value" style={{ fontSize: "1.6rem" }}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
