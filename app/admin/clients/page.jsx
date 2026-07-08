"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";

const emptyForm = {
  firstName: "", middleName: "", lastName: "", mobile: "", email: "",
  gender: "", city: "", dob: "", timeOfBirth: "", placeOfBirth: "",
  areaOfStruggle: [],
};

const STRUGGLE_AREAS = ["Health", "Relationship", "Career", "Money", "Job"];

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadClients() {
    const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { loadClients(); }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleAddClient(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, "clients"), {
        ...form,
        createdAt: new Date().toISOString(),
      });
      setForm(emptyForm);
      setShowForm(false);
      loadClients();
    } finally {
      setSaving(false);
    }
  }

  const filtered = clients.filter((c) => {
    const term = search.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(term) ||
      (c.mobile || "").includes(term)
    );
  });

  return (
    <div>
      <div className="card-title-row">
        <h1>Clients</h1>
        <button className="btn btn-primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add Client"}
        </button>
      </div>

      {showForm && (
        <form className="card" onSubmit={handleAddClient}>
          <h3>New Client</h3>
          <div className="grid-3">
            <div>
              <label>First Name *</label>
              <input required value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} />
            </div>
            <div>
              <label>Middle Name</label>
              <input value={form.middleName} onChange={(e) => updateField("middleName", e.target.value)} />
            </div>
            <div>
              <label>Last Name *</label>
              <input required value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} />
            </div>
          </div>
          <div className="grid-3">
            <div>
              <label>Mobile Number *</label>
              <input required value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
            </div>
            <div>
              <label>Gender</label>
              <select value={form.gender} onChange={(e) => updateField("gender", e.target.value)}>
                <option value="">Select</option>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className="grid-3">
            <div>
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => updateField("dob", e.target.value)} />
            </div>
            <div>
              <label>Time of Birth</label>
              <input type="time" value={form.timeOfBirth} onChange={(e) => updateField("timeOfBirth", e.target.value)} />
            </div>
            <div>
              <label>Place of Birth</label>
              <input value={form.placeOfBirth} onChange={(e) => updateField("placeOfBirth", e.target.value)} />
            </div>
          </div>
          <div>
            <label>City</label>
            <input value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          </div>
          <div>
            <label>Area of Struggle (drives which affirmations appear in their report)</label>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
              {STRUGGLE_AREAS.map((area) => (
                <label key={area} style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 400 }}>
                  <input
                    type="checkbox"
                    style={{ width: "auto", marginBottom: 0 }}
                    checked={form.areaOfStruggle.includes(area)}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.areaOfStruggle, area]
                        : form.areaOfStruggle.filter((a) => a !== area);
                      updateField("areaOfStruggle", next);
                    }}
                  />
                  {area}
                </label>
              ))}
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Saving…" : "Save Client"}</button>
        </form>
      )}

      <div className="card">
        <input
          placeholder="Search by name or mobile…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        {filtered.length === 0 ? (
          <p className="empty-state">No clients found.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Mobile</th><th>City</th><th>Added</th></tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/admin/clients/${c.id}`}>{c.firstName} {c.lastName}</Link></td>
                  <td>{c.mobile}</td>
                  <td>{c.city}</td>
                  <td>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
