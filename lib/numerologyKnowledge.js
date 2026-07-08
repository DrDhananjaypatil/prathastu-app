// ---------------------------------------------------------------------------
// PRATHASTU Numerology Knowledge Base
// This file holds all the "traditional knowledge" tables — compatibility,
// remedies, meanings — separately from the calculation engine (numerology.js)
// so Gauravraj can edit/correct any of this text or data without touching
// the math logic at all.
//
// IMPORTANT: The MOOLANK_COMPATIBILITY table below is seeded with a commonly
// published Chaldean-style friendship chart, but different schools use
// different versions. Please review and edit the numbers in this table to
// exactly match what you were trained on — everything downstream (lucky/
// unlucky numbers, recommended mobile totals, name compatibility, and
// number-combination classifications) reads straight from this table.
// ---------------------------------------------------------------------------

// For each Moolank (birth/driver number, 1-9): which numbers are Friendly,
// Enemy, and Neutral to it. Edit these freely.
export const MOOLANK_COMPATIBILITY = {
  1: { friendly: [1, 2, 3, 9], enemy: [6, 8], neutral: [4, 5, 7] },
  2: { friendly: [2, 4, 7, 9], enemy: [1, 8], neutral: [3, 5, 6] },
  3: { friendly: [3, 6, 9], enemy: [5, 7], neutral: [1, 2, 4, 8] },
  4: { friendly: [4, 5, 8], enemy: [1, 3, 9], neutral: [2, 6, 7] },
  5: { friendly: [1, 5, 6], enemy: [2, 4, 8, 9], neutral: [3, 7] },
  6: { friendly: [3, 6, 9], enemy: [2, 5], neutral: [1, 4, 7, 8] },
  7: { friendly: [2, 7, 9], enemy: [3, 5], neutral: [1, 4, 6, 8] },
  8: { friendly: [5, 6, 8], enemy: [1, 2, 9], neutral: [3, 4, 7] },
  9: { friendly: [1, 3, 6, 9], enemy: [4, 7], neutral: [2, 5, 8] },
};

// Lucky colors by Moolank — edit to match your practice.
export const LUCKY_COLORS_BY_MOOLANK = {
  1: { lucky: ["Gold", "Orange", "Yellow"], unlucky: ["Black", "Dark Blue"] },
  2: { lucky: ["White", "Cream", "Light Green"], unlucky: ["Red"] },
  3: { lucky: ["Yellow", "Purple"], unlucky: ["Black"] },
  4: { lucky: ["Grey", "Blue", "Electric Blue"], unlucky: ["Red", "Pink"] },
  5: { lucky: ["Green", "Light Grey"], unlucky: ["Indigo", "Yellow"] },
  6: { lucky: ["White", "Pink", "Sky Blue"], unlucky: ["Black"] },
  7: { lucky: ["White", "Sea Green"], unlucky: ["Dark Colors"] },
  8: { lucky: ["Dark Blue", "Black", "Purple"], unlucky: ["White"] },
  9: { lucky: ["Red", "Pink"], unlucky: ["Blue", "Black"] },
};

