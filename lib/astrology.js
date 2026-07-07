// ---------------------------------------------------------------------------
// PRATHASTU Astrology Engine
// Real astronomical calculations (VSOP87 planetary theory via the astronomia
// library) for a Vedic sidereal birth chart: planet positions, Rashi (sign),
// Nakshatra, Ascendant (Lagna), whole-sign houses, and the Vimshottari
// Mahadasha timeline.
//
// This runs server-side only (see app/api/astrology-chart/route.js) so the
// planetary data files never get bundled into the browser.
//
// ACCURACY NOTE: planetary longitude formulas here were verified against
// known reference values before shipping (Sun's longitude at the J2000.0
// epoch and at the 2024 spring equinox, Mercury/Venus/Mars/Jupiter/Saturn
// geocentric longitudes, the mean lunar node, and Greenwich Apparent
// Sidereal Time all matched published almanac values to within a fraction
// of a degree). The Ascendant formula is the standard published one
// (Meeus). The Lahiri ayanamsa uses a standard linear approximation
// accurate to a fraction of an arcminute for the modern era — for
// professional-grade precision exactly matching a specific software
// package, a precise Lahiri polynomial can be substituted here later.
// ---------------------------------------------------------------------------

import * as julian from "astronomia/julian";
import * as base from "astronomia/base";
import * as solar from "astronomia/solar";
import * as moonposition from "astronomia/moonposition";
import * as sidereal from "astronomia/sidereal";
import * as apparent from "astronomia/apparent";
import * as nutation from "astronomia/nutation";
import * as planetposition from "astronomia/planetposition";

import mercuryData from "astronomia/data/vsop87Dmercury";
import venusData from "astronomia/data/vsop87Dvenus";
import earthData from "astronomia/data/vsop87Dearth";
import marsData from "astronomia/data/vsop87Dmars";
import jupiterData from "astronomia/data/vsop87Djupiter";
import saturnData from "astronomia/data/vsop87Dsaturn";

const earth = new planetposition.Planet(earthData);
const PLANETS = {
  mercury: new planetposition.Planet(mercuryData),
  venus: new planetposition.Planet(venusData),
  mars: new planetposition.Planet(marsData),
  jupiter: new planetposition.Planet(jupiterData),
  saturn: new planetposition.Planet(saturnData),
};

const RASHI_NAMES = [
  "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
  "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischika (Scorpio)",
  "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)",
];

const NAKSHATRA_NAMES = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
];

// Fixed Vimshottari sequence (always cycles in this order) and each planet's
// full Mahadasha length in years. The nakshatra lord determines the START
// of the sequence for a given birth.
const VIMSHOTTARI_SEQUENCE = ["Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"];
const VIMSHOTTARI_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };

// Each of the 27 nakshatras' ruling planet, cycling through the sequence 3 times.
const NAKSHATRA_LORDS = Array.from({ length: 27 }, (_, i) => VIMSHOTTARI_SEQUENCE[i % 9]);

function deg(rad) {
  return (rad * 180 / Math.PI + 360) % 360;
}

/** Julian Day (UT) from a local date/time and timezone offset (hours, e.g. 5.5 for IST). */
function toJulianDayUT(dob, timeOfBirth, tzOffsetHours) {
  const [year, month, day] = dob.split("-").map(Number);
  let hour = 12, minute = 0;
  if (timeOfBirth) {
    [hour, minute] = timeOfBirth.split(":").map(Number);
  }
  const utHour = hour + minute / 60 - tzOffsetHours;
  const dayFrac = day + utHour / 24;
  return julian.CalendarGregorianToJD(year, month, dayFrac);
}

/** Geocentric apparent ecliptic longitude of an outer/inner planet, in degrees. */
function geocentricEclipticLon(planet, jd) {
  const posEarth = earth.position(jd);
  const [L0, B0, R0] = [posEarth.lon, posEarth.lat, posEarth.range];
  const [sB0, cB0] = base.sincos(B0);
  const [sL0, cL0] = base.sincos(L0);

  function xyz(tau) {
    const pos = planet.position(jd - tau);
    const [L, B, R] = [pos.lon, pos.lat, pos.range];
    const [sB, cB] = base.sincos(B);
    const [sL, cL] = base.sincos(L);
    return [
      R * cB * cL - R0 * cB0 * cL0,
      R * cB * sL - R0 * cB0 * sL0,
      R * sB - R0 * sB0,
    ];
  }

  let [x, y, z] = xyz(0);
  const delta = Math.sqrt(x * x + y * y + z * z);
  const tau = base.lightTime(delta);
  [x, y, z] = xyz(tau);

  let lam = Math.atan2(y, x);
  let bet = Math.atan2(z, Math.hypot(x, y));
  const [dLam, dBet] = apparent.eclipticAberration(lam, bet, jd);
  const fk5 = planetposition.toFK5(lam + dLam, bet + dBet, jd);
  lam = fk5.lon;
  const [dPsi] = nutation.nutation(jd);
  lam += dPsi;
  return deg(lam);
}

/** Lahiri ayanamsa (degrees) — standard linear approximation, anchored at J2000.0. */
function lahiriAyanamsa(jd) {
  const year = 2000 + (jd - 2451545.0) / 365.25;
  return 23.856 + (year - 2000) * 0.013972;
}

function toSidereal(tropicalLon, ayanamsa) {
  return ((tropicalLon - ayanamsa) % 360 + 360) % 360;
}

function getRashi(siderealLon) {
  const signIndex = Math.floor(siderealLon / 30);
  const degreeInSign = siderealLon - signIndex * 30;
  return { index: signIndex, name: RASHI_NAMES[signIndex], degree: degreeInSign };
}

