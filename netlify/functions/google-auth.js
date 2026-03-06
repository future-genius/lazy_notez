const GOOGLE_CLIENT_ID =
  process.env.GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID ||
  "702960286853-skkvdqed3ajop543nkjih3ubd345ct50.apps.googleusercontent.com";
const ADMIN_EMAIL = "projectlazynotez@gmail.com";

const json = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
  },
  body: JSON.stringify(body)
});

const normalizeUsername = (email) =>
  (email || "user")
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24) || "user";

export const handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }

  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed" });
  }

  try {
    const parsedBody = event.body ? JSON.parse(event.body) : {};
    const token = parsedBody?.token;
    if (!token) {
      return json(400, { message: "Google token is required" });
    }

    const verifyResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
    );

    if (!verifyResponse.ok) {
      return json(401, { message: "Invalid Google token" });
    }

    const payload = await verifyResponse.json();
    if (payload?.aud !== GOOGLE_CLIENT_ID) {
      return json(401, { message: "Google token audience mismatch" });
    }
    if (!payload?.email || payload?.email_verified !== "true") {
      return json(401, { message: "Google email is not verified" });
    }

    const email = payload.email.toLowerCase();
    const role = email === ADMIN_EMAIL ? "admin" : "user";
    const user = {
      id: payload.sub,
      user_id: payload.sub,
      email,
      name: payload.name || normalizeUsername(email),
      username: normalizeUsername(email),
      picture: payload.picture || "",
      login_method: "google",
      role
    };

    return json(200, { user });
  } catch (error) {
    return json(500, { message: "Google authentication failed" });
  }
};
