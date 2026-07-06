// ---------------------------------------------------------------------------
// PRATHASTU PDF Export
// Builds branded PDF reports (letterhead with logo + gold/green identity)
// entirely in the browser using jsPDF -- no server or API call needed.
// Supports language selection: when a non-English language is chosen, a real
// Unicode font for that script is fetched and embedded so labels, number
// meanings, and remedies render correctly in that script. Long-form
// interpretive paragraphs (Personal Year / Dasha / Compound Number) are not
// yet translated -- see lib/translations.js for the scope note -- so those
// sections render in English with a small note, even when another language
// is selected for the rest of the report.
// ---------------------------------------------------------------------------

const BRAND = {
  deepGreen: [14, 61, 48],
  goldBright: [226, 181, 99],
  grey: [110, 110, 110],
};

async function loadLogoBase64() {
  try {
    const res = await fetch("/logo.jpg");
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    return null;
  }
}

async function loadFontBase64(url) {
  const res = await fetch(url);
  const blob = await res.blob();
  return await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]); // strip data: prefix, jsPDF wants raw base64
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Sets up the document's body font: embeds and activates the correct Unicode
 * font for the selected language, or falls back to Helvetica for English.
 * Returns the font name to pass to doc.setFont() for all body text.
 */
async function setupBodyFont(doc, lang) {
  const { LANGUAGES, FONT_FILES } = await import("./translations");
  const fontKey = LANGUAGES[lang]?.fontKey;
  if (!fontKey) return "helvetica";

  const base64 = await loadFontBase64(FONT_FILES[fontKey]);
  const fileName = `${fontKey}.ttf`;
  doc.addFileToVFS(fileName, base64);
  doc.addFont(fileName, fontKey, "normal");
  return fontKey;
}

function addLetterhead(doc, logoBase64, subtitle) {
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND.deepGreen);
  doc.rect(0, 0, pageWidth, 30, "F");
  if (logoBase64) {
    try { doc.addImage(logoBase64, "JPEG", 10, 3, 24, 24); } catch (e) {}
  }
  doc.setTextColor(...BRAND.goldBright);
  doc.setFont("times", "bold");
  doc.setFontSize(19);
  doc.text("PRATHASTU", 40, 14);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("AstroVastu & Numerology", 40, 20);
  doc.setFontSize(8);
  doc.setTextColor(210, 210, 210);
  doc.text(subtitle || "Align Your Space. Align Your Destiny.", 40, 25);
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc, pageNum) {
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setDrawColor(220, 214, 196);
  doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.grey);
  doc.text("PRATHASTU — AstroVastu & Numerology", 14, pageHeight - 10);
  doc.text(`Page ${pageNum}`, pageWidth - 24, pageHeight - 10);
}

function sectionTitle(doc, text, y, bodyFont) {
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.deepGreen);
  doc.text(text, 14, y);
  doc.setTextColor(0, 0, 0);
  doc.setFont(bodyFont, "normal");
  doc.setFontSize(10);
  return y + 7;
}

function bodyText(doc, text, y, maxWidth = 182) {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, 14, y);
  return y + lines.length * 5;
}

function makePageContext(doc, logoBase64, subtitle, bodyFont) {
  let page = 1;
  addLetterhead(doc, logoBase64, subtitle);
  addFooter(doc, page);
  let y = 40;

  function ensureSpace(needed) {
    const pageHeight = doc.internal.pageSize.getHeight();
    if (y + needed > pageHeight - 20) {
      doc.addPage();
      page += 1;
      addLetterhead(doc, logoBase64, subtitle);
      addFooter(doc, page);
      doc.setFont(bodyFont, "normal");
      y = 40;
    }
  }

  return {
    get y() { return y; },
    set y(val) { y = val; },
    ensureSpace,
  };
}

function drawGrid3x3(doc, counts, x, y, cellSize = 16) {
  const layout = [[4, 9, 2], [3, 5, 7], [8, 1, 6]];
  doc.setDrawColor(220, 214, 196);
  doc.setFontSize(11);
  layout.forEach((row, r) => {
    row.forEach((num, c) => {
      const cx = x + c * cellSize;
      const cy = y + r * cellSize;
      doc.rect(cx, cy, cellSize, cellSize);
      const display = counts[num] > 0 ? String(num).repeat(counts[num]) : "—";
      doc.text(display, cx + cellSize / 2, cy + cellSize / 2 + 2, { align: "center" });
    });
  });
  return y + cellSize * 3 + 6;
}

