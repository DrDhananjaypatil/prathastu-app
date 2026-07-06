// ---------------------------------------------------------------------------
// PRATHASTU Numerology Engine
// Supports Chaldean, Pythagorean, and Vedic/Loshu-based calculations.
// All functions are pure (no side effects) so they're easy to test and reuse
// from both the admin report generator and any future API route.
// ---------------------------------------------------------------------------

const CHALDEAN_MAP = {
  a: 1, i: 1, j: 1, q: 1, y: 1,
  b: 2, k: 2, r: 2,
  c: 3, g: 3, l: 3, s: 3,
  d: 4, m: 4, t: 4,
  e: 5, h: 5, n: 5, x: 5,
  u: 6, v: 6, w: 6,
  o: 7, z: 7,
  f: 8, p: 8,
  // Chaldean has no letters mapped to 9 — it's treated as sacred/complete.
};

const PYTHAGOREAN_MAP = {
  a: 1, j: 1, s: 1,
  b: 2, k: 2, t: 2,
  c: 3, l: 3, u: 3,
  d: 4, m: 4, v: 4,
  e: 5, n: 5, w: 5,
  f: 6, o: 6, x: 6,
  g: 7, p: 7, y: 7,
  h: 8, q: 8, z: 8,
  i: 9, r: 9,
};

const VOWELS = new Set(["a", "e", "i", "o", "u"]);
const MASTER_NUMBERS = new Set([11, 22, 33]);

/** Reduce a number to a single digit, optionally preserving master numbers. */
function reduceNumber(num, keepMaster = true) {
  let n = Math.abs(num);
  while (n > 9 && !(keepMaster && MASTER_NUMBERS.has(n))) {
    n = String(n)
      .split("")
      .reduce((sum, d) => sum + parseInt(d, 10), 0);
  }
  return n;
}

function letterMap(system) {
  if (system === "PYTHAGOREAN") return PYTHAGOREAN_MAP;
  // CHALDEAN and VEDIC_LOSHU (name portion) both use the Chaldean letter map,
  // since Vedic/Loshu numerology traditionally borrows Chaldean values for names.
  return CHALDEAN_MAP;
}

function sumLetters(name, system, filter) {
  const map = letterMap(system);
  const clean = name.toLowerCase().replace(/[^a-z]/g, "");
  let total = 0;
  for (const ch of clean) {
    if (filter && !filter(ch)) continue;
    total += map[ch] || 0;
  }
  return total;
}

/** Name / Expression / Destiny number — full name, all letters. */
export function calcNameNumber(fullName, system = "CHALDEAN") {
  const raw = sumLetters(fullName, system, () => true);
  return { raw, reduced: reduceNumber(raw) };
}

/** Soul Urge / Heart's Desire — vowels only. */
export function calcSoulUrgeNumber(fullName, system = "CHALDEAN") {
  const raw = sumLetters(fullName, system, (ch) => VOWELS.has(ch));
  return { raw, reduced: reduceNumber(raw) };
}

/** Personality number — consonants only. */
export function calcPersonalityNumber(fullName, system = "CHALDEAN") {
  const raw = sumLetters(fullName, system, (ch) => !VOWELS.has(ch));
  return { raw, reduced: reduceNumber(raw) };
}

/** Life Path / Destiny (from DOB) — sum of all digits in DOB. */
export function calcLifePathNumber(dob) {
  // dob expected as "YYYY-MM-DD"
  const digits = dob.replace(/[^0-9]/g, "");
  const raw = digits
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
  return { raw, reduced: reduceNumber(raw) };
}

/** Birth / Driver number — just the day of birth, reduced. */
export function calcBirthNumber(dob) {
  const day = parseInt(dob.split("-")[2], 10);
  return { raw: day, reduced: reduceNumber(day) };
}

