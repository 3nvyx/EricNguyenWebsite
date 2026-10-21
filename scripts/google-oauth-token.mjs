#!/usr/bin/env node
/**
 * One-time helper: gets the Google OAuth refresh token the coffee chat booking uses to act as
 * Eric. See .env.example for the Google Cloud setup, then:
 *
 *   GOOGLE_OAUTH_CLIENT_ID=… GOOGLE_OAUTH_CLIENT_SECRET=… node scripts/google-oauth-token.mjs
 *
 * Opens the consent screen, catches the redirect on localhost:53682, and prints the token.
 */
import http from "node:http";
import { exec } from "node:child_process";

const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!id || !secret) {
  console.error("Set GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET first.");
  process.exit(1);
}

const PORT = 53682;
const redirect = `http://localhost:${PORT}/callback`;
const scopes = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.freebusy",
];
const consent = new URL("https://accounts.google.com/o/oauth2/v2/auth");
consent.search = new URLSearchParams({
  client_id: id,
  redirect_uri: redirect,
  response_type: "code",
  access_type: "offline",
  prompt: "consent",
  scope: scopes.join(" "),
}).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirect);
  if (url.pathname !== "/callback") return res.end();
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  if (!code) {
    res.end(`No code: ${error ?? "unknown error"}`);
    console.error("Consent failed:", error);
    server.close();
    return;
  }
  const token = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirect,
      grant_type: "authorization_code",
    }),
  }).then((r) => r.json());
  if (!token.refresh_token) {
    res.end("No refresh token returned; check the terminal.");
    console.error("Token response:", token);
  } else {
    res.end("Done. You can close this tab.");
    console.log(`\nGOOGLE_OAUTH_REFRESH_TOKEN=${token.refresh_token}\n`);
  }
  server.close();
});

server.listen(PORT, () => {
  console.log("Opening Google consent screen… (sign in as envn001@gmail.com)");
  console.log(consent.toString());
  if (!process.env.NO_OPEN) exec(`open "${consent}"`);
});