// Personal Year meanings (Universal Year concept, 1-9) — original text.
export const PERSONAL_YEAR_MEANINGS = {
  1: {
    title: "The Year of New Beginnings",
    theme: "Fresh starts, independence, initiative",
    text: "This is a year to plant seeds rather than harvest them. New projects, new directions, and taking the lead all favor you now, and whatever you begin this year tends to set the tone for the next eight. You'll feel a stronger pull toward independence, decisions made solo often work out better than group ones. Avoid waiting for others to move first; this year consistently rewards the person who acts before conditions feel perfectly ready. Career-wise, this is a strong year to pitch new ideas, start a business, or ask for a role with more responsibility. Relationships may take a back seat while personal ambition takes the wheel, that's normal for a 1 year, not a sign anything is wrong. Health-wise, build new habits now; anything started in a 1 year has unusual staying power.",
  },
  2: {
    title: "The Year of Partnership",
    theme: "Cooperation, patience, relationships",
    text: "Growth this year comes through people, not solo effort. Partnerships, collaborations, and negotiations move further than anything attempted alone, so this is a good year to bring in a co-founder, mentor, or close collaborator rather than go it alone. Patience is the underlying lesson, timing and diplomacy matter more than force, and pushing hard against resistance usually backfires. Emotional and domestic matters come into sharper focus; family ties, marriage, or close friendships may deepen, or old tension may finally get resolved through conversation rather than confrontation. Financially, this is a slower, steadier year, good for saving and consolidating rather than aggressive expansion. If you find yourself frustrated by slow progress, resist the urge to force outcomes; a 2 year rewards the person who waits for the right moment.",
  },
  3: {
    title: "The Year of Expression",
    theme: "Creativity, communication, social growth",
    text: "A socially rich, expressive year. Communication-heavy work, creative projects, writing, teaching, and public-facing roles all get an extra lift, and your natural charm and wit are more noticeable to others than usual. This is a favorable year to expand your network, get visible on social media, or pursue any work involving speaking, sales, or performance. The main risk is scattered energy, with so many interesting directions competing for attention, it's easy to start much and finish little. Deliberately choosing 2-3 priorities and ignoring the rest turns this year's abundant opportunity into real results. Socially this is a joyful year with more invitations, gatherings, and new connections than usual, some of which may prove valuable well beyond this year.",
  },
  4: {
    title: "The Year of Foundation",
    theme: "Hard work, structure, stability",
    text: "A building year, and one of the more literal ones, progress this year is in direct proportion to the effort you put in, with very few shortcuts available. Projects require patience, sustained discipline, and attention to detail; anything rushed tends to need redoing. Financially this is a steady, not flashy, year: good for saving, paying down debt, and getting organized, less suited to speculative risk. Health and daily routine deserve real attention now, since habits built or broken in a 4 year tend to stick. Relationships benefit from consistency and reliability rather than grand gestures. If the year feels slow or effortful, that's expected, the structure you build now becomes the platform the next several years stand on.",
  },
  5: {
    title: "The Year of Change",
    theme: "Freedom, travel, major shifts",
    text: "Expect movement. Travel, relocation, career shifts, or sudden turning points are all more likely this year than usual, and even routines that have felt fixed for years may suddenly loosen. This is a genuinely good year for business, sales, marketing, and anything requiring visibility and adaptability, opportunities tend to appear unexpectedly rather than through careful planning. The caution is around impulsiveness: contracts, big purchases, and new commitments should be read carefully rather than signed in the heat of excitement, since this year's energy favors action over caution. Relationships may feel restless too, this isn't necessarily a year for settling down, more one for exploring. By year's end, most people look back and see this as one of the more eventful years in the whole 9-year cycle.",
  },
  6: {
    title: "The Year of Responsibility",
    theme: "Family, home, service",
    text: "Focus shifts firmly toward home, family, and personal obligations. Domestic matters that have lingered, a house move, a family responsibility, a relationship that needed attention, tend to resolve, often favorably, during this year. This is also a strong year for marriage, engagement, or deepening an existing partnership. Spending tends to rise, particularly on home comforts, beauty, and family-related expenses, so budgeting deliberately helps avoid regret later. Career-wise, service-oriented or people-facing work, teaching, healthcare, hospitality, counseling, tends to go especially well. Emotionally this is a warmer, more nurturing year than most, though it can also bring a sense of being pulled in several directions by competing family or community demands.",
  },
  7: {
    title: "The Year of Reflection",
    theme: "Introspection, research, spiritual growth",
    text: "An inward year, better suited to study, research, and spiritual or philosophical development than to aggressive external expansion. This is a strong year for anything requiring deep focus, writing a book, mastering a skill, or pursuing further education, and a weaker one for high-risk business moves or big public launches. Solitude tends to feel more comfortable than usual, and some withdrawal from social obligations is normal and even useful this year. Health-wise, mental and emotional wellbeing deserve more attention than physical performance goals. Financially, this is a year to be conservative rather than speculative. If the year feels quieter or slower than those around it, that's by design, a 7 year is meant to consolidate wisdom before the more active years that follow.",
  },
  8: {
    title: "The Year of Harvest",
    theme: "Career, finance, recognition",
    text: "A high-stakes year for career and money, effort put in during this year tends to compound strongly, for better or worse, making it one of the more consequential years in the cycle. Promotions, business growth, and financial gains are all more available now, but so are the costs of overextension, so ambition needs to be paired with realistic planning. Recognition from superiors, institutions, or the public is more likely this year than most. Health deserves real attention, since stress and overwork are common side effects of an 8 year's intensity. Legal and financial matters should be handled with extra care and proper documentation. Directed, disciplined ambition tends to produce this year's best and most lasting results.",
  },
  9: {
    title: "The Year of Completion",
    theme: "Closure, release, transition",
    text: "A closing chapter, the final year of the 9-year personal cycle, and it tends to feel that way. This is a strong year for finishing what's unresolved, letting go of relationships, habits, or commitments that no longer serve you, and clearing space ahead of a new cycle beginning next year. Emotionally it can be a reflective, sometimes bittersweet year, as endings of various kinds tend to surface. This is not the year to start major new ventures, those go better waited until next year's fresh 1-year cycle, but it's an excellent year for charitable work, generosity, and tying up loose ends. Financially, review and release rather than expand. By the end of a 9 year, most people feel a genuine sense of completion, ready for the new beginning that follows.",
  },
};