/** Mobile number analysis — digit sum + repeating-digit flags. */
export function calcMobileNumberAnalysis(mobile) {
  const digits = mobile.replace(/[^0-9]/g, "");
  const raw = digits
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
  const counts = {};
  for (const d of digits) counts[d] = (counts[d] || 0) + 1;
  const repeating = Object.entries(counts)
    .filter(([, c]) => c >= 3)
    .map(([digit, count]) => ({ digit, count }));
  return { raw, reduced: reduceNumber(raw), repeating };
}

/**
 * Loshu Grid — built from every digit that appears in the DOB.
 * Traditional 3x3 grid positions:
 *   4 9 2
 *   3 5 7
 *   8 1 6
 */
const LOSHU_POSITIONS = {
  1: [2, 1], 2: [0, 2], 3: [1, 0], 4: [0, 0],
  5: [1, 1], 6: [2, 2], 7: [1, 2], 8: [2, 0], 9: [0, 1],
};

const LOSHU_PLANES = {
  mental: [3, 5, 7],       // thought plane (middle row numbers)
  emotional: [4, 5, 6],    // will plane
  practical: [8, 1, 6],    // action plane (bottom row)
};

export function calcLoshuGrid(dob) {
  const digits = dob.replace(/[^0-9]/g, "").split("").map(Number).filter((d) => d !== 0);
  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  digits.forEach((d) => (counts[d] = (counts[d] || 0) + 1));

  // Driver Number = day of birth, fully reduced to a single digit (no master numbers in the grid).
  const day = parseInt(dob.split("-")[2], 10);
  const driver = reduceNumber(day, false);

  // Conductor Number = sum of every digit in the DOB, fully reduced to a single digit.
  const totalRaw = dob
    .replace(/[^0-9]/g, "")
    .split("")
    .reduce((sum, d) => sum + parseInt(d, 10), 0);
  const conductor = reduceNumber(totalRaw, false);

  // Add Driver and Conductor back into the grid on top of the raw birth-date digits.
  counts[driver] = (counts[driver] || 0) + 1;
  counts[conductor] = (counts[conductor] || 0) + 1;

  const missing = Object.entries(counts)
    .filter(([, c]) => c === 0)
    .map(([n]) => parseInt(n, 10));

  const planeStatus = {};
  for (const [plane, nums] of Object.entries(LOSHU_PLANES)) {
    planeStatus[plane] = nums.every((n) => counts[n] > 0);
  }

  return { counts, missing, planeStatus, driver, conductor, positions: LOSHU_POSITIONS };
}

/**
 * Runs the full report for a given system + client inputs.
 * Every result is returned as its own labeled entity, per PRATHASTU's
 * "separate cards, not one lump number" report format.
 */
export function generateNumerologyReport({
  firstName,
  middleName = "",
  lastName,
  dob,          // "YYYY-MM-DD"
  mobile,
  system = "CHALDEAN", // "CHALDEAN" | "PYTHAGOREAN" | "VEDIC_LOSHU"
}) {
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  return {
    system,
    inputs: { firstName, middleName, lastName, fullName, dob, mobile },
    nameNumber: calcNameNumber(fullName, system),
    firstNameNumber: firstName ? calcNameNumber(firstName, system) : null,
    lifePathNumber: calcLifePathNumber(dob),
    birthNumber: calcBirthNumber(dob),
    soulUrgeNumber: calcSoulUrgeNumber(fullName, system),
    personalityNumber: calcPersonalityNumber(fullName, system),
    mobileNumberAnalysis: mobile ? calcMobileNumberAnalysis(mobile) : null,
    loshuGrid: calcLoshuGrid(dob),
    generatedAt: new Date().toISOString(),
  };
}

/** Personal Year Number for a given calendar year: reduce(day + month + year). */
export function calcPersonalYear(dob, year) {
  const [, month, day] = dob.split("-").map((x) => parseInt(x, 10));
  const raw = day + month + year;
  return reduceNumber(raw, false);
}