// ---------------------------------------------------------------------------
// Birth Details Report PDF
// ---------------------------------------------------------------------------
export async function exportBirthReportPDF(report, options = {}) {
  const lang = options.lang || "en";
  const { default: jsPDF } = await import("jspdf");
  const { LABELS, NUMBER_MEANINGS_I18N, MISSING_NUMBER_REMEDIES_I18N, PERSONAL_YEAR_TITLES_I18N } =
    await import("./translations");
  const T = LABELS[lang] || LABELS.en;

  const doc = new jsPDF();
  const logo = await loadLogoBase64();
  const bodyFont = await setupBodyFont(doc, lang);
  doc.setFont(bodyFont, "normal");
  const ctx = makePageContext(doc, logo, `Numerology Report — ${report.system}`, bodyFont);

  const {
    nameNumber, firstNameNumber, lifePathNumber, birthNumber, soulUrgeNumber,
    personalityNumber, mobileNumberAnalysis, loshuGrid, inputs,
  } = report;
  const moolank = birthNumber.reduced;

  ctx.y = sectionTitle(doc, inputs.fullName, ctx.y, bodyFont);
  doc.setFontSize(10);
  doc.text(`${T.dob}: ${inputs.dob}    ${T.mobile}: ${inputs.mobile || "—"}    ${T.system}: ${report.system}`, 14, ctx.y);
  ctx.y += 10;

  if (options.aiText) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, "AI-Generated Detailed Study", ctx.y, bodyFont);
    doc.setFontSize(9);
    options.aiText.split("\n").filter(Boolean).forEach((line) => {
      ctx.ensureSpace(10);
      ctx.y = bodyText(doc, line, ctx.y);
      ctx.y += 2;
    });
    ctx.y += 6;
  }

  ctx.ensureSpace(30);
  ctx.y = sectionTitle(doc, T.coreNumbers, ctx.y, bodyFont);
  const rows = [
    [T.nameNumber, nameNumber.reduced],
    firstNameNumber ? [T.firstNameNumber, firstNameNumber.reduced] : null,
    [T.lifePathNumber, lifePathNumber.reduced],
    [T.birthNumber, birthNumber.reduced],
    [T.soulUrge, soulUrgeNumber.reduced],
    [T.personality, personalityNumber.reduced],
    mobileNumberAnalysis ? [T.mobileNumber, mobileNumberAnalysis.reduced] : null,
  ].filter(Boolean);
  rows.forEach(([label, val]) => {
    doc.text(`${label}:`, 14, ctx.y);
    doc.text(String(val), 130, ctx.y);
    ctx.y += 6;
  });
  ctx.y += 4;

  ctx.ensureSpace(70);
  ctx.y = sectionTitle(doc, T.loshuGrid, ctx.y, bodyFont);
  doc.setFontSize(9);
  ctx.y = bodyText(doc, `Driver: ${loshuGrid.driver} | Conductor: ${loshuGrid.conductor}`, ctx.y);
  ctx.y += 4;
  ctx.y = drawGrid3x3(doc, loshuGrid.counts, 14, ctx.y);
  if (loshuGrid.missing.length > 0) {
    doc.setFontSize(10);
    doc.text(`${T.missingNumbers}: ${loshuGrid.missing.join(", ")}`, 14, ctx.y);
    ctx.y += 8;
  }

  const remedies = MISSING_NUMBER_REMEDIES_I18N[lang] || MISSING_NUMBER_REMEDIES_I18N.en;
  if (loshuGrid.missing.length > 0) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, T.missingRemedies, ctx.y, bodyFont);
    doc.setFontSize(9);
    loshuGrid.missing.forEach((n) => {
      ctx.ensureSpace(14);
      ctx.y = bodyText(doc, `${n}: ${remedies[n]}`, ctx.y);
      ctx.y += 3;
    });
  }

  const { LUCKY_COLORS_BY_MOOLANK, getCompatibility } = await import("./numerologyKnowledge");
  const colors = LUCKY_COLORS_BY_MOOLANK[moolank];
  if (colors) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, T.luckyColors, ctx.y, bodyFont);
    doc.setFontSize(10);
    doc.text(`${T.lucky}: ${colors.lucky.join(", ")}`, 14, ctx.y);
    ctx.y += 6;
    doc.text(`${T.avoid}: ${colors.unlucky.join(", ")}`, 14, ctx.y);
    ctx.y += 10;
  }

  function translateCompat(c) {
    if (c === "Friendly") return T.friendly;
    if (c === "Enemy (Anti)") return T.enemy;
    return T.neutral;
  }

  ctx.ensureSpace(20);
  ctx.y = sectionTitle(doc, T.nameCompat, ctx.y, bodyFont);
  doc.setFontSize(10);
  if (firstNameNumber) {
    ctx.y = bodyText(doc, `${T.firstNameNumber} (${firstNameNumber.reduced}): ${translateCompat(getCompatibility(firstNameNumber.reduced, moolank))}`, ctx.y);
  }
  ctx.y = bodyText(doc, `${T.nameNumber} (${nameNumber.reduced}): ${translateCompat(getCompatibility(nameNumber.reduced, moolank))}`, ctx.y);
  ctx.y += 6;

  const { calcPersonalYearTimeline, calcDashaTimelineFull } = await import("./numerology");
  const { PERSONAL_YEAR_MEANINGS, DASHA_MEANINGS, PLANET_BY_NUMBER, COMPOUND_NUMBER_TEXT, LETTER_MEANINGS } =
    await import("./numerologyKnowledge");

  const firstLetter = inputs.firstName?.[0]?.toUpperCase();
  if (firstLetter && LETTER_MEANINGS[firstLetter]) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, T.soundVibration, ctx.y, bodyFont);
    doc.setFontSize(10);
    ctx.y = bodyText(doc, `${firstLetter}: ${LETTER_MEANINGS[firstLetter]}`, ctx.y);
    ctx.y += 6;
  }

  if (lang !== "en") {
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.grey);
    ctx.y = bodyText(doc, T.detailedTextNote, ctx.y);
    doc.setTextColor(0, 0, 0);
    ctx.y += 4;
  }

  if (firstNameNumber) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, T.compoundFirst, ctx.y, bodyFont);
    doc.setFontSize(10);
    ctx.y = bodyText(doc, COMPOUND_NUMBER_TEXT[firstNameNumber.reduced], ctx.y);
    ctx.y += 6;
  }
  ctx.ensureSpace(20);
  ctx.y = sectionTitle(doc, T.compoundFull, ctx.y, bodyFont);
  doc.setFontSize(10);
  ctx.y = bodyText(doc, COMPOUND_NUMBER_TEXT[nameNumber.reduced], ctx.y);
  ctx.y += 6;

  const yearTitles = PERSONAL_YEAR_TITLES_I18N[lang] || PERSONAL_YEAR_TITLES_I18N.en;
  ctx.ensureSpace(20);
  ctx.y = sectionTitle(doc, T.personalYear, ctx.y, bodyFont);
  const personalYears = calcPersonalYearTimeline(inputs.dob, 5);
  personalYears.forEach((py) => {
    const meaning = PERSONAL_YEAR_MEANINGS[py.number];
    ctx.ensureSpace(22);
    doc.setFont(bodyFont, "normal");
    doc.setFontSize(10);
    doc.text(`${py.year} — ${T.personalYear.split(" ")[0]} ${py.number}: ${yearTitles[py.number]}`, 14, ctx.y);
    ctx.y += 5;
    doc.setFontSize(9);
    ctx.y = bodyText(doc, meaning.text, ctx.y);
    ctx.y += 4;
  });

  ctx.ensureSpace(20);
  ctx.y = sectionTitle(doc, T.dashaTimeline, ctx.y, bodyFont);
  const dashaPeriods = calcDashaTimelineFull(inputs.dob, 100);
  doc.setFontSize(9);
  dashaPeriods.forEach((p) => {
    ctx.ensureSpace(16);
    doc.text(`${p.startYear}–${p.endYear} (${PLANET_BY_NUMBER[p.number]}, No. ${p.number})`, 14, ctx.y);
    ctx.y += 5;
    ctx.y = bodyText(doc, DASHA_MEANINGS[p.number], ctx.y);
    ctx.y += 3;
  });

  doc.save(`PRATHASTU-Numerology-${inputs.fullName.replace(/\s+/g, "_")}-${lang}.pdf`);
}