// Planet ruling each number 1-9 (standard Vedic numerology correspondence),
// used for the Dasha (numerology period) timeline.
export const PLANET_BY_NUMBER = {
  1: "Sun", 2: "Moon", 3: "Jupiter", 4: "Rahu", 5: "Mercury",
  6: "Venus", 7: "Ketu", 8: "Saturn", 9: "Mars",
};

// Original, detailed dasha (ruling-period) meanings by planet/number.
export const DASHA_MEANINGS = {
  1: "The Sun period brings focus to authority, recognition, and personal achievement. Dealings with government bodies, senior officials, or leadership roles tend to increase, and there's a stronger pull toward visibility and taking charge rather than staying in the background. This period favors those in management, public life, politics, or any role requiring confident decision-making. Self-respect and ego both tend to be more pronounced, a double-edged strength, since the same confidence that wins recognition can also create friction with authority figures if not tempered. Health-wise, the Sun rules vitality and the heart, so maintaining energy through good rest and diet supports the period's ambitions. Overall, this is a period to lead rather than follow, and to actively pursue the recognition this period makes more available.",
  2: "The Moon period brings emotional life, home, and the mother figure into sharper focus. Domestic comfort, family bonding, and emotional security become priorities, and matters connected to property, home renovation, or a house move often arise during this time. This period favors creative and imaginative pursuits, as the Moon governs intuition and the emotional mind. Relationships, especially with women, family members, or a nurturing figure, tend to deepen. Emotional sensitivity runs higher than usual, which can be a strength in relationships but may also mean mood fluctuates more than in other periods. Financially, this period tends to bring steady, if modest, gains connected to home or family assets. Overall, this is a period best spent nurturing what's close to home rather than chasing external ambition.",
  3: "The Jupiter period is one of expansion, in knowledge, finances, spirituality, and social standing. This is traditionally considered one of the more favorable periods in the numerology cycle, associated with higher education, respected positions, and growth in wealth. Interest in philosophy, spirituality, or teaching often surfaces strongly during this time, and guidance from mentors or elders proves unusually valuable. Marriage, childbirth, and other auspicious family events are common during a Jupiter period. Socially, this period tends to bring connections with influential, prosperous, or well-respected people. The main caution is overconfidence, Jupiter's expansive energy can tip into overcommitment if not paired with realistic planning. Overall, this period rewards genuine effort toward growth, learning, and building respected standing.",
  4: "The Rahu period is associated with sudden, often unconventional shifts, material gains or losses that arrive faster and less predictably than in other periods. Foreign travel, unconventional career paths, or unusual opportunities are common themes, and this period can bring rapid material progress for those who stay adaptable. However, Rahu's energy also creates a degree of illusion or confusion, so major decisions benefit from extra scrutiny and a second opinion before committing. Relationships can feel more complicated during this period, sometimes due to misunderstandings or unclear communication. Health-wise, this period calls for attention to stress and mental clarity, since Rahu's restless energy can affect sleep and focus. Overall, this is a period of real opportunity paired with real unpredictability, success comes to those who stay grounded amid the shifts.",
  5: "The Mercury period activates communication, intellect, and business acumen. This is a strong period for study, writing, negotiation, sales, and any work requiring clear thinking and articulate expression. New skills, further education, or a return to learning often appear as themes during this time. Business dealings, contracts, and partnerships tend to move faster and more favorably than usual, particularly in fields connected to media, technology, trade, or communication. Relationships benefit from open, honest dialogue, issues that have gone unspoken tend to surface and get resolved during this period. Health-wise, Mercury governs the nervous system, so mental overstimulation and anxiety are the main risks to manage. Overall, this period rewards sharp thinking, clear communication, and a willingness to keep learning.",
  6: "The Venus period brings comfort, luxury, relationships, and artistic pursuits to the forefront. This is traditionally one of the more pleasant periods in the numerology cycle, often bringing gains of valuable possessions, improved lifestyle, and general prosperity. Romantic relationships tend to flourish, and this period is favorable for marriage, engagement, or deepening an existing partnership. Creative and artistic pursuits, design, music, fashion, beauty, entertainment, receive a natural boost, and those working in these fields often see real career progress. Family wellbeing and domestic happiness both tend to improve. The main caution is overindulgence, Venus's pleasant energy can tip into overspending or excessive comfort-seeking if not balanced with discipline. Overall, this period rewards enjoying life's comforts while keeping half an eye on long-term stability.",
  7: "The Ketu period turns attention inward, favoring spiritual growth, introspection, and detachment from purely material pursuits. This period often brings an unexpected pull toward meditation, spiritual study, or a teacher or guru figure who becomes meaningful during this time. Material ambitions tend to progress more slowly, and forcing aggressive business or financial moves during this period rarely goes as planned, patience and inner work serve better than external hustle. Relationships may involve some distancing or a need for personal space, which is a natural feature of Ketu's detached energy rather than a sign anything is wrong. Health-wise, this period benefits from practices that calm the nervous system, and unexplained ailments sometimes appear that resolve once emotional or spiritual matters are addressed. Overall, this period rewards inner development over outer achievement.",
  8: "The Saturn period is demanding but ultimately rewarding for those who approach it with discipline. This period governs career, long-term structural change, and hard-earned material success, very little comes easily, but what is achieved tends to be lasting. Delays, obstacles, and slower-than-expected progress are common early in this period, testing patience and persistence. Financial and legal matters require careful, deliberate handling, since Saturn's energy punishes shortcuts and rewards diligence. Health needs consistent attention, particularly around joints, bones, and chronic stress-related conditions. Relationships benefit from taking on responsibility and following through on commitments rather than making grand promises. Overall, this is a period where sustained effort and patience are directly repaid, often later in the period than expected, but rarely without result.",
  9: "The Mars period brings energy, drive, and a heightened capacity for decisive action. Physical activity, sports, competitive pursuits, and any work requiring courage and initiative are all favored during this time. This period often brings conflict resolution, disputes that have lingered tend to come to a head and get settled, for better or worse, during a Mars period. Career-wise, fields connected to defense, engineering, sports, or anything requiring physical or competitive energy tend to do especially well. The main caution is impulsiveness and temper, Mars's fiery energy can lead to unnecessary conflict, accidents, or rushed decisions if not consciously managed. Financially, this period can bring both sudden gains and sudden expenses connected to property, vehicles, or urgent needs. Overall, this period rewards courage and decisive action, provided it's tempered with a measure of restraint.",
};

