"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { LANGUAGES } from "@/lib/translations";

const PLANET_ORDER = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];

export default function AstrologyPanel({ client }) {
  const [form, setForm] = useState({
    dob: client.dob || "",
    timeOfBirth: client.timeOfBirth || "",
    latitude: "",
    longitude: "",
    tzOffsetHours: "5.5",
  });
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reportsRef = collection(db, "clients", client.id, "astrologyCharts");

  async function loadReports() {
    const q = query(reportsRef, orderBy("generatedAt", "desc"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setReports(list);
    if (list.length && !activeReport) setActiveReport(list[0]);
  }

  useEffect(() => { loadReports(); /* eslint-disable-next-line */ }, []);

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.dob || !form.latitude || !form.longitude) {
      setError("Date of birth, latitude, and longitude are all required for an accurate chart.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/astrology-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Chart calculation failed");
      const result = {
        inputs: form,
        chart: json.chart,
        generatedAt: new Date().toISOString(),
        published: false,
      };
      const docRef = await addDoc(reportsRef, result);
      await loadReports();
      setActiveReport({ id: docRef.id, ...result });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(report) {
    await updateDoc(doc(db, "clients", client.id, "astrologyCharts", report.id), {
      published: !report.published,
    });
    loadReports();
  }

  return (
    <div>
      <div className="card">
        <h3>Generate Vedic Birth Chart</h3>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          Uses real astronomical calculations (not approximated tables) for planetary positions, Ascendant,
          Nakshatra, and the Vimshottari Dasha timeline. Latitude/longitude of the birth place are required for
          an accurate Ascendant and house placement — look them up from Google Maps if not known exactly.
        </p>
        <form onSubmit={handleGenerate}>
          <div className="grid-3">
            <div>
              <label>Date of Birth</label>
              <input type="date" required value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
            </div>
            <div>
              <label>Time of Birth</label>
              <input type="time" required value={form.timeOfBirth} onChange={(e) => setForm({ ...form, timeOfBirth: e.target.value })} />
            </div>
            <div>
              <label>Timezone Offset (hours, IST = 5.5)</label>
              <input value={form.tzOffsetHours} onChange={(e) => setForm({ ...form, tzOffsetHours: e.target.value })} />
            </div>
          </div>
          <div className="grid-2">
            <div>
              <label>Birth Place Latitude (decimal degrees)</label>
              <input required placeholder="e.g. 18.5204" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
            </div>
            <div>
              <label>Birth Place Longitude (decimal degrees)</label>
              <input required placeholder="e.g. 73.8567" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
            </div>
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
          <button className="btn btn-primary" disabled={saving}>{saving ? "Calculating chart…" : "Generate Birth Chart"}</button>
        </form>
      </div>

      {reports.length > 0 && (
        <div className="card">
          <h3>Chart History</h3>
          <table>
            <thead><tr><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.generatedAt).toLocaleString()}</td>
                  <td><span className={`badge ${r.published ? "badge-paid" : "badge-unpaid"}`}>{r.published ? "Published" : "Draft"}</span></td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => setActiveReport(r)}>View</button>
                    <button className="btn btn-secondary" onClick={() => togglePublish(r)}>{r.published ? "Unpublish" : "Publish"}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport && <AstrologyReportView key={activeReport.id} report={activeReport} client={client} clientId={client.id} />}
    </div>
  );
}

function AstrologyReportView({ report, client, clientId }) {
  const { chart } = report;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfLang, setPdfLang] = useState("en");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReports, setAiReports] = useState(report.aiReports || {});

  async function handleGenerateAiStudy() {
    setAiBusy(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "astrology",
          language: pdfLang,
          data: {
            fullName: [client.firstName, client.lastName].filter(Boolean).join(" "),
            ascendantRashi: chart.ascendant?.rashi.name,
            moonRashi: chart.planets.Moon.rashi.name,
            moonNakshatra: chart.moonNakshatra.name,
            moonPada: chart.moonNakshatra.pada,
            planetRashis: Object.fromEntries(PLANET_ORDER.map((p) => [p, chart.planets[p].rashi.name])),
            planetHouses: chart.houses,
            currentDasha: chart.dasha.find((d) => new Date(d.end) > new Date()),
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      const updated = { ...aiReports, [pdfLang]: json.text };
      setAiReports(updated);
      if (clientId && report.id) {
        await updateDoc(doc(db, "clients", clientId, "astrologyCharts", report.id), { aiReports: updated });
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 style={{ margin: 0 }}>Vedic Birth Chart</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
            {Object.entries(LANGUAGES).map(([code, l]) => (
              <option key={code} value={code}>{l.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <NumberCell label="Ascendant (Lagna)" value={chart.ascendant?.rashi.name.split(" ")[0] || "—"} />
        <NumberCell label="Moon Sign (Rashi)" value={chart.planets.Moon.rashi.name.split(" ")[0]} />
        <NumberCell label="Nakshatra" value={`${chart.moonNakshatra.name} — Pada ${chart.moonNakshatra.pada}`} />
      </div>

      <h3>Planetary Positions (Sidereal / Vedic)</h3>
      <table>
        <thead><tr><th>Planet</th><th>Rashi (Sign)</th><th>Degree</th><th>House</th></tr></thead>
        <tbody>
          {PLANET_ORDER.map((p) => (
            <tr key={p}>
              <td>{p}</td>
              <td>{chart.planets[p].rashi.name}</td>
              <td>{chart.planets[p].rashi.degree.toFixed(2)}°</td>
              <td>{chart.houses[p] || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={{ marginTop: 16 }}>Vimshottari Mahadasha Timeline</h3>
      <table>
        <thead><tr><th>Period</th><th>Planet</th><th>Duration</th></tr></thead>
        <tbody>
          {chart.dasha.map((d, i) => (
            <tr key={i}>
              <td>{d.start} – {d.end}</td>
              <td>{d.lord}</td>
              <td>{d.years} yrs</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="card" style={{ background: "var(--parchment)", marginTop: 16 }}>
        <div className="card-title-row">
          <h3 style={{ margin: 0 }}>AI-Generated Detailed Study ({LANGUAGES[pdfLang].label})</h3>
          <button className="btn btn-primary" onClick={handleGenerateAiStudy} disabled={aiBusy}>
            {aiBusy ? "Writing…" : aiReports[pdfLang] ? "Regenerate" : "Generate AI Detailed Study"}
          </button>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          Interprets the Ascendant, Moon sign, Nakshatra, house placements, and current Dasha into a narrative
          reading, written directly in the selected language.
        </p>
        {aiError && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{aiError}</p>}
        {aiReports[pdfLang] && (
          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: 10, lineHeight: 1.6 }}>
            {aiReports[pdfLang]}
          </div>
        )}
      </div>

      <p style={{ fontSize: "0.78rem", color: "#999", marginTop: 16 }}>
        Ayanamsa used: Lahiri, {chart.ayanamsa.toFixed(4)}°. House system: Whole Sign.
      </p>
    </div>
  );
}

function NumberCell({ label, value }) {
  return (
    <div className="number-cell">
      <div className="value" style={{ fontSize: "1.3rem" }}>{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}
