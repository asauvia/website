import { z } from "zod";
import { EXPERIENCE_LEVELS, openRoles } from "@/data/careers";
import { clientIp, rateLimited, verifyTurnstile } from "@/lib/request-guards";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const GENERAL = "general";
const ROLE_SLUGS = [GENERAL, ...openRoles.map((role) => role.slug)] as [string, ...string[]];

const optionalText = (max: number) => z.string().trim().max(max).optional().default("");

const applicationSchema = z.object({
  name: z.string("Enter your name").trim().min(1, "Enter your name").max(120),
  email: z.string("Enter a valid email").trim().max(254).pipe(z.email("Enter a valid email")),
  phone: z
    .string()
    .trim()
    .max(40)
    .regex(/^[+\d\s()-]*$/, "Use digits, spaces, + and - only")
    .optional()
    .default(""),
  location: z.string("Enter your country or city").trim().min(2, "Enter your country or city").max(120),
  role: z.enum(ROLE_SLUGS, "Choose a role"),
  experience: z.enum(EXPERIENCE_LEVELS, "Choose your experience level"),
  portfolio: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default("")
    .refine((value) => value === "" || /^https?:\/\//i.test(value), "Start with http:// or https://"),
  message: optionalText(3000),
  website: z.string().max(200).optional().default(""),
  "cf-turnstile-response": optionalText(4096),
});

type ApplicationPayload = z.infer<typeof applicationSchema>;

function roleTitle(slug: string) {
  if (slug === GENERAL) return "General application";
  return openRoles.find((role) => role.slug === slug)?.title ?? slug;
}

function safeFilename(name: string) {
  const base = name.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 100);
  return base || "resume";
}

/** Returns the resume as a base64 attachment, or a field error message. */
type ResumeResult = { error: string } | { attachment: { filename: string; content: string } };

async function readResume(value: FormDataEntryValue | null): Promise<ResumeResult> {
  if (!(value instanceof File) || value.size === 0) return { error: "Attach your CV or resume" };
  if (value.size > MAX_RESUME_BYTES) return { error: "Your CV must be 5 MB or smaller" };
  const extension = value.name.split(".").pop()?.toLowerCase() ?? "";
  const expectedType = RESUME_TYPES[extension];
  if (!expectedType) return { error: "Upload a PDF, DOC or DOCX file" };
  const bytes = Buffer.from(await value.arrayBuffer());
  if (extension === "pdf" && !bytes.subarray(0, 5).toString("latin1").startsWith("%PDF")) {
    return { error: "This file does not look like a PDF" };
  }
  return { attachment: { filename: safeFilename(value.name), content: bytes.toString("base64") } };
}

/** Every application email is marked so it can't be confused with a direct email to the inbox. */
const SOURCE = "Website careers form (asauvia.com/careers)";

function emailBody(data: ApplicationPayload, receivedAt: Date) {
  const line = (label: string, value: string) => `${label}: ${value || "—"}`;
  const ist = receivedAt.toLocaleString("en-GB", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" });
  return [
    line("Source", SOURCE),
    line("Received", `${ist} IST`),
    "",
    line("Name", data.name),
    line("Email", data.email),
    line("Phone", data.phone),
    line("Location", data.location),
    line("Role", roleTitle(data.role)),
    line("Experience", data.experience),
    line("Portfolio / LinkedIn", data.portfolio),
    "",
    "Cover note:",
    data.message || "—",
    "",
    "The CV is attached to this email.",
  ].join("\n");
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "invalid", fields: { form: "Send the application as a form" } }, { status: 400 });
  }

  const fields = Object.fromEntries(
    [...form.entries()].filter(([, value]) => typeof value === "string"),
  ) as Record<string, string>;

  if (fields.website && fields.website.trim() !== "") {
    return Response.json({ ok: true });
  }

  const ip = clientIp(request);
  if (rateLimited(ip)) {
    return Response.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = applicationSchema.safeParse(fields);
  const resume = await readResume(form.get("resume"));

  if (!parsed.success || "error" in resume) {
    const errors: Record<string, string> = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
    }
    if ("error" in resume) errors.resume = resume.error;
    return Response.json({ error: "invalid", fields: errors }, { status: 400 });
  }
  const data = parsed.data;

  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret) {
    const ok = await verifyTurnstile(turnstileSecret, data["cf-turnstile-response"], ip);
    if (!ok) return Response.json({ error: "verification_failed" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  // Applications go to the careers inbox when one is set, otherwise to the general contact inbox.
  const to = process.env.CAREERS_TO_EMAIL || process.env.CONTACT_TO_EMAIL;
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
        subject: `[Career application] ${roleTitle(data.role)} — ${data.name}`.replace(/[\r\n]+/g, " "),
        text: emailBody(data, new Date()),
        attachments: [resume.attachment],
        headers: { "X-Asauvia-Source": "website-careers-form" },
        tags: [{ name: "source", value: "website_careers_form" }],
      }),
    });
    if (!res.ok) {
      console.error(`[careers] email provider responded ${res.status}`);
      return Response.json({ error: "send_failed" }, { status: 502 });
    }
  } catch {
    console.error("[careers] email provider request failed");
    return Response.json({ error: "send_failed" }, { status: 502 });
  }

  return Response.json({ ok: true });
}