// Missing-number remedies — original wording, general practice guidance.
export const MISSING_NUMBER_REMEDIES = {
  1: "Strengthen the Sun: greet the sunrise when possible, offer water to the rising sun, and favor gold or copper accessories.",
  2: "Strengthen the Moon: keep a consistent sleep routine, favor silver accessories, and maintain calm, uncluttered home spaces.",
  3: "Strengthen Jupiter: dedicate time weekly to learning or teaching, favor yellow/gold tones, and support guru or mentor figures.",
  4: "Strengthen Rahu/stability: reduce clutter and unfinished tasks, avoid impulsive risk-taking, and keep important documents organized.",
  5: "Strengthen Mercury: practice clear daily communication, keep a tidy workspace, and favor green accents.",
  6: "Strengthen Venus: keep living spaces aesthetically pleasing, nurture close relationships deliberately, and favor white or pastel tones.",
  7: "Strengthen Ketu/introspection: build a short daily reflective or spiritual practice, and avoid overcommitting socially.",
  8: "Strengthen Saturn: build consistent daily discipline and routines, and be deliberate and fair in financial dealings.",
  9: "Strengthen Mars: build a regular physical exercise routine, channel drive into a defined goal, and avoid unnecessary conflict.",
};

// Compound Number (name) personality write-ups — longer original paragraphs,
// used for First Name Number and Full Name Number sections.
export const COMPOUND_NUMBER_TEXT = {
  1: "Number 1 names carry natural leadership energy. You tend to be confident, original, and independent-minded, with a strong drive to be first rather than to follow. You don't compromise easily and can come across as somewhat egoistic or stubborn when your ideas are challenged, though this same conviction is exactly what makes you effective in charge of a project or team. Recognition tends to come later rather than early, but once it arrives it tends to be substantial and well-earned.",
  2: "Number 2 names bring a gentle, diplomatic, and cooperative nature. You are sensitive to others' feelings, work best in partnership rather than alone, and have a natural gift for smoothing over conflict. Emotional security and close relationships matter a great deal to you, sometimes more than personal ambition. The challenge for a 2 name is decisiveness, you may second-guess yourself more than the situation calls for, though your patience and tact usually serve you well in the long run.",
  3: "Number 3 names carry warmth, creativity, and natural charm. You express yourself well, whether through speech, writing, or artistic pursuits, and tend to attract a wide social circle with relative ease. Optimism comes naturally to you, and you have a knack for making difficult situations feel lighter. The main challenge is focus, with so many interests competing for attention, follow-through can suffer unless you deliberately commit to fewer things at a time.",
  4: "Number 4 names bring practicality, discipline, and a strong work ethic. You build things to last, prefer proven methods over untested ones, and take your responsibilities seriously. Others rely on you precisely because you follow through when you say you will. The challenge is flexibility, a 4 name can resist change even when circumstances clearly call for it, and learning to adapt without abandoning your core discipline is the key growth area.",
  5: "Number 5 names carry restless energy, adaptability, and a genuine love of freedom. You think and move quickly, adjust to new situations with ease, and are drawn to variety over routine. This makes you well-suited to sales, travel, communication, and any field requiring quick adaptation. The challenge is commitment, a 5 name can struggle with follow-through on long-term obligations, whether in career or relationships, unless a genuine sense of purpose is attached to them.",
  6: "Number 6 names bring a deep sense of responsibility, harmony, and care for others. Family, home, and close relationships matter enormously to you, and you're often the one others turn to for support and stability. You have a natural eye for beauty and comfort, both in your surroundings and in how you present yourself. The challenge is over-giving, a 6 name can take on too much responsibility for others' wellbeing at the expense of their own needs.",
  7: "Number 7 names carry an analytical, introspective, and often spiritually inclined nature. You think deeply, prefer to understand things thoroughly before acting, and are drawn to research, study, or contemplative pursuits. Solitude doesn't bother you the way it does others, in fact, you often do your best thinking alone. The challenge is connection, a 7 name can become isolated if introspection tips into withdrawal from the people and opportunities around you.",
  8: "Number 8 names carry strong ambition, authority, and a drive toward material achievement. You think in terms of long-term goals and are willing to put in sustained effort to reach them, particularly in career and financial matters. Others often see you as capable of handling significant responsibility. The challenge is balance, an 8 name can become so focused on achievement that health, relationships, or personal wellbeing get neglected along the way.",
  9: "Number 9 names carry broad-minded compassion and idealism. You tend to think in terms of the bigger picture, humanity, causes, and long-term impact, rather than narrow self-interest, and you're often generous with your time, resources, and emotional support. The challenge is letting go, a 9 name can struggle to release relationships, situations, or past chapters that have clearly run their course, even when holding on no longer serves you.",
};

