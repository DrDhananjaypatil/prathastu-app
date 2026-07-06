"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function BillingPanel({ client }) {
  const [invoices, setInvoices] = useState([]);
  const [form, setForm] = useState({ service: "Numerology", amount: "", description: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const invRef = collection(db, "clients", client.id, "invoices");

  async function loadInvoices() {
    const q = query(invRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { loadInvoices(); /* eslint-disable-next-line */ }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(invRef, {
        ...form,
        amount: Number(form.amount),
        status: "unpaid",
        createdAt: new Date().toISOString(),
      });
      setForm({ service: "Numerology", amount: "", description: "", dueDate: "" });
      loadInvoices();
    } finally {
      setSaving(false);
    }
  }

  async function markPaid(inv) {
    await updateDoc(doc(db, "clients", client.id, "invoices", inv.id), { status: "paid", paidAt: new Date().toISOString() });
    loadInvoices();
  }

  const totalUnpaid = invoices.filter((i) => i.status === "unpaid").reduce((s, i) => s + Number(i.amount || 0), 0);

  return (
    <div>
      <div className="card">
        <h3>New Invoice</h3>
        <form onSubmit={handleAdd}>
          <div className="grid-3">
            <div>
              <label>Service</label>
              <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })}>
                <option>Numerology</option>
                <option>Astrology</option>
                <option>Vastu Shastra</option>
                <option>Consultation</option>
              </select>
            </div>
            <div>
              <label>Amount (₹)</label>
              <input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div>
              <label>Due Date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
          <label>Description</label>
          <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Create Invoice"}</button>
        </form>
      </div>

      <div className="card">
        <div className="card-title-row">
          <h3>Invoices</h3>
          <span style={{ fontWeight: 600 }}>Outstanding: ₹{totalUnpaid}</span>
        </div>
        {invoices.length === 0 ? (
          <p className="empty-state">No invoices yet.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Service</th><th>Amount</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td>{new Date(inv.createdAt).toLocaleDateString()}</td>
                  <td>{inv.service}</td>
                  <td>₹{inv.amount}</td>
                  <td><span className={`badge ${inv.status === "paid" ? "badge-paid" : "badge-unpaid"}`}>{inv.status}</span></td>
                  <td>
                    {inv.status === "unpaid" && (
                      <button className="btn btn-ghost" onClick={() => markPaid(inv)}>Mark Paid</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
