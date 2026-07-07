"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, orderBy, query, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  generateNumerologyReport,
  calcPersonalYearTimeline,
  calcDashaTimelineFull,
  calcMobileGrid,
  calcNameNumber,
  calcMobileAdjacentPairs,
  calcUniqueDigitCombinations,
  suggestCompatibleNames,
  computeTwoPersonCompatibility,
} from "@/lib/numerology";
import {
  MISSING_NUMBER_REMEDIES,
  LUCKY_COLORS_BY_MOOLANK,
  PERSONAL_YEAR_MEANINGS,
  DASHA_MEANINGS,
  PLANET_BY_NUMBER,
  NUMBER_MEANINGS,
  MOOLANK_COMPATIBILITY,
  COMPOUND_NUMBER_TEXT,
  LETTER_MEANINGS,
  classifyPair,
  combinationMeaning,
  getCompatibility,
} from "@/lib/numerologyKnowledge";
import { exportBirthReportPDF, exportMobileReportPDF } from "@/lib/pdfExport";
import { LANGUAGES } from "@/lib/translations";

export default function NumerologyPanel({ client }) {
  const [section, setSection] = useState("birth"); // "birth" | "mobile" | "compatibility"
  return (
    <div>
      <div className="tabs">
        <button className={`tab ${section === "birth" ? "active" : ""}`} onClick={() => setSection("birth")}>
          Numerology — By Name (Bhagyank &amp; Moolank)
        </button>
        <button className={`tab ${section === "mobile" ? "active" : ""}`} onClick={() => setSection("mobile")}>
          Numerology — By Mobile Number
        </button>
        <button className={`tab ${section === "compatibility" ? "active" : ""}`} onClick={() => setSection("compatibility")}>
          Two-Person Compatibility
        </button>
      </div>
      {section === "birth" && <BirthDetailsSection client={client} />}
      {section === "mobile" && <MobileNumberSection client={client} />}
      {section === "compatibility" && <CompatibilitySection client={client} />}
    </div>
  );
}

// ============================================================
// SECTION 1 — Numerology by Birth Details (name + DOB)
// ============================================================
function BirthDetailsSection({ client }) {
  const [system, setSystem] = useState("CHALDEAN");
  const [form, setForm] = useState({
    firstName: client.firstName || "",
    middleName: client.middleName || "",
    lastName: client.lastName || "",
    dob: client.dob || "",
    mobile: client.mobile || "",
  });
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [saving, setSaving] = useState(false);
  const [altNames, setAltNames] = useState(["", "", ""]);

  const reportsRef = collection(db, "clients", client.id, "numerologyReports");

  async function loadReports() {
    const q = query(reportsRef, orderBy("generatedAt", "desc"));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    setReports(list);
    if (list.length && !activeReport) setActiveReport(list[0]);
  }

  useEffect(() => { loadReports(); /* eslint-disable-next-line */ }, []);

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleGenerate(e) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dob) return;
    setSaving(true);
    try {
      const result = generateNumerologyReport({ ...form, system });
      const docRef = await addDoc(reportsRef, { ...result, published: false });
      await loadReports();
      setActiveReport({ id: docRef.id, ...result, published: false });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(report) {
    await updateDoc(doc(db, "clients", client.id, "numerologyReports", report.id), {
      published: !report.published,
    });
    loadReports();
  }

  return (
    <div>
      <div className="card">
        <h3>Generate Numerology Report (Name + Date of Birth)</h3>
        <form onSubmit={handleGenerate}>
          <div className="grid-3">
            <div>
              <label>First Name</label>
              <input value={form.firstName} onChange={(e) => updateField("firstName", e.target.value)} required />
            </div>
            <div>
              <label>Middle Name</label>
              <input value={form.middleName} onChange={(e) => updateField("middleName", e.target.value)} />
            </div>
            <div>
              <label>Last Name</label>
              <input value={form.lastName} onChange={(e) => updateField("lastName", e.target.value)} required />
            </div>
          </div>
          <div className="grid-3">
            <div>
              <label>Date of Birth</label>
              <input type="date" value={form.dob} onChange={(e) => updateField("dob", e.target.value)} required />
            </div>
            <div>
              <label>Mobile Number (optional, for cross-reference)</label>
              <input value={form.mobile} onChange={(e) => updateField("mobile", e.target.value)} />
            </div>
            <div>
              <label>System for this run</label>
              <select value={system} onChange={(e) => setSystem(e.target.value)}>
                <option value="CHALDEAN">Chaldean</option>
                <option value="PYTHAGOREAN">Pythagorean</option>
                <option value="VEDIC_LOSHU">Vedic / Loshu</option>
              </select>
            </div>
          </div>
          <button className="btn btn-primary" disabled={saving}>
            {saving ? "Calculating…" : "Generate Report"}
          </button>
        </form>
      </div>

      {reports.length > 0 && (
        <div className="card">
          <h3>Report History</h3>
          <table>
            <thead><tr><th>Date</th><th>System</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.generatedAt).toLocaleString()}</td>
                  <td>{r.system}</td>
                  <td>
                    <span className={`badge ${r.published ? "badge-paid" : "badge-unpaid"}`}>
                      {r.published ? "Published to client" : "Draft"}
                    </span>
                  </td>
                  <td style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-ghost" onClick={() => {
                      setActiveReport(r);
                      setTimeout(() => {
                        const el = document.getElementById("active-birth-report");
                        if (el) {
                          el.scrollIntoView({ behavior: "smooth", block: "start" });
                          el.style.transition = "background-color 0.2s";
                          el.style.backgroundColor = "#fdf3df";
                          setTimeout(() => { el.style.backgroundColor = ""; }, 600);
                        }
                      }, 50);
                    }}>View</button>
                    <button className="btn btn-secondary" onClick={() => togglePublish(r)}>
                      {r.published ? "Unpublish" : "Publish"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeReport && (
        <BirthReportView key={activeReport.id} report={activeReport} altNames={altNames} setAltNames={setAltNames} clientId={client.id} />
      )}
    </div>
  );
}