// Letter meanings (first-letter-of-name reading) — original text, A-Z.
export const LETTER_MEANINGS = {
  A: "A natural leader and initiator with strong original ideas. Honest and ambitious, though can tip into egoism under pressure. Multiple A's in a name only strengthen these traits further.",
  B: "Sensitive, cooperative, and detail-oriented. Works well in partnership and pays close attention to emotional undercurrents others miss.",
  C: "Expressive, creative, and socially confident. Draws people in easily but can scatter energy across too many interests at once.",
  D: "Practical, disciplined, and dependable. Prefers proven methods and steady progress over risky shortcuts.",
  E: "Freedom-loving, adaptable, and quick-witted. Restless if kept in one place or routine too long.",
  F: "Warm, family-oriented, and responsible. Takes care of others readily, sometimes at their own expense.",
  G: "Analytical and introspective, with a natural pull toward deeper questions and private reflection.",
  H: "Ambitious and authoritative, with strong material drive and a talent for long-term planning.",
  I: "Compassionate and idealistic, often drawn to causes bigger than personal gain.",
  J: "Determined and independent, similar in spirit to A, but with a more private, less outwardly assertive style.",
  K: "Diplomatic and perceptive, skilled at reading people and situations accurately.",
  L: "Charismatic communicator with strong creative instincts and natural stage presence.",
  M: "Grounded and hardworking, values security and tangible results over abstract ideas.",
  N: "Sensitive and idealistic, with strong intuition that often proves more reliable than pure logic.",
  O: "Generous and warm-hearted, drawn to nurturing roles and harmonious surroundings.",
  P: "Deep thinker with strong analytical ability, sometimes prone to overthinking decisions.",
  Q: "Independent and unconventional, comfortable charting a path others haven't tried.",
  R: "Confident and outspoken, natural at persuasion and public-facing roles.",
  S: "Adaptable and resourceful, thrives on variety and rarely stays still for long.",
  T: "Responsible and nurturing, often becomes the anchor point within family or team settings.",
  U: "Introspective and idealistic, drawn to meaning over material reward.",
  V: "Ambitious and driven, willing to work hard and long for a clearly defined goal.",
  W: "Freedom-seeking and versatile, adjusts to change faster than most.",
  X: "Intense and private, often carries hidden depths not obvious on first impression.",
  Y: "Creative and expressive, with an unconventional streak that sets them apart.",
  Z: "Determined and strong-willed, doesn't back down easily once committed to a course of action.",
};

