"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import NumerologyPanel from "@/components/NumerologyPanel";
import VastuPanel from "@/components/VastuPanel";
import BillingPanel from "@/components/BillingPanel";
import AppointmentsPanel from "@/components/AppointmentsPanel";
import AstrologyPanel from "@/components/AstrologyPanel";

const TABS = ["Overview", "Numerology", "Vastu Shastra", "Astrology", "Billing", "Appointments"];

export default function ClientDetailPage() {
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [portalMsg, setPortalMsg] = useState("");
  const [creatingPortal, setCreatingPortal] = useState(false);
  const [tempPassword, setTempPassword] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");

  async function loadClient() {
    const snap = await getDoc(doc(db, "clients", id));
    if (snap.exists()) {
      const data = { id: snap.id, ...snap.data() };
      setClient(data);
      setEditForm({
        firstName: data.firstName || "",
        middleName: data.middleName || "",
        lastName: data.lastName || "",
        mobile: data.mobile || "",
        email: data.email || "",
        gender: data.gender || "",
        city: data.city || "",
        dob: data.dob || "",
        timeOfBirth: data.timeOfBirth || "",
        placeOfBirth: data.placeOfBirth || "",
        areaOfStruggle: data.areaOfStruggle || [],
      });
    }
  }

  useEffect(() => { loadClient(); /* eslint-disable-next-line */ }, [id]);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    try {
      await updateDoc(doc(db, "clients", id), editForm);
      await loadClient();
      setProfileMsg("Profile updated.");
    } catch (err) {
      setProfileMsg("Could not save: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function createPortalLogin() {
    if (!client?.email) {
      setPortalMsg("Add an email address for this client first (use the form above).");
      return;
    }
    setCreatingPortal(true);
    setPortalMsg("");
    try {
      // NOTE: this creates the account under the currently-loaded Firebase app instance.
      // In production, do this from a secure server/Cloud Function using the Admin SDK
      // so it doesn't sign the admin out. Fine for getting Phase 1 working end-to-end.
      const tempPass = Math.random().toString(36).slice(-8) + "A1!";
      const cred = await createUserWithEmailAndPassword(auth, client.email, tempPass);
      await setDoc(doc(db, "users", cred.user.uid), {
        role: "client",
        clientId: client.id,
        email: client.email,
        createdAt: new Date().toISOString(),
      });
      setTempPassword(tempPass);
      setPortalMsg("Portal login created. Share these credentials with your client securely:");
    } catch (err) {
      setPortalMsg("Could not create login: " + err.message);
    } finally {
      setCreatingPortal(false);
    }
  }

  if (!client || !editForm) return <p>Loading client…</p>;

  return (
    <div>
      <h1>{client.firstName} {client.lastName}</h1>
      <p style={{ color: "#666", marginBottom: 20 }}>{client.mobile} · {client.email || "no email"} · {client.city}</p>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div>
          <div className="card">
            <h3>Edit Client Profile</h3>
            <p style={{ fontSize: "0.85rem", color: "#666" }}>
              The client can't edit their own details from the portal — update them here on their behalf
              (e.g. adding or correcting an email address).
            </p>
            <form onSubmit={saveProfile}>
              <div className="grid-3">
                <div>
                  <label>First Name</label>
                  <input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} required />
                </div>
                <div>
                  <label>Middle Name</label>
                  <input value={editForm.middleName} onChange={(e) => setEditForm({ ...editForm, middleName: e.target.value })} />
                </div>
                <div>
                  <label>Last Name</label>
                  <input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="grid-3">
                <div>
                  <label>Mobile Number</label>
                  <input value={editForm.mobile} onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })} required />
                </div>
                <div>
                  <label>Email</label>
                  <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
                <div>
                  <label>Gender</label>
                  <select value={editForm.gender} onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}>
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
                  <input type="date" value={editForm.dob} onChange={(e) => setEditForm({ ...editForm, dob: e.target.value })} />
                </div>
                <div>
                  <label>Time of Birth</label>
                  <input type="time" value={editForm.timeOfBirth} onChange={(e) => setEditForm({ ...editForm, timeOfBirth: e.target.value })} />
                </div>
                <div>
                  <label>Place of Birth</label>
                  <input value={editForm.placeOfBirth} onChange={(e) => setEditForm({ ...editForm, placeOfBirth: e.target.value })} />
                </div>
              </div>
              <div>
                <label>City</label>
                <input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
              </div>
              <div>
                <label>Area of Struggle (drives which affirmations appear in their report)</label>
                <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 14 }}>
                  {["Health", "Relationship", "Career", "Money", "Job"].map((area) => (
                    <label key={area} style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 400 }}>
                      <input
                        type="checkbox"
                        style={{ width: "auto", marginBottom: 0 }}
                        checked={editForm.areaOfStruggle.includes(area)}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...editForm.areaOfStruggle, area]
                            : editForm.areaOfStruggle.filter((a) => a !== area);
                          setEditForm({ ...editForm, areaOfStruggle: next });
                        }}
                      />
                      {area}
                    </label>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save Profile"}</button>
              {profileMsg && <p style={{ marginTop: 8 }}>{profileMsg}</p>}
            </form>
          </div>

          <div className="card">
            <h3>Client Portal Access</h3>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Create a login so this client can view their own published reports, appointments, and invoices.
            </p>
            <button className="btn btn-secondary" onClick={createPortalLogin} disabled={creatingPortal}>
              {creatingPortal ? "Creating…" : "Create Portal Login"}
            </button>
            {portalMsg && <p style={{ marginTop: 10 }}>{portalMsg}</p>}
            {tempPassword && (
              <p style={{ fontFamily: "monospace", background: "#f7f3ea", padding: 10, borderRadius: 6 }}>
                Email: {client.email} <br /> Temporary password: {tempPassword}
              </p>
            )}
          </div>
        </div>
      )}

      {tab === "Numerology" && <NumerologyPanel client={client} />}
      {tab === "Vastu Shastra" && <VastuPanel client={client} />}
      {tab === "Astrology" && <AstrologyPanel client={client} />}
      {tab === "Billing" && <BillingPanel client={client} />}
      {tab === "Appointments" && <AppointmentsPanel client={client} />}
    </div>
  );
}

