"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { VASTU_CASE_TYPES, getCaseTypeById } from "@/lib/vastuCaseTypes";

const emptyProfile = { propertyType: "", address: "", facingDirection: "", plotShape: "", floors: "", constructionStage: "" };

export default function VastuPanel({ client }) {
  const [profile, setProfile] = useState(emptyProfile);
  const [savingProfile, setSavingProfile] = useState(false);
  const [visits, setVisits] = useState([]);
  const [caseTypeId, setCaseTypeId] = useState(VASTU_CASE_TYPES[0].id);
  const [visitDate, setVisitDate] = useState("");
  const [notes, setNotes] = useState({});
  const [savingVisit, setSavingVisit] = useState(false);

  const profileRef = doc(db, "clients", client.id, "vastuProfile", "main");
  const visitsRef = collection(db, "clients", client.id, "vastuVisits");

  async function loadProfile() {
    const snap = await getDoc(profileRef);
    if (snap.exists()) setProfile(snap.data());
  }

  async function loadVisits() {
    const q = query(visitsRef, orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setVisits(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  }

  useEffect(() => { loadProfile(); loadVisits(); /* eslint-disable-next-line */ }, []);

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await setDoc(profileRef, profile);
    } finally {
      setSavingProfile(false);
    }
  }

  const currentCase = getCaseTypeById(caseTypeId);

  async function saveVisit(e) {
    e.preventDefault();
    setSavingVisit(true);
    try {
      await addDoc(visitsRef, {
        caseTypeId,
        caseLabel: currentCase.label,
        visitDate,
        notes,
        createdAt: new Date().toISOString(),
        published: false,
      });
      setNotes({});
      setVisitDate("");
      loadVisits();
    } finally {
      setSavingVisit(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Property Profile</h3>
        <form onSubmit={saveProfile}>
          <div className="grid-3">
            <div>
              <label>Property Type</label>
              <select value={profile.propertyType} onChange={(e) => setProfile({ ...profile, propertyType: e.target.value })}>
                <option value="">Select</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Plot only</option>
              </select>
            </div>
            <div>
              <label>Facing Direction</label>
              <select value={profile.facingDirection} onChange={(e) => setProfile({ ...profile, facingDirection: e.target.value })}>
                <option value="">Select</option>
                {["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"].map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Plot Shape</label>
              <input value={profile.plotShape} onChange={(e) => setProfile({ ...profile, plotShape: e.target.value })} />
            </div>
          </div>
          <div className="grid-3">
            <div>
              <label>Floors</label>
              <input value={profile.floors} onChange={(e) => setProfile({ ...profile, floors: e.target.value })} />
            </div>
            <div>
              <label>Construction Stage</label>
              <select value={profile.constructionStage} onChange={(e) => setProfile({ ...profile, constructionStage: e.target.value })}>
                <option value="">Select</option>
                <option>Planning</option>
                <option>Under construction</option>
                <option>Built</option>
                <option>Renovation</option>
              </select>
            </div>
            <div>
              <label>Address</label>
              <input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={savingProfile}>{savingProfile ? "Saving…" : "Save Profile"}</button>
        </form>
      </div>

      <div className="card">
        <h3>New Site Visit</h3>
        <form onSubmit={saveVisit}>
          <label>Visit Case Type</label>
          <select value={caseTypeId} onChange={(e) => { setCaseTypeId(e.target.value); setNotes({}); }}>
            {VASTU_CASE_TYPES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <label>Visit Date</label>
          <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)} required />
          {currentCase.promptFields.map((field) => (
            <div key={field}>
              <label>{field}</label>
              <textarea
                rows={2}
                value={notes[field] || ""}
                onChange={(e) => setNotes({ ...notes, [field]: e.target.value })}
              />
            </div>
          ))}
          <button className="btn btn-primary" disabled={savingVisit}>{savingVisit ? "Saving…" : "Save Visit Report"}</button>
        </form>
      </div>

      <div className="card">
        <h3>Visit History</h3>
        {visits.length === 0 ? (
          <p className="empty-state">No visits recorded yet.</p>
        ) : (
          <table>
            <thead><tr><th>Date</th><th>Case Type</th></tr></thead>
            <tbody>
              {visits.map((v) => (
                <tr key={v.id}>
                  <td>{v.visitDate}</td>
                  <td>{v.caseLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