/** Personal Year table for the current year plus the next `count - 1` years. */
export function calcPersonalYearTimeline(dob, count = 5) {
  const startYear = new Date().getFullYear();
  const years = [];
  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    years.push({ year, number: calcPersonalYear(dob, year) });
  }
  return years;
}

/**
 * Numerology Dasha (ruling-period) timeline — a 1-9 digit cycle starting
 * from the Driver Number (day of birth, reduced), where period N lasts
 * N years, cycling 1->9->1... This mirrors the classical numerology "Dasha"
 * concept (distinct from Vedic astrology's nakshatra-based Vimshottari Dasha,
 * which lives in the Astrology module).
 */
export function calcDashaTimeline(dob, periodsCount = 10) {
  const birthYear = parseInt(dob.split("-")[0], 10);
  const day = parseInt(dob.split("-")[2], 10);
  let current = reduceNumber(day, false);
  let startYear = birthYear;
  const periods = [];
  for (let i = 0; i < periodsCount; i++) {
    const endYear = startYear + current;
    periods.push({ number: current, startYear, endYear });
    startYear = endYear;
    current = current === 9 ? 1 : current + 1;
  }
  return periods;
}

/**
 * Full-lifetime Dasha timeline — runs the same 1-9 cycle until it covers
 * `totalYears` from birth (default 100), so the full life is represented
 * rather than just the next several periods.
 */
export function calcDashaTimelineFull(dob, totalYears = 100) {
  const birthYear = parseInt(dob.split("-")[0], 10);
  const day = parseInt(dob.split("-")[2], 10);
  let current = reduceNumber(day, false);
  let startYear = birthYear;
  const periods = [];
  while (startYear - birthYear < totalYears) {
    const endYear = startYear + current;
    periods.push({ number: current, startYear, endYear });
    startYear = endYear;
    current = current === 9 ? 1 : current + 1;
  }
  return periods;
}

/**
 * Mobile Number Grid - same Loshu-style grid as the birth grid, but built
 * from the mobile number's digits, with the Mobile Total added back in
 * (parallel to how Driver/Conductor are added to the birth grid).
 */
export function calcMobileGrid(mobile) {
  const digits = mobile.replace(/[^0-9]/g, "").split("").map(Number).filter((d) => d !== 0);
  const counts = {};
  for (let i = 1; i <= 9; i++) counts[i] = 0;
  digits.forEach((d) => (counts[d] = (counts[d] || 0) + 1));

  const analysis = calcMobileNumberAnalysis(mobile);
  counts[analysis.reduced] = (counts[analysis.reduced] || 0) + 1;

  const missing = Object.entries(counts)
    .filter(([, c]) => c === 0)
    .map(([n]) => parseInt(n, 10));

  return { counts, missing, mobileTotal: analysis.reduced, positions: LOSHU_POSITIONS };
}

/**
 * Adjacent-pair combinations from the mobile number, after stripping zeros
 * (e.g. 7030251966 -> 7,3,2,5,1,9,6,6 -> pairs 73,32,25,51,19,96,66).
 * This mirrors the classical "Mobile Number Combinations" table format.
 */
export function calcMobileAdjacentPairs(mobile) {
  const digits = mobile.replace(/[^0-9]/g, "").split("").map(Number).filter((d) => d !== 0);
  const pairs = [];
  for (let i = 0; i < digits.length - 1; i++) {
    pairs.push([digits[i], digits[i + 1]]);
  }
  return pairs;
}

/** All unique unordered combinations of a given size from the number's distinct digits. */
export function calcUniqueDigitCombinations(mobile, size = 2) {
  const digits = [...new Set(mobile.replace(/[^0-9]/g, "").split("").map(Number).filter((d) => d !== 0))];
  const results = [];
  function combo(start, chosen) {
    if (chosen.length === size) {
      results.push([...chosen]);
      return;
    }
    for (let i = start; i < digits.length; i++) {
      chosen.push(digits[i]);
      combo(i + 1, chosen);
      chosen.pop();
    }
  }
  combo(0, []);
  return results;
}
