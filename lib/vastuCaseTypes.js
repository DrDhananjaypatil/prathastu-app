// Starter list of standard Vastu site-visit case types.
// Each has a short set of template prompts so the on-site report
// isn't written from a blank page. Edit/extend freely as you refine your practice.

export const VASTU_CASE_TYPES = [
  {
    id: "main_entrance",
    label: "Main Entrance / Door Direction",
    promptFields: ["Facing direction", "Door position on wall", "Obstructions outside", "Recommended remedy"],
  },
  {
    id: "kitchen",
    label: "Kitchen Placement",
    promptFields: ["Current zone", "Stove facing direction", "Sink placement", "Recommended remedy"],
  },
  {
    id: "master_bedroom",
    label: "Master Bedroom Position",
    promptFields: ["Current zone", "Bed placement/direction", "Mirror placement", "Recommended remedy"],
  },
  {
    id: "pooja_room",
    label: "Pooja Room / Sacred Space",
    promptFields: ["Current zone", "Idol facing direction", "Recommended remedy"],
  },
  {
    id: "toilet_bathroom",
    label: "Toilet & Bathroom Placement",
    promptFields: ["Current zone", "Adjacent rooms", "Recommended remedy"],
  },
  {
    id: "staircase",
    label: "Staircase Direction",
    promptFields: ["Current zone", "Direction of ascent", "Recommended remedy"],
  },
  {
    id: "water_source",
    label: "Water Source / Underground Tank",
    promptFields: ["Current zone", "Tank type", "Recommended remedy"],
  },
  {
    id: "office_cash_locker",
    label: "Office Desk & Cash Locker Direction",
    promptFields: ["Desk facing direction", "Locker zone", "Recommended remedy"],
  },
  {
    id: "boundary_wall",
    label: "Boundary Wall & Compound",
    promptFields: ["Plot shape", "Wall height uniformity", "Recommended remedy"],
  },
  {
    id: "full_audit",
    label: "Full Property Vastu Audit (all-in-one)",
    promptFields: ["Zone-by-zone summary", "Priority issues", "Overall remedy plan"],
  },
  {
    id: "plot_selection",
    label: "Plot Selection (pre-purchase)",
    promptFields: ["Plot shape", "Road direction", "Slope direction", "Recommendation"],
  },
  {
    id: "renovation_remedy",
    label: "Renovation / Remedy Consultation",
    promptFields: ["Issue reported", "Zone affected", "Recommended remedy"],
  },
];

export function getCaseTypeById(id) {
  return VASTU_CASE_TYPES.find((c) => c.id === id);
}