// Trait phrases used to synthesize combination-of-numbers interpretations
// (e.g. "Your chart shows a combination of 1, 3").
export const TRAIT_PHRASES = {
  1: "confidence, independence, and leadership",
  2: "diplomacy, sensitivity, and partnership",
  3: "creativity, communication, and optimism",
  4: "discipline, structure, and practicality",
  5: "adaptability, freedom, and quick thinking",
  6: "responsibility, harmony, and nurturing",
  7: "introspection, analysis, and spirituality",
  8: "ambition, authority, and material drive",
  9: "compassion, idealism, and completion",
};

// ---------------------------------------------------------------------------
// Graha Maitri (Classical Planetary Friendship) — used for combination
// classification (Benefic/Malefic/Neutral), replacing the earlier simplified
// single-table approach. Each planet's view of every other planet is
// recorded independently (real Vedic astrology relationships are NOT
// symmetric — e.g. Mars considers Moon a friend, but Moon only considers
// Mars neutral). The two directions are then combined using the standard
// five-tier Panchadha Maitri rule before mapping down to Benefic/Neutral/
// Malefic for display.
//
// Number-to-planet mapping: 1=Sun, 2=Moon, 3=Jupiter, 4=Rahu, 5=Mercury,
// 6=Venus, 7=Ketu, 8=Saturn, 9=Mars.
//
// Rahu is treated per standard convention as behaving like Saturn. Ketu is
// treated as spiritually aligned with Mars/Jupiter and adversarial toward
// the luminaries (Sun/Moon) — this reflects the classical "Grahan Dosha"
// (eclipse affliction) doctrine, where Moon or Sun conjunct a lunar node is
// one of the most well-documented adversarial combinations in Vedic
// astrology. Only friends/enemies are listed per planet; anything not
// listed is neutral by default.
// ---------------------------------------------------------------------------
const GRAHA_MAITRI = {
  1: { friends: [2, 9, 3], enemies: [6, 8] },       // Sun
  2: { friends: [1, 5], enemies: [4, 7] },           // Moon (enemies: Rahu, Ketu — Grahan Dosha)
  3: { friends: [1, 2, 9], enemies: [5, 6] },        // Jupiter
  4: { friends: [5, 6, 8], enemies: [1, 2, 9] },     // Rahu (behaves like Saturn)
  5: { friends: [1, 6], enemies: [2] },              // Mercury
  6: { friends: [5, 8], enemies: [1, 2] },           // Venus
  7: { friends: [9, 3], enemies: [1, 2] },           // Ketu (allied with Mars/Jupiter, adversarial to luminaries)
  8: { friends: [5, 6, 4], enemies: [1, 2, 9] },     // Saturn
  9: { friends: [1, 2, 3], enemies: [5] },           // Mars
};

function relationOf(a, b) {
  const t = GRAHA_MAITRI[a];
  if (!t) return "Neutral";
  if (t.friends.includes(b)) return "Friend";
  if (t.enemies.includes(b)) return "Enemy";
  return "Neutral";
}

/**
 * Classifies how a pair of numbers relate, using the real directional Graha
 * Maitri table combined via the standard Panchadha Maitri rule:
 *   Friend+Friend -> Best Friend -> Benefic
 *   Friend+Neutral (either order) -> Friend -> Benefic
 *   Neutral+Neutral -> Neutral -> Neutral
 *   Friend+Enemy (either order) -> Neutral -> Neutral
 *   Neutral+Enemy (either order) -> Enemy -> Malefic
 *   Enemy+Enemy -> Bitter Enemy -> Malefic
 */
export function classifyPair(a, b) {
  if (a === b) return "Repeating";
  const aToB = relationOf(a, b);
  const bToA = relationOf(b, a);

  const rank = { Enemy: 0, Neutral: 1, Friend: 2 };
  const combinedRank = rank[aToB] + rank[bToA]; // 0-4

  if (combinedRank >= 3) return "Benefic";   // Friend+Friend or Friend+Neutral
  if (combinedRank === 2) return "Neutral";  // Neutral+Neutral or Friend+Enemy
  return "Malefic";                          // Neutral+Enemy or Enemy+Enemy
}

