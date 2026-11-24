import { z } from "zod";
import { serviceCatalog } from "@/data/service-catalog";
import { clientIp, rateLimited, verifyTurnstile } from "@/lib/request-guards";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Netherlands",
  "Ireland",
  "Singapore",
  "United Arab Emirates",
  "India",
  "Other",
] as const;

const SERVICES: [string, ...string[]] = ["Something else", ...serviceCatalog.map((service) => service.name)];

const TIMELINES = ["As soon as possible", "Within 3 months", "3–6 months", "Just exploring"] as const;

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const contactSchema = z.object({
  name: z.string("Enter your name").trim().min(1, "Enter your name").max(120),
  email: z.string("Enter a valid work email").trim().max(254).pipe(z.email("Enter a valid work email")),
  company: optionalText(160),
  country: z.enum(COUNTRIES, "Choose your country"),
  service: z.enum(SERVICES, "Choose what you need help with"),
  message: z.string("Enter a message").trim().min(20, "Tell us a little more (at least 20 characters)").max(5000),
  timeline: z.union([z.enum(TIMELINES), z.literal("")]).optional().default(""),
  budget: optionalText(120),
  website: z.string().max(200).optional().default(""),
  utm_source: optionalText(200),
  utm_medium: optionalText(200),
  utm_campaign: optionalText(200),
  landing_page: optionalText(500),
  referrer: optionalText(500),
  "cf-turnstile-response": optionalText(4096),
});

type ContactPayload = z.infer<typeof contactSchema>;

/** Every form email is marked so it can't be confused with someone emailing the inbox directly. */
const SOURCE = "Website contact form (asauvia.com/contact)";

function emailBody(data: ContactPayload, receivedAt: Date) {
  const line = (label: string, value: string) => `${label}: ${value || "—"}`;
  const ist = receivedAt.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return [
    line("Source", SOURCE),
    line("Received", `${ist} IST`),
    "",
    line("Name", data.name),
    line("Work email", data.email),
    line("Company", data.company),
    line("Country", data.country),
    line("Service", data.service),
    line("Timeline", data.timeline),
    line("Budget", data.budget),
    "",
    "Message:",
    data.message,
    "",
    "Context",
    line("Landing page", data.landing_page),
    line("Referrer", data.referrer),
    line("utm_source", data.utm_source),
    line("utm_medium", data.utm_medium),
    line("utm_campaign", data.utm_campaign),
  ].join("\n");
}

export async function POST(request: Request) {
  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return Response.json({ error: "invalid", fields: { form: "Request body must be JSON" } }, { status: 400 });
  }

  if (json && typeof json === "object" && "website" in json) {
    const honeypot = (json as { website?: unknown }).website;
    if (typeof honeypot === "string" && honeypot.trim() !== "") {
      return Response.json({ ok: true });
    }
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = contactSchema.safeParse(json);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fields[key]) fields[key] = issue.message;
    }
    return Response.json({ error: "invalid", fields }, { status: 400 });
  }
  const data = parsed.data;

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const ok = await verifyTurnstile(turnstileSecret, data["cf-turnstile-response"], ip);
    if (!ok) return Response.json({ error: "verification_failed" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) {
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Asauvia Website <onboarding@resend.dev>",
        to: [to],
        reply_to: data.email,
        subject: `[Website form] ${data.service} — ${data.name}`.replace(/[\r\n]+/g, " "),
        text: emailBody(data, new Date()),
        headers: { "X-Asauvia-Source": "website-contact-form" },
        tags: [{ name: "source", value: "website_contact_form" }],
      }),
    });
    if (!res.ok) {
      console.error(`[contact] email provider responded ${res.status}`);
      return Response.json({ error: "send_failed" }, { status: 502 });
    }
  } catch {
    console.error("[contact] email provider request failed");
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
