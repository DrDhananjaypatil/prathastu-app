import { computeBirthChart } from "@/lib/astrology";

export async function POST(req) {
  try {
    const body = await req.json();
    const { dob, timeOfBirth, latitude, longitude, tzOffsetHours } = body;
    if (!dob) {
      return Response.json({ error: "Date of birth is required." }, { status: 400 });
    }
    const chart = computeBirthChart({
      dob,
      timeOfBirth,
      latitude: latitude !== undefined && latitude !== "" ? parseFloat(latitude) : null,
      longitude: longitude !== undefined && longitude !== "" ? parseFloat(longitude) : null,
      tzOffsetHours: tzOffsetHours !== undefined && tzOffsetHours !== "" ? parseFloat(tzOffsetHours) : 5.5,
    });
    return Response.json({ chart });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