// Curated combination paragraphs for commonly-occurring pairs/triples —
// original wording, keyed by the sorted digit sequence (e.g. "1,3", "1,3,9").
// Falls back to the synthesized version below for anything not covered.
export const CURATED_COMBINATION_TEXT = {
  "1,3": "This pairing brings together leadership drive with wisdom and higher learning. You're drawn toward multiple subjects at once and often pursue higher education or self-directed study well beyond what's required. Management ability comes naturally, and there's a real pull toward astrology, spirituality, or occult sciences. Achievement tends to come through your own sustained effort rather than luck, and strong family loyalty runs alongside your ambition.",
  "1,9": "Two fire-natured numbers together create intensity — strong willpower, sharp administrative instinct, and a real capacity to push projects through to completion. The same fire that drives your ambition can also show up as a short temper or health patterns linked to excess heat, so a cooling, patient approach to conflict serves you well. You tend to dislike working under others and do best with real autonomy.",
  "3,6": "Life tends to shift meaningfully after a major partnership or marriage with this combination — for better or for constrained, depending on how consciously it's approached. Family and close relationships weigh heavily in every decision you make. You express yourself well through language, and steady cash flow tends to follow. Careers built on communication, performance, or knowledge-sharing fit particularly well.",
  "1,7": "A fortunate combination overall — strong intuition and a natural feel for timing that tends to work in your favor. The friction point is domestic stability: this pairing is associated with complications in marital life, sometimes more than one significant relationship across a lifetime. Spiritual inclination runs alongside worldly success, and travel — for business or pleasure — features prominently.",
  "6,7": "An action-oriented, opportunistic combination — you notice openings quickly and move on them before others do. Comfort and luxury matter to you, and you have a genuine appreciation for music and the arts. The relationship risk here is real: attraction outside a committed partnership is a documented pattern with this combination, and love matches tend to work out better than arranged ones for people carrying this pairing.",
  "1,3,9": "Three numbers with real synergy — solid education, natural administrative and management ability, and a pull toward spiritual or philosophical subjects. The 1-9 fire combination inside this trio means quick temper and strong ego are both live risks, but so is real willpower: very little stands in the way of a goal once you've committed to it.",
  "1,6,7": "Career here tends to see genuine ups and downs rather than a steady climb. Financial planning and money management aren't usually a strong natural interest, and domestic/married life tends to take a back seat to a simpler, more independent lifestyle preference.",
  "1,7,9": "A combination built for success through honor and recognition, not shortcuts. There's a bold, sometimes aggressive edge to how you pursue goals, backed by real willpower and a genuine appetite for calculated risk. Settling or relocating abroad is a recurring theme for people carrying this trio.",
};

// Synthesizes an original interpretation for a set of 2-3 numbers appearing together.
// Checks the curated library first (real hand-written paragraphs for common
// combinations); falls back to trait-blend synthesis for anything not covered.
export function combinationMeaning(numbers) {
  const key = [...numbers].sort((a, b) => a - b).join(",");
  if (CURATED_COMBINATION_TEXT[key]) return CURATED_COMBINATION_TEXT[key];

  const traits = numbers.map((n) => TRAIT_PHRASES[n]).join("; blended with ");
  let pairText = "";
  if (numbers.length === 2) {
    const cls = classifyPair(numbers[0], numbers[1]);
    if (cls === "Benefic") pairText = "These energies generally reinforce each other, making this a favorable combination.";
    else if (cls === "Malefic") pairText = "There is some inherent tension between these energies, so conscious balancing is recommended.";
    else if (cls === "Repeating") pairText = "This number appearing more than once amplifies its traits, for better and for worse.";
    else pairText = "This is a workable, largely neutral combination.";
  }
  return `This combination reflects ${traits}. ${pairText}`.trim();
}

// General digit meanings — used for both Name Numbers and Mobile digits.
export const NUMBER_MEANINGS = {
  1: "Leadership, independence, confidence. Can tip into stubbornness or ego if unbalanced.",
  2: "Diplomacy, sensitivity, cooperation. Strong in partnership; can be indecisive alone.",
  3: "Creativity, communication, optimism. Expressive and social, but can scatter focus.",
  4: "Discipline, structure, practicality. Reliable and hardworking, but can resist change.",
  5: "Freedom, adaptability, versatility. Quick thinking, but prone to restlessness.",
  6: "Responsibility, harmony, nurturing. Family and aesthetics matter deeply; can overgive.",
  7: "Analysis, introspection, spirituality. Deep thinker, but can become isolated.",
  8: "Ambition, authority, material achievement. Strong drive; needs balance to avoid burnout.",
  9: "Compassion, idealism, completion. Broad-minded, but can struggle with letting go.",
};

// Looks up whether `num` is Friendly / Enemy / Neutral to the given Moolank.
export function getCompatibility(num, moolank) {
  const table = MOOLANK_COMPATIBILITY[moolank];
  if (!table) return "Unknown";
  if (table.friendly.includes(num)) return "Friendly";
  if (table.enemy.includes(num)) return "Enemy (Anti)";
  return "Neutral";
}

