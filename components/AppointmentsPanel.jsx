"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AppointmentsPanel({ client }) {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ type: "Consultation", date: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const apptRef = collection(db, "clients", client.id, "appointments");

  async function loadAppointments() {
    const q = query(apptRef, orderBy("date", "asc"));
    const snap = await getDocs(q);
    setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { loadAppointments(); /* eslint-disable-next-line */ }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(apptRef, { ...form, status: "scheduled", createdAt: new Date().toISOString() });
      setForm({ type: "Consultation", date: "", notes: "" });
      loadAppointments();
    } finally {
      setSaving(false);
    }
  }

  async function markStatus(appt, status) {
    await updateDoc(doc(db, "clients", client.id, "appointments", appt.id), { status });
    loadAppointments();
  }

  return (
    <div>
      <div className="card">
        <h3>Schedule Appointment / Visit</h3>
        <form onSubmit={handleAdd}>
          <div className="grid-3">
            <div>
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option>Consultation</option>
                <option>Numerology Session</option>
                <option>Astrology Reading</option>
                <option>Vastu Site Visit</option>
              </select>
            </div>
            <div>
              <label>Date & Time</label>
              <input type="datetime-local" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <label>Notes</label>
          <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Schedule"}</button>
        </form>
      </div>

      <div className="card">
        <h3>All Appointments</h3>
        {appointments.length === 0 ? (
          <p className="empty-state">No appointments scheduled.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Type</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.date).toLocaleString()}</td>
                  <td>{a.type}</td>
                  <td>{a.status}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    {a.status !== "completed" && (
                      <button className="btn btn-ghost" onClick={() => markStatus(a, "completed")}>Mark Done</button>
                    )}
                    {a.status !== "cancelled" && (
                      <button className="btn btn-ghost" onClick={() => markStatus(a, "cancelled")}>Cancel</button>
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