function getNakshatra(siderealLon) {
  const span = 360 / 27; // 13.3333...
  const nakIndex = Math.floor(siderealLon / span);
  const degreeInNak = siderealLon - nakIndex * span;
  const pada = Math.floor(degreeInNak / (span / 4)) + 1;
  return {
    index: nakIndex,
    name: NAKSHATRA_NAMES[nakIndex],
    pada,
    lord: NAKSHATRA_LORDS[nakIndex],
    fractionElapsed: degreeInNak / span,
  };
}

/** Ascendant (Lagna) tropical ecliptic longitude, in degrees. Standard Meeus formula. */
function computeAscendant(jd, latitudeDeg, longitudeDeg) {
  const gastSeconds = sidereal.apparent(jd); // seconds of time
  const gastDeg = (gastSeconds / 86400) * 360;
  const ramc = ((gastDeg + longitudeDeg) % 360 + 360) % 360; // Local Sidereal Time
  const ramcRad = ramc * Math.PI / 180;
  const latRad = latitudeDeg * Math.PI / 180;
  const eps = nutation.meanObliquity(jd); // radians

  const y = -Math.cos(ramcRad);
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(ramcRad);
  let asc = Math.atan2(y, x) * 180 / Math.PI;
  return (asc + 360) % 360;
}

/** Full Vimshottari Mahadasha timeline (as many periods as needed to cover totalYears). */
function computeVimshottariDasha(moonSiderealLon, birthDateISO, totalYears = 100) {
  const nak = getNakshatra(moonSiderealLon);
  const startLord = nak.lord;
  const startIndex = VIMSHOTTARI_SEQUENCE.indexOf(startLord);
  const firstFullYears = VIMSHOTTARI_YEARS[startLord];
  const balanceYears = firstFullYears * (1 - nak.fractionElapsed);

  const periods = [];
  const birthDate = new Date(birthDateISO);
  let cursor = new Date(birthDate);

  function addYears(date, years) {
    const d = new Date(date);
    const wholeDays = years * 365.25;
    d.setDate(d.getDate() + Math.round(wholeDays));
    return d;
  }

  // First (partial/balance) period
  let end = addYears(cursor, balanceYears);
  periods.push({ lord: startLord, start: cursor.toISOString().split("T")[0], end: end.toISOString().split("T")[0], years: Math.round(balanceYears * 10) / 10 });
  cursor = end;

  let idx = startIndex;
  let totalElapsed = balanceYears;
  while (totalElapsed < totalYears) {
    idx = (idx + 1) % 9;
    const lord = VIMSHOTTARI_SEQUENCE[idx];
    const years = VIMSHOTTARI_YEARS[lord];
    end = addYears(cursor, years);
    periods.push({ lord, start: cursor.toISOString().split("T")[0], end: end.toISOString().split("T")[0], years });
    cursor = end;
    totalElapsed += years;
  }

  return periods;
}

/**
 * Computes the full sidereal birth chart.
 */
function computeBirthChart({ dob, timeOfBirth, latitude, longitude, tzOffsetHours = 5.5 }) {
  const jd = toJulianDayUT(dob, timeOfBirth, tzOffsetHours);
  const ayanamsa = lahiriAyanamsa(jd);

  const sunTropical = deg(solar.apparentLongitude(base.J2000Century(jd)));
  const moonTropical = deg(moonposition.position(jd).lon);
  const mercuryTropical = geocentricEclipticLon(PLANETS.mercury, jd);
  const venusTropical = geocentricEclipticLon(PLANETS.venus, jd);
  const marsTropical = geocentricEclipticLon(PLANETS.mars, jd);
  const jupiterTropical = geocentricEclipticLon(PLANETS.jupiter, jd);
  const saturnTropical = geocentricEclipticLon(PLANETS.saturn, jd);

  // Mean lunar node (Meeus 22.2)
  const T = (jd - 2451545.0) / 36525;
  const rahuTropicalDeg = ((125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000) % 360 + 360) % 360;
  const ketuTropicalDeg = (rahuTropicalDeg + 180) % 360;

  const ascendantTropical = latitude != null && longitude != null
    ? computeAscendant(jd, latitude, longitude)
    : null;

  const planetsTropical = {
    Sun: sunTropical, Moon: moonTropical, Mercury: mercuryTropical, Venus: venusTropical,
    Mars: marsTropical, Jupiter: jupiterTropical, Saturn: saturnTropical,
    Rahu: rahuTropicalDeg, Ketu: ketuTropicalDeg,
  };

  const planets = {};
  for (const [name, tropicalLon] of Object.entries(planetsTropical)) {
    const siderealLon = toSidereal(tropicalLon, ayanamsa);
    const rashi = getRashi(siderealLon);
    planets[name] = { tropicalLon, siderealLon, rashi };
  }

  let ascendant = null;
  if (ascendantTropical != null) {
    const siderealLon = toSidereal(ascendantTropical, ayanamsa);
    ascendant = { tropicalLon: ascendantTropical, siderealLon, rashi: getRashi(siderealLon) };
  }

  // Whole-sign houses: house 1 = ascendant's rashi, houses count forward from there.
  const houses = {};
  if (ascendant) {
    for (const [name, p] of Object.entries(planets)) {
      houses[name] = ((p.rashi.index - ascendant.rashi.index + 12) % 12) + 1;
    }
  }

  const moonNakshatra = getNakshatra(planets.Moon.siderealLon);
  const dasha = computeVimshottariDasha(planets.Moon.siderealLon, dob, 100);

  return {
    ayanamsa,
    planets,
    ascendant,
    houses,
    moonNakshatra,
    dasha,
  };
}

export { computeBirthChart, RASHI_NAMES, NAKSHATRA_NAMES };
