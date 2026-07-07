// ---------------------------------------------------------------------------
// PRATHASTU — AI Detailed Study generator
// Server-side only (the API key never reaches the browser). Calls Anthropic's
// Messages API with the client's already-computed numbers and asks it to
// write a detailed, professional numerology study directly in the requested
// language — this sidesteps needing hundreds of hand-translated paragraphs.
// ---------------------------------------------------------------------------

const LANGUAGE_NAMES = {
  en: "English", hi: "Hindi", mr: "Marathi", gu: "Gujarati",
  te: "Telugu", ta: "Tamil", bn: "Bengali",
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { reportType, data, language } = body;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local (see README) and restart the server." },
        { status: 500 }
      );
    }

    const languageName = LANGUAGE_NAMES[language] || "English";
    const prompt = buildPrompt(reportType, data, languageName);

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return Response.json({ error: `Anthropic API error: ${errText}` }, { status: 500 });
    }

    const json = await res.json();
    const text = (json.content || []).map((c) => c.text || "").join("\n").trim();
    return Response.json({ text });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}

function buildPrompt(reportType, data, languageName) {
  if (reportType === "name") {
    return `You are an expert professional numerologist writing a client report for a numerology practice called PRATHASTU. Write entirely in ${languageName}, using that language's native script. Do not mention that you are an AI, add no disclaimers, and use no markdown symbols — only plain section headers in capital letters on their own line.

Client details:
- Full Name: ${data.fullName}
- Date of Birth: ${data.dob}
- Numerology System: ${data.system}
- Name/Destiny Number: ${data.nameNumber}
- Bhagyank (Life Path Number, from full date of birth): ${data.bhagyank}
- Moolank (Root Number, from day of birth): ${data.moolank}
- Soul Urge Number: ${data.soulUrge}
- Personality Number: ${data.personality}

Write a detailed, warm, professional numerology study with these labeled sections:
1. BHAGYANK AND MOOLANK ANALYSIS — what these two numbers mean individually, and specifically how they interact for THIS person (supportive, neutral, or conflicting), with practical implications for career, relationships, and health.
2. NAME NUMBER ANALYSIS — what the current name number means, and whether it supports or conflicts with the Moolank.
3. PERSONALITY PROFILE — blend the Soul Urge and Personality numbers into one cohesive description.
4. FIVE-YEAR PERSONAL FORECAST — a specific, practical forecast for each of the next 5 calendar years starting ${new Date().getFullYear()}, based on standard Personal Year calculation (reduce day + month + target year).
5. PRACTICAL GUIDANCE — 4 to 5 concrete, actionable recommendations specific to this person's actual number combination.

Be specific to these exact numbers, not generic. Aim for roughly 800-1000 words.`;
  }

  if (reportType === "mobile") {
    return `You are an expert professional numerologist writing a client report for a numerology practice called PRATHASTU. Write entirely in ${languageName}, using that language's native script. Do not mention that you are an AI, add no disclaimers, and use no markdown symbols — only plain section headers in capital letters on their own line.

Client details:
- Full Name: ${data.fullName || "Not provided"}
- Mobile Number: ${data.mobile}
- Bhagyank (Life Path Number): ${data.bhagyank || "Not provided"}
- Moolank (Root Number): ${data.moolank}
- Mobile Number Total (digit sum, reduced): ${data.mobileTotal}
- Unique digits present in the mobile number: ${data.uniqueDigits.join(", ")}

Write a detailed, professional mobile numerology study with these labeled sections:
1. MOBILE NUMBER OVERVIEW — what the Mobile Total means on its own.
2. COMPATIBILITY WITH BHAGYANK AND MOOLANK — specifically analyze whether this mobile number's total and digit composition support, conflict with, or are neutral toward this person's Bhagyank and Moolank, and why that matters practically for communication, business, and decision-making.
3. NAME-MOBILE-BIRTH ALIGNMENT — if a name is provided, discuss how the name's energy, the birth numbers, and the mobile number function together as one combined system rather than in isolation.
4. DIGIT-BY-DIGIT READING — a short reading of each unique digit present and its role in daily communication and finances.
5. RECOMMENDATION — state plainly whether this mobile number suits this person well, or whether a different pattern would serve them better, including a specific target total to look for in a replacement number if a change is warranted.

Be specific to these exact numbers, not generic. Aim for roughly 600-800 words.`;
  }

  if (reportType === "astrology") {
    return `You are an expert Vedic astrologer writing a client report for a practice called PRATHASTU. Write entirely in ${languageName}, using that language's native script. Do not mention that you are an AI, add no disclaimers, and use no markdown symbols — only plain section headers in capital letters on their own line.

Client's birth chart details (already accurately calculated using real astronomical positions, sidereal/Lahiri ayanamsa):
- Full Name: ${data.fullName}
- Ascendant (Lagna) Rashi: ${data.ascendantRashi}
- Moon Rashi: ${data.moonRashi}
- Moon Nakshatra: ${data.moonNakshatra}, Pada ${data.moonPada}
- Planet placements by Rashi: ${JSON.stringify(data.planetRashis)}
- Planet placements by House (whole-sign, house 1 = Ascendant's sign): ${JSON.stringify(data.planetHouses)}
- Current Vimshottari Mahadasha: ${data.currentDasha ? `${data.currentDasha.lord} (${data.currentDasha.start} to ${data.currentDasha.end})` : "Not available"}

Write a detailed, professional Vedic astrology reading with these labeled sections:
1. LAGNA AND OVERALL PERSONALITY — what the Ascendant sign reveals about outward personality and life approach.
2. MOON SIGN AND NAKSHATRA — the emotional nature and inner mind based on Moon's Rashi and Nakshatra/Pada.
3. KEY PLANETARY PLACEMENTS — interpret the most significant house placements (especially 1st, 7th, 10th house occupants if present, and any planet in its own or an unusual sign) and what they mean practically for career, relationships, and finances.
4. CURRENT MAHADASHA ANALYSIS — what this specific planetary period means for the person right now and until it ends.
5. PRACTICAL GUIDANCE — 4 to 5 concrete recommendations based on this specific chart.

Be specific to this exact chart, not generic. Aim for roughly 800-1000 words.`;
  }

  if (reportType === "compatibility") {
    return `You are an expert professional numerologist writing a two-person compatibility report for a practice called PRATHASTU. Write entirely in ${languageName}, using that language's native script. Do not mention that you are an AI, add no disclaimers, and use no markdown symbols — only plain section headers in capital letters on their own line.

Comparison details:
- Person A: ${data.nameA} — Moolank ${data.moolankA}, Bhagyank ${data.bhagyankA}, Name Number ${data.nameNumberA}
- Person B: ${data.nameB} — Moolank ${data.moolankB}, Bhagyank ${data.bhagyankB}, Name Number ${data.nameNumberB}
- Overall Compatibility Score: ${data.overallScore}%
- Detailed pairwise comparisons: ${JSON.stringify(data.pairs.map((p) => ({ comparison: p.label, numbers: `${p.numA} vs ${p.numB}`, status: p.status })))}

Write a detailed, professional compatibility study with these labeled sections:
1. OVERALL COMPATIBILITY SUMMARY — a clear, honest headline verdict based on the ${data.overallScore}% score and the pattern of Benefic/Malefic/Neutral results.
2. MOOLANK COMPATIBILITY — what it means for their fundamental personalities to interact this way day-to-day.
3. BHAGYANK COMPATIBILITY — what it means for their long-term life direction and shared goals.
4. NAME ENERGY COMPATIBILITY — how their name vibrations interact.
5. PRACTICAL GUIDANCE — 4 to 5 concrete, honest recommendations for this specific pairing, including any friction points to be aware of and how to work with them constructively. Do not sugarcoat a genuinely difficult combination, but stay constructive and respectful in tone.

Be specific to these exact numbers, not generic. Aim for roughly 600-800 words.`;
  }

  return "Write a short, professional numerology summary.";
}