// ---------------------------------------------------------------------------
// Mobile Number Report PDF
// ---------------------------------------------------------------------------
export async function exportMobileReportPDF(report, options = {}) {
  const lang = options.lang || "en";
  const { default: jsPDF } = await import("jspdf");
  const { LABELS, NUMBER_MEANINGS_I18N, MISSING_NUMBER_REMEDIES_I18N } = await import("./translations");
  const T = LABELS[lang] || LABELS.en;

  const doc = new jsPDF();
  const logo = await loadLogoBase64();
  const bodyFont = await setupBodyFont(doc, lang);
  doc.setFont(bodyFont, "normal");
  const ctx = makePageContext(doc, logo, "Mobile Numerology Report", bodyFont);

  const { mobile, moolank, grid, uniqueDigits } = report;
  const digits = mobile.replace(/[^0-9]/g, "");
  const raw = digits.split("").reduce((s, d) => s + parseInt(d, 10), 0);

  const { LUCKY_COLORS_BY_MOOLANK, MOOLANK_COMPATIBILITY, classifyPair, combinationMeaning } =
    await import("./numerologyKnowledge");
  const { calcUniqueDigitCombinations, calcMobileAdjacentPairs } = await import("./numerology");
  const numberMeanings = NUMBER_MEANINGS_I18N[lang] || NUMBER_MEANINGS_I18N.en;
  const remedies = MISSING_NUMBER_REMEDIES_I18N[lang] || MISSING_NUMBER_REMEDIES_I18N.en;

  ctx.y = sectionTitle(doc, `${T.mobileNumber}: ${mobile}`, ctx.y, bodyFont);
  doc.setFontSize(10);
  doc.text(`${T.moolankUsed}: ${moolank}`, 14, ctx.y);
  ctx.y += 10;

  if (options.aiText) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, "AI-Generated Detailed Study", ctx.y, bodyFont);
    doc.setFontSize(9);
    options.aiText.split("\n").filter(Boolean).forEach((line) => {
      ctx.ensureSpace(10);
      ctx.y = bodyText(doc, line, ctx.y);
      ctx.y += 2;
    });
    ctx.y += 6;
  }

  ctx.y = sectionTitle(doc, T.coreNumbers, ctx.y, bodyFont);
  [[T.mobileCompound, raw], [T.mobileTotal, grid.mobileTotal], [T.moolankUsed, moolank]].forEach(([label, val]) => {
    doc.text(`${label}:`, 14, ctx.y);
    doc.text(String(val), 130, ctx.y);
    ctx.y += 6;
  });
  ctx.y += 4;

  ctx.ensureSpace(70);
  ctx.y = sectionTitle(doc, T.mobileGrid, ctx.y, bodyFont);
  doc.setFontSize(9);
  ctx.y = bodyText(doc, `${T.mobileTotal}: ${grid.mobileTotal}`, ctx.y);
  ctx.y += 4;
  ctx.y = drawGrid3x3(doc, grid.counts, 14, ctx.y);
  if (grid.missing.length > 0) {
    doc.setFontSize(10);
    doc.text(`${T.missingNumbers}: ${grid.missing.join(", ")}`, 14, ctx.y);
    ctx.y += 8;
  }

  const recommended = MOOLANK_COMPATIBILITY[moolank]?.friendly || [];
  ctx.ensureSpace(16);
  ctx.y = sectionTitle(doc, T.recommendedTotal, ctx.y, bodyFont);
  doc.setFontSize(10);
  doc.text(`${T.moolankUsed} ${moolank}: ${recommended.join(", ") || "—"}`, 14, ctx.y);
  ctx.y += 10;

  const colors = LUCKY_COLORS_BY_MOOLANK[moolank];
  if (colors) {
    ctx.ensureSpace(16);
    ctx.y = sectionTitle(doc, T.luckyColors, ctx.y, bodyFont);
    doc.setFontSize(10);
    doc.text(`${T.lucky}: ${colors.lucky.join(", ")}`, 14, ctx.y);
    ctx.y += 6;
    doc.text(`${T.avoid}: ${colors.unlucky.join(", ")}`, 14, ctx.y);
    ctx.y += 10;
  }

  if (grid.missing.length > 0) {
    ctx.ensureSpace(16);
    ctx.y = sectionTitle(doc, T.missingRemedies, ctx.y, bodyFont);
    doc.setFontSize(9);
    grid.missing.forEach((n) => {
      ctx.ensureSpace(14);
      ctx.y = bodyText(doc, `${n}: ${remedies[n]}`, ctx.y);
      ctx.y += 3;
    });
  }

  ctx.ensureSpace(16);
  ctx.y = sectionTitle(doc, T.digitMeanings, ctx.y, bodyFont);
  doc.setFontSize(9);
  uniqueDigits.forEach((d) => {
    ctx.ensureSpace(12);
    ctx.y = bodyText(doc, `${d}: ${numberMeanings[d]}`, ctx.y, 172);
    ctx.y += 2;
  });

  if (uniqueDigits.length >= 2) {
    ctx.ensureSpace(20);
    ctx.y = sectionTitle(doc, T.combinationsShow, ctx.y, bodyFont);
    doc.setFontSize(9);
    calcUniqueDigitCombinations(mobile, 2).forEach((pair) => {
      ctx.ensureSpace(16);
      ctx.y = bodyText(doc, `${pair.join(", ")} (${classifyPair(pair[0], pair[1])}): ${combinationMeaning(pair)}`, ctx.y);
      ctx.y += 3;
    });
  }

  ctx.ensureSpace(20);
  ctx.y = sectionTitle(doc, T.mobileCombinations, ctx.y, bodyFont);
  doc.setFontSize(9);
  calcMobileAdjacentPairs(mobile).forEach(([a, b]) => {
    ctx.ensureSpace(8);
    doc.text(`${a}${b} — ${classifyPair(a, b)}`, 14, ctx.y);
    ctx.y += 6;
  });

  doc.save(`PRATHASTU-Mobile-Numerology-${mobile}-${lang}.pdf`);
}