function BirthReportView({ report, altNames, setAltNames, clientId }) {
  const {
    nameNumber, firstNameNumber, lifePathNumber, birthNumber, soulUrgeNumber,
    personalityNumber, mobileNumberAnalysis, loshuGrid, system, inputs,
  } = report;

  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfLang, setPdfLang] = useState("en");
  const [autoSuggestions, setAutoSuggestions] = useState(null);
  const [suggesting, setSuggesting] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReports, setAiReports] = useState(report.aiReports || {});

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await exportBirthReportPDF(report, { lang: pdfLang, aiText: aiReports[pdfLang] });
    } finally {
      setPdfBusy(false);
    }
  }

  const moolank = birthNumber.reduced;

  async function handleGenerateAiStudy() {
    setAiBusy(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "name",
          language: pdfLang,
          data: {
            fullName: inputs.fullName,
            dob: inputs.dob,
            system,
            nameNumber: nameNumber.reduced,
            bhagyank: lifePathNumber.reduced,
            moolank,
            soulUrge: soulUrgeNumber.reduced,
            personality: personalityNumber.reduced,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      const updated = { ...aiReports, [pdfLang]: json.text };
      setAiReports(updated);
      if (clientId && report.id) {
        await updateDoc(doc(db, "clients", clientId, "numerologyReports", report.id), { aiReports: updated });
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiBusy(false);
    }
  }

  function handleAutoSuggest() {
    setSuggesting(true);
    try {
      const results = suggestCompatibleNames({
        firstName: inputs.firstName,
        middleName: inputs.middleName,
        lastName: inputs.lastName,
        system,
        moolank,
        maxResults: 8,
      });
      setAutoSuggestions(results);
    } finally {
      setSuggesting(false);
    }
  }

  const compatColors = LUCKY_COLORS_BY_MOOLANK[moolank];
  const personalYears = calcPersonalYearTimeline(inputs.dob, 5);
  const dashaPeriods = calcDashaTimelineFull(inputs.dob, 100);
  const nameCompat = getCompatibility(nameNumber.reduced, moolank);
  const firstNameCompat = firstNameNumber ? getCompatibility(firstNameNumber.reduced, moolank) : null;
  const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];

  return (
    <div className="card" id="active-birth-report">
      <div className="card-title-row">
        <h3 style={{ margin: 0 }}>Report — {system} — {inputs.fullName}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
            {Object.entries(LANGUAGES).map(([code, l]) => (
              <option key={code} value={code}>{l.label}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={pdfBusy}>
            {pdfBusy ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="card" style={{ background: "var(--parchment)" }}>
        <div className="card-title-row">
          <h3 style={{ margin: 0 }}>AI-Generated Detailed Study ({LANGUAGES[pdfLang].label})</h3>
          <button className="btn btn-primary" onClick={handleGenerateAiStudy} disabled={aiBusy}>
            {aiBusy ? "Writing…" : aiReports[pdfLang] ? "Regenerate" : "Generate AI Detailed Study"}
          </button>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          Uses your Anthropic API key to write a full narrative study — Bhagyank &amp; Moolank analysis, name
          compatibility, personality, 5-year forecast, and guidance — directly in the language selected above.
          Included automatically in the PDF once generated.
        </p>
        {aiError && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{aiError}</p>}
        {aiReports[pdfLang] && (
          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: 10, lineHeight: 1.6 }}>
            {aiReports[pdfLang]}
          </div>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <NumberCell label="Name / Destiny Number" value={nameNumber.reduced} />
        {firstNameNumber && <NumberCell label="First Name Number" value={firstNameNumber.reduced} />}
        <NumberCell label="Bhagyank (Life Path Number)" value={lifePathNumber.reduced} />
        <NumberCell label="Birth / Driver Number (Moolank)" value={birthNumber.reduced} />
        <NumberCell label="Soul Urge Number" value={soulUrgeNumber.reduced} />
        <NumberCell label="Personality Number" value={personalityNumber.reduced} />
        {mobileNumberAnalysis && <NumberCell label="Mobile Number" value={mobileNumberAnalysis.reduced} />}
      </div>

      {/* Name compatibility */}
      <div className="card" style={{ background: "var(--parchment)" }}>
        <h3 style={{ marginTop: 0 }}>Name Compatibility with Date of Birth</h3>
        {firstNameNumber && (
          <p>First Name ({firstNameNumber.reduced}) is <strong>{firstNameCompat}</strong> to your Moolank ({moolank}).</p>
        )}
        <p>Full Name ({nameNumber.reduced}) is <strong>{nameCompat}</strong> to your Moolank ({moolank}).</p>
        {(firstNameCompat === "Enemy (Anti)" || nameCompat === "Enemy (Anti)") && (
          <p style={{ color: "var(--danger)", fontSize: "0.88rem" }}>
            One or more name numbers conflict with the birth number — see the Name Correction tool below for
            alternate spelling suggestions.
          </p>
        )}
      </div>

      {/* Full Number Compatibility Table */}
      <div style={{ marginTop: 20 }}>
        <h3>Number Compatibility Table (vs. Moolank {moolank})</h3>
        <table>
          <thead><tr><th>Number</th><th>Status</th><th>Meaning</th></tr></thead>
          <tbody>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const status = getCompatibility(n, moolank);
              return (
                <tr key={n}>
                  <td>{n}</td>
                  <td>
                    <span className={`badge ${status === "Friendly" ? "badge-paid" : status === "Enemy (Anti)" ? "badge-unpaid" : ""}`}>
                      {status}
                    </span>
                  </td>
                  <td style={{ fontSize: "0.85rem" }}>{NUMBER_MEANINGS[n]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Sound & Vibration — first letter reading */}
      <div style={{ marginTop: 20 }}>
        <h3>Sound &amp; Vibration — First Letter Reading</h3>
        <p style={{ fontSize: "0.9rem" }}>
          <strong>{inputs.firstName?.[0]?.toUpperCase()}:</strong> {LETTER_MEANINGS[inputs.firstName?.[0]?.toUpperCase()] || "—"}
        </p>
      </div>

      {/* Compound number personality write-ups */}
      <div style={{ marginTop: 20 }}>
        <h3>Compound Number Personality — First Name</h3>
        <p style={{ fontSize: "0.9rem" }}>{firstNameNumber ? COMPOUND_NUMBER_TEXT[firstNameNumber.reduced] : "—"}</p>
      </div>
      <div style={{ marginTop: 20 }}>
        <h3>Compound Number Personality — Full Name</h3>
        <p style={{ fontSize: "0.9rem" }}>{COMPOUND_NUMBER_TEXT[nameNumber.reduced]}</p>
      </div>

      {mobileNumberAnalysis?.repeating?.length > 0 && (
        <p style={{ fontSize: "0.85rem", color: "var(--danger)" }}>
          Repeating mobile digits flagged: {mobileNumberAnalysis.repeating.map((r) => `${r.digit} (x${r.count})`).join(", ")}
        </p>
      )}

      {/* Loshu Grid */}
      <h3 style={{ marginTop: 20 }}>Loshu Grid</h3>
      <p style={{ fontSize: "0.82rem", color: "#666", marginBottom: 8 }}>
        Includes birth-date digits plus Driver Number ({loshuGrid.driver}) and Conductor Number ({loshuGrid.conductor}).
      </p>
      <table className="loshu-table" style={{ maxWidth: 220 }}>
        <tbody>
          {layout.map((row, i) => (
            <tr key={i}>
              {row.map((num) => (
                <td key={num} style={{ textAlign: "center", fontSize: "1.1rem", border: "1px solid var(--line)", padding: 8 }}>
                  {loshuGrid.counts[num] > 0 ? num.toString().repeat(loshuGrid.counts[num]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Missing numbers + remedies */}
      {loshuGrid.missing.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Missing Numbers &amp; Remedies</h3>
          {loshuGrid.missing.map((n) => (
            <div key={n} style={{ marginBottom: 10, borderLeft: "3px solid var(--gold, var(--saffron))", paddingLeft: 10 }}>
              <strong>Missing {n}</strong> — {MISSING_NUMBER_REMEDIES[n]}
            </div>
          ))}
        </div>
      )}

      {/* Lucky / unlucky colors */}
      {compatColors && (
        <div style={{ marginTop: 16 }}>
          <h3>Lucky &amp; Unlucky Colors (based on Moolank {moolank})</h3>
          <p><strong>Lucky:</strong> {compatColors.lucky.join(", ")}</p>
          <p><strong>Avoid:</strong> {compatColors.unlucky.join(", ")}</p>
        </div>
      )}

      {/* Personal Year table */}
      <div style={{ marginTop: 20 }}>
        <h3>Personal Year Forecast</h3>
        {personalYears.map((py) => {
          const meaning = PERSONAL_YEAR_MEANINGS[py.number];
          return (
            <div key={py.year} className="card" style={{ marginBottom: 10 }}>
              <div className="card-title-row">
                <strong>{py.year} — Personal Year {py.number}: {meaning.title}</strong>
              </div>
              <p style={{ fontSize: "0.85rem", color: "#666", marginBottom: 6 }}>{meaning.theme}</p>
              <p style={{ fontSize: "0.9rem" }}>{meaning.text}</p>
            </div>
          );
        })}
      </div>

      {/* Dasha timeline */}
      <div style={{ marginTop: 20 }}>
        <h3>Numerology Dasha (Ruling Period) Timeline</h3>
        <table>
          <thead><tr><th>Period</th><th>Number</th><th>Planet</th><th>Theme</th></tr></thead>
          <tbody>
            {dashaPeriods.map((p, i) => (
              <tr key={i}>
                <td>{p.startYear} – {p.endYear}</td>
                <td>{p.number}</td>
                <td>{PLANET_BY_NUMBER[p.number]}</td>
                <td style={{ fontSize: "0.85rem" }}>{DASHA_MEANINGS[p.number]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Name Correction Tool */}
      <div className="card" style={{ marginTop: 20, background: "var(--parchment)" }}>
        <h3 style={{ marginTop: 0 }}>Name Correction Tool</h3>
        <p style={{ fontSize: "0.85rem", color: "#666" }}>
          Automatically tries adding, doubling, or removing a letter from the first and last name (54+ combinations)
          and shows only the spellings that come out Friendly to this client's Moolank ({moolank}).
        </p>
        <button className="btn btn-primary" onClick={handleAutoSuggest} disabled={suggesting} style={{ marginBottom: 14 }}>
          {suggesting ? "Computing…" : "Auto-Suggest Compatible Spellings"}
        </button>

        {autoSuggestions && (
          autoSuggestions.length === 0 ? (
            <p style={{ fontSize: "0.85rem" }}>
              None of the single-letter variations tried came out Friendly to Moolank {moolank}. Try a more
              significant spelling change, or test a specific idea manually below.
            </p>
          ) : (
            <div style={{ marginBottom: 16 }}>
              <table>
                <thead><tr><th>Suggested Name</th><th>Change</th><th>Name Number</th><th>Validation</th></tr></thead>
                <tbody>
                  {autoSuggestions.map((s, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{s.fullName}</td>
                      <td style={{ fontSize: "0.85rem" }}>{s.changeDescription}</td>
                      <td>{s.nameNumber.reduced}</td>
                      <td style={{ fontSize: "0.82rem", color: "var(--sage)" }}>
                        Raw sum {s.nameNumber.raw} → {s.nameNumber.reduced}, Friendly to Moolank {moolank} ✓
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        <h3 style={{ fontSize: "1rem" }}>Or Test Your Own Spelling Ideas</h3>
        {[0, 1, 2].map((i) => (
          <input
            key={i}
            placeholder={`Alternate full name option ${i + 1}`}
            value={altNames[i]}
            onChange={(e) => {
              const copy = [...altNames];
              copy[i] = e.target.value;
              setAltNames(copy);
            }}
          />
        ))}
        <table>
          <thead><tr><th>Name Option</th><th>Name Number</th><th>Compatibility</th></tr></thead>
          <tbody>
            <tr>
              <td>{inputs.fullName} (current)</td>
              <td>{nameNumber.reduced}</td>
              <td>{nameCompat}</td>
            </tr>
            {altNames.filter(Boolean).map((name, i) => {
              const num = calcNameNumber(name, system);
              const compat = getCompatibility(num.reduced, moolank);
              return (
                <tr key={i}>
                  <td>{name}</td>
                  <td>{num.reduced}</td>
                  <td style={{ fontWeight: compat === "Friendly" ? 700 : 400, color: compat === "Friendly" ? "var(--sage)" : "inherit" }}>
                    {compat}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p style={{ fontSize: "0.8rem", color: "#666", marginTop: 8 }}>
          Recommend whichever option shows "Friendly" — that's the spelling most aligned with the client's Moolank.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// SECTION 2 — Numerology by Mobile Number
// ============================================================
function MobileNumberSection({ client }) {
  const [form, setForm] = useState({
    mobile: client.mobile || "",
    moolank: "",
    bhagyank: "",
    fullName: [client.firstName, client.middleName, client.lastName].filter(Boolean).join(" ") || "",
  });
  const [reports, setReports] = useState([]);
  const [activeReport, setActiveReport] = useState(null);
  const [saving, setSaving] = useState(false);

  const reportsRef = collection(db, "clients", client.id, "mobileNumerologyReports");

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
    if (!form.mobile || !form.moolank) return;
    setSaving(true);
    try {
      const grid = calcMobileGrid(form.mobile);
      const digits = form.mobile.replace(/[^0-9]/g, "").split("").map(Number).filter((d) => d !== 0);
      const uniqueDigits = [...new Set(digits)];
      const result = {
        mobile: form.mobile,
        moolank: parseInt(form.moolank, 10),
        bhagyank: form.bhagyank ? parseInt(form.bhagyank, 10) : null,
        fullName: form.fullName || null,
        grid,
        uniqueDigits,
        generatedAt: new Date().toISOString(),
        published: false,
      };
      const docRef = await addDoc(reportsRef, result);
      await loadReports();
      setActiveReport({ id: docRef.id, ...result });
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(report) {
    await updateDoc(doc(db, "clients", client.id, "mobileNumerologyReports", report.id), {
      published: !report.published,
    });
    loadReports();
  }

  return (
    <div>
      <div className="card">
        <h3>Generate Mobile Numerology Report</h3>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          This report considers the mobile number together with the client's Name, Bhagyank, and Moolank for a
          combined study, rather than the mobile digits alone.
        </p>
        <form onSubmit={handleGenerate}>
          <div className="grid-3">
            <div>
              <label>Full Name (for combined analysis)</label>
              <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div>
              <label>Mobile Number</label>
              <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </div>
            <div>
              <label>Bhagyank (Life Path Number, 1-9, optional)</label>
              <select value={form.bhagyank} onChange={(e) => setForm({ ...form, bhagyank: e.target.value })}>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-3">
            <div>
              <label>Moolank (Birth/Driver Number, 1-9) *</label>
              <select required value={form.moolank} onChange={(e) => setForm({ ...form, moolank: e.target.value })}>
                <option value="">Select</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <p style={{ fontSize: "0.8rem", color: "#666" }}>
            Tip: generate a Name-based report first — it shows both Bhagyank and Moolank at the top.
          </p>
          <button className="btn btn-primary" disabled={saving}>{saving ? "Calculating…" : "Generate Report"}</button>
        </form>
      </div>

      {reports.length > 0 && (
        <div className="card">
          <h3>Report History</h3>
          <table>
            <thead><tr><th>Date</th><th>Mobile</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{new Date(r.generatedAt).toLocaleString()}</td>
                  <td>{r.mobile}</td>
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

      {activeReport && <MobileReportView key={activeReport.id} report={activeReport} clientId={client.id} />}
    </div>
  );
}

function MobileReportView({ report, clientId }) {
  const { mobile, moolank, bhagyank, fullName, grid, uniqueDigits } = report;
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfLang, setPdfLang] = useState("en");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiReports, setAiReports] = useState(report.aiReports || {});

  async function handleDownloadPdf() {
    setPdfBusy(true);
    try {
      await exportMobileReportPDF(report, { lang: pdfLang, aiText: aiReports[pdfLang] });
    } finally {
      setPdfBusy(false);
    }
  }

  async function handleGenerateAiStudy() {
    setAiBusy(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "mobile",
          language: pdfLang,
          data: { fullName, mobile, bhagyank, moolank, mobileTotal: grid.mobileTotal, uniqueDigits },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      const updated = { ...aiReports, [pdfLang]: json.text };
      setAiReports(updated);
      if (clientId && report.id) {
        await updateDoc(doc(db, "clients", clientId, "mobileNumerologyReports", report.id), { aiReports: updated });
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiBusy(false);
    }
  }

  const digits = mobile.replace(/[^0-9]/g, "");
  const raw = digits.split("").reduce((s, d) => s + parseInt(d, 10), 0);
  const compat = LUCKY_COLORS_BY_MOOLANK[moolank];
  const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  const recommended = MOOLANK_COMPATIBILITY[moolank]?.friendly || [];

  return (
    <div className="card">
      <div className="card-title-row">
        <h3 style={{ margin: 0 }}>Mobile Report — {mobile}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
            {Object.entries(LANGUAGES).map(([code, l]) => (
              <option key={code} value={code}>{l.label}</option>
            ))}
          </select>
          <button className="btn btn-secondary" onClick={handleDownloadPdf} disabled={pdfBusy}>
            {pdfBusy ? "Preparing PDF…" : "Download PDF"}
          </button>
        </div>
      </div>

      <div className="card" style={{ background: "var(--parchment)" }}>
        <div className="card-title-row">
          <h3 style={{ margin: 0 }}>AI-Generated Detailed Study ({LANGUAGES[pdfLang].label})</h3>
          <button className="btn btn-primary" onClick={handleGenerateAiStudy} disabled={aiBusy}>
            {aiBusy ? "Writing…" : aiReports[pdfLang] ? "Regenerate" : "Generate AI Detailed Study"}
          </button>
        </div>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          Considers Name, Bhagyank, and Moolank together with the mobile digits for a combined study, written
          directly in the selected language.
        </p>
        {aiError && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{aiError}</p>}
        {aiReports[pdfLang] && (
          <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: 10, lineHeight: 1.6 }}>
            {aiReports[pdfLang]}
          </div>
        )}
      </div>

      <div className="grid-3" style={{ marginBottom: 16 }}>
        <NumberCell label="Mobile Compound" value={raw} />
        <NumberCell label="Mobile Total" value={grid.mobileTotal} />
        <NumberCell label="Moolank Used" value={moolank} />
      </div>

      <h3>Mobile Grid</h3>
      <p style={{ fontSize: "0.82rem", color: "#666", marginBottom: 8 }}>
        Includes mobile number digits plus the Mobile Total ({grid.mobileTotal}) added back in.
      </p>
      <table className="loshu-table" style={{ maxWidth: 220 }}>
        <tbody>
          {layout.map((row, i) => (
            <tr key={i}>
              {row.map((num) => (
                <td key={num} style={{ textAlign: "center", fontSize: "1.1rem", border: "1px solid var(--line)", padding: 8 }}>
                  {grid.counts[num] > 0 ? num.toString().repeat(grid.counts[num]) : "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 16 }}>
        <h3>Recommended Mobile Total</h3>
        <p>Based on Moolank {moolank}, the mobile total should ideally reduce to: <strong>{recommended.join(", ") || "—"}</strong></p>
      </div>

      {compat && (
        <div style={{ marginTop: 16 }}>
          <h3>Lucky &amp; Unlucky Colors</h3>
          <p><strong>Lucky:</strong> {compat.lucky.join(", ")}</p>
          <p><strong>Avoid:</strong> {compat.unlucky.join(", ")}</p>
        </div>
      )}

      {grid.missing.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h3>Missing Numbers &amp; Remedies</h3>
          {grid.missing.map((n) => (
            <div key={n} style={{ marginBottom: 10, borderLeft: "3px solid var(--saffron)", paddingLeft: 10 }}>
              <strong>Missing {n}</strong> — {MISSING_NUMBER_REMEDIES[n]}
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3>Digit Meanings Present in This Number</h3>
        {uniqueDigits.map((d) => (
          <div key={d} style={{ marginBottom: 8 }}>
            <strong>{d}:</strong> {NUMBER_MEANINGS[d]}
          </div>
        ))}
      </div>

      {uniqueDigits.length >= 2 && (
        <div style={{ marginTop: 16 }}>
          <h3>Your Chart Shows Combinations Of</h3>
          {calcUniqueDigitCombinations(mobile, 2).map((pair, i) => (
            <div key={i} className="card" style={{ marginBottom: 10 }}>
              <div className="card-title-row">
                <strong>Numbers {pair.join(", ")}</strong>
                <span className={`badge ${classifyPair(pair[0], pair[1]) === "Benefic" ? "badge-paid" : classifyPair(pair[0], pair[1]) === "Malefic" ? "badge-unpaid" : ""}`}>
                  {classifyPair(pair[0], pair[1])}
                </span>
              </div>
              <p style={{ fontSize: "0.88rem" }}>{combinationMeaning(pair)}</p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <h3>Mobile Number Combinations</h3>
        <p style={{ fontSize: "0.82rem", color: "#666", marginBottom: 8 }}>
          Adjacent digit pairs in the number (zeros excluded), classified using the same compatibility table as
          the rest of the app.
        </p>
        <table>
          <thead><tr><th>Combination</th><th>Type</th></tr></thead>
          <tbody>
            {calcMobileAdjacentPairs(mobile).map(([a, b], i) => (
              <tr key={i}>
                <td>{a}{b}</td>
                <td>{classifyPair(a, b)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NumberCell({ label, value }) {
  return (
    <div className="number-cell">
      <div className="value">{value}</div>
      <div className="label">{label}</div>
    </div>
  );
}

// ============================================================
// SECTION 3 — Two-Person Compatibility
// ============================================================
function CompatibilitySection({ client }) {
  const [personA, setPersonA] = useState({
    firstName: client.firstName || "",
    middleName: client.middleName || "",
    lastName: client.lastName || "",
    dob: client.dob || "",
  });
  const [personB, setPersonB] = useState({ firstName: "", middleName: "", lastName: "", dob: "" });
  const [system, setSystem] = useState("CHALDEAN");
  const [result, setResult] = useState(null);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiText, setAiText] = useState("");
  const [pdfLang, setPdfLang] = useState("en");

  function handleCompute(e) {
    e.preventDefault();
    if (!personA.firstName || !personA.dob || !personB.firstName || !personB.dob) return;
    setResult(computeTwoPersonCompatibility({ personA, personB, system }));
    setAiText("");
  }

  async function handleGenerateAiStudy() {
    if (!result) return;
    setAiBusy(true);
    setAiError("");
    try {
      const res = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType: "compatibility",
          language: pdfLang,
          data: {
            nameA: result.personA.fullName, nameB: result.personB.fullName,
            moolankA: result.personA.moolank, moolankB: result.personB.moolank,
            bhagyankA: result.personA.bhagyank, bhagyankB: result.personB.bhagyank,
            nameNumberA: result.personA.nameNumber, nameNumberB: result.personB.nameNumber,
            overallScore: result.overallScore,
            pairs: result.pairs,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Generation failed");
      setAiText(json.text);
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiBusy(false);
    }
  }

  return (
    <div>
      <div className="card">
        <h3>Compare Two People</h3>
        <p style={{ fontSize: "0.82rem", color: "#666" }}>
          Compares Moolank, Bhagyank, and Name Number between two people — useful for marriage, partnership, or
          business-compatibility checks.
        </p>
        <form onSubmit={handleCompute}>
          <div className="grid-2">
            <div>
              <h4 style={{ margin: "4px 0" }}>Person A</h4>
              <label>First Name</label>
              <input required value={personA.firstName} onChange={(e) => setPersonA({ ...personA, firstName: e.target.value })} />
              <label>Last Name</label>
              <input value={personA.lastName} onChange={(e) => setPersonA({ ...personA, lastName: e.target.value })} />
              <label>Date of Birth</label>
              <input required type="date" value={personA.dob} onChange={(e) => setPersonA({ ...personA, dob: e.target.value })} />
            </div>
            <div>
              <h4 style={{ margin: "4px 0" }}>Person B</h4>
              <label>First Name</label>
              <input required value={personB.firstName} onChange={(e) => setPersonB({ ...personB, firstName: e.target.value })} />
              <label>Last Name</label>
              <input value={personB.lastName} onChange={(e) => setPersonB({ ...personB, lastName: e.target.value })} />
              <label>Date of Birth</label>
              <input required type="date" value={personB.dob} onChange={(e) => setPersonB({ ...personB, dob: e.target.value })} />
            </div>
          </div>
          <label>System</label>
          <select value={system} onChange={(e) => setSystem(e.target.value)}>
            <option value="CHALDEAN">Chaldean</option>
            <option value="PYTHAGOREAN">Pythagorean</option>
          </select>
          <button className="btn btn-primary" style={{ marginTop: 10 }}>Compute Compatibility</button>
        </form>
      </div>

      {result && (
        <div className="card">
          <div className="card-title-row">
            <h3 style={{ margin: 0 }}>Compatibility Result</h3>
            <select value={pdfLang} onChange={(e) => setPdfLang(e.target.value)} style={{ marginBottom: 0, width: "auto" }}>
              {Object.entries(LANGUAGES).map(([code, l]) => (
                <option key={code} value={code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div className="grid-3" style={{ marginBottom: 16 }}>
            <NumberCell label={`${result.personA.fullName} — Moolank`} value={result.personA.moolank} />
            <NumberCell label={`${result.personB.fullName} — Moolank`} value={result.personB.moolank} />
            <NumberCell label="Overall Compatibility" value={`${result.overallScore}%`} />
          </div>

          <table>
            <thead><tr><th>Comparison</th><th>Numbers</th><th>Status</th></tr></thead>
            <tbody>
              {result.pairs.map((p, i) => (
                <tr key={i}>
                  <td>{p.label}</td>
                  <td>{p.numA} vs {p.numB}</td>
                  <td>
                    <span className={`badge ${p.status === "Benefic" ? "badge-paid" : p.status === "Malefic" ? "badge-unpaid" : ""}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="card" style={{ background: "var(--parchment)", marginTop: 16 }}>
            <div className="card-title-row">
              <h3 style={{ margin: 0 }}>AI-Generated Compatibility Study</h3>
              <button className="btn btn-primary" onClick={handleGenerateAiStudy} disabled={aiBusy}>
                {aiBusy ? "Writing…" : aiText ? "Regenerate" : "Generate AI Detailed Study"}
              </button>
            </div>
            {aiError && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{aiError}</p>}
            {aiText && (
              <div style={{ whiteSpace: "pre-wrap", fontSize: "0.9rem", marginTop: 10, lineHeight: 1.6 }}>
                {aiText}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