// "Appearing more than once" — a distinct content layer from the base
// single-instance NUMBER_MEANINGS, triggered whenever a digit's count in
// the relevant set (birth digits or mobile digits) is 2 or more.
export const REPEATING_NUMBER_TEXT = {
  1: "With 1 appearing more than once, your independence and leadership instinct are amplified — strong self-belief, a real dislike of being told what to do, and a tendency to push through obstacles on sheer will. The flip side is a stronger pull toward ego and stubbornness, so consciously staying open to feedback matters more for you than for most.",
  2: "With 2 appearing more than once, sensitivity runs high — you may feel things more intensely than you let on, and a need for extra encouragement to follow through on plans is common. Your aesthetic sense and creative instincts are genuinely strong, and you tend to be soft-spoken but deeply attractive in presence.",
  3: "With 3 appearing more than once, communication and self-expression are a major life theme — writing, speaking, or teaching often come easily. Knowledge and wisdom accumulate faster than average for you, though the flip side is a risk of scattering energy across too many pursuits without following through on any single one.",
  4: "With 4 appearing more than once, discipline and structure become core to your identity — you're research-minded, practical, and resistant to waste. Mood can swing more than expected, and there's a tendency toward restless, purposeless travel if this energy isn't channeled into a concrete project.",
  5: "With 5 appearing more than once, the risk of being cheated — or of cheating others, knowingly or not — rises, along with a heightened relationship to money and calculation. You think from the head more than the heart, speak plainly and directly, and may need to consciously build in more emotional consideration in close relationships.",
  6: "With 6 appearing more than once, charm, love of luxury, and social magnetism intensify — a wide circle of friends and strong attraction to the opposite sex are common. Watch for a tendency toward blunt or careless speech, and be deliberate about protecting a committed relationship from outside temptation.",
  7: "With 7 appearing more than once, introspection and spiritual inclination deepen significantly — you may find yourself drawn to research, philosophy, or solitary pursuits more than most. Isolation is the real risk here: make sure depth of thought doesn't tip into disconnection from people who matter to you.",
  8: "With 8 appearing more than once, material ambition and a sense of justice both intensify — you take achievement seriously and expect fairness in return. Life may bring more than the average share of struggle and delay, with a tendency to swing between deep highs and lows, but the underlying drive and work ethic are genuinely strong.",
  9: "With 9 appearing more than once, energy, boldness, and a humanitarian streak all amplify — high drive, real courage, and a genuine wish to contribute to something bigger than yourself. The same intensity can show up as stubbornness or a quick temper, so this is a combination that rewards consciously directed action over impulsive reaction.",
};

// ---------------------------------------------------------------------------
// Affirmations Module — matched to the client's selected "Area of Struggle"
// (Health / Relationship / Career / Money / Job). Original first-person
// affirmation text, in the same spirit as the reference reports' format.
// ---------------------------------------------------------------------------
export const AFFIRMATIONS = {
  Health: "I am healthy and full of energy. Healthy, vibrant energy flows through my body naturally. I easily attract good and positive energy to my mind, body, and soul. I welcome positive and healthy energy with open arms. Every day is an opportunity to enjoy new levels of energy and wellbeing. It comes naturally for me to feel good and healthy. I am a magnet for healthy, uplifting, and empowering energy.",
  Relationship: "I deserve real and authentic love. I know what I want, and I communicate my needs clearly. I respect myself, and because of that, others respect me too. I am building authentic connections, and I date with confidence, knowing the right person will see me for who I am. I welcome love into my life. I am worthy of a partner who values and appreciates me fully. I am at peace, knowing love comes naturally to me in its own time.",
  Career: "There are many genuine career opportunities available to me. I am well qualified for the work I want to do, and I am confident in my skills and knowledge. My voice and ideas are valued at my workplace. I bring unique strengths that are a real asset wherever I work. I attract clients, colleagues, and opportunities that recognize and reward the value I bring.",
  Money: "I experience wealth as a natural part of a well-lived life. I am capable of working through any financial obstacle in front of me. I commit to building toward my financial goals step by step. It is realistic and achievable for me to become prosperous through consistent effort. I am always open to discovering new, legitimate sources of income. I deserve to be paid fairly for the value I create.",
  Job: "I am energized by every step that moves me toward the right career. I am actively and confidently pursuing opportunities that fit my talents. I stay open to new possibilities, including ones I haven't considered yet. I am taking real, concrete steps toward the work I want. I trust that consistent effort will lead me to the right opportunity at the right time.",
};
