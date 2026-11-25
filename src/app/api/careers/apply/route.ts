import { randomUUID } from "node:crypto";
import { z } from "zod";
import { EXPERIENCE_LEVELS, openRoles } from "@/data/careers";
import { clientIp, rateLimited, verifyTurnstile } from "@/lib/request-guards";
import { careerSheetConfig, saveApplication } from "@/lib/career-sheet";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};
const GENERAL = "general";
const ROLE_SLUGS = [GENERAL, ...openRoles.map((role) => role.slug)] as [string, ...string[]];
const SOURCE = "Website careers form (asauvia.com/careers)";

/** Column order of the Google Sheet. Written as the header row only when the sheet is empty. */
const HEADER = [
  "Submission ID",
  "Date (IST)",
  "Time (IST)",
  "Name",
  "Email",
  "Phone",
  "Country or city",
  "Role",
  "Experience",
  "Portfolio / LinkedIn",
  "Cover note",
  "CV file name",
  "CV link",
  "Source",
];

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

type ResumeFile = { name: string; mimeType: string; bytes: Buffer };
type ResumeResult = { error: string } | { file: ResumeFile };

async function readResume(value: FormDataEntryValue | null): Promise<ResumeResult> {
  if (!(value instanceof File) || value.size === 0) return { error: "Attach your CV or resume" };
  if (value.size > MAX_RESUME_BYTES) return { error: "Your CV must be 5 MB or smaller" };
  const extension = value.name.split(".").pop()?.toLowerCase() ?? "";
  const mimeType = RESUME_TYPES[extension];
  if (!mimeType) return { error: "Upload a PDF, DOC or DOCX file" };
  const bytes = Buffer.from(await value.arrayBuffer());
  if (extension === "pdf" && !bytes.subarray(0, 5).toString("latin1").startsWith("%PDF")) {
    return { error: "This file does not look like a PDF" };
  }
  return { file: { name: safeFilename(value.name), mimeType, bytes } };
}

function sheetRow(id: string, data: ApplicationPayload, cvName: string, cvLink: string, receivedAt: Date) {
  const date = receivedAt.toLocaleDateString("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", year: "numeric" });
  const time = receivedAt.toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false });
  return [
    id,
    date,
    time,
    data.name,
    data.email,
    data.phone,
    data.location,
    roleTitle(data.role),
    data.experience,
    data.portfolio,
    data.message,
    cvName,
    cvLink,
    SOURCE,
  ];
}

/** Plain-text acknowledgement for the applicant. It states only what has happened: the application was received. */
function acknowledgement(data: ApplicationPayload, id: string, from: string) {
  const role = roleTitle(data.role);
  const firstName = data.name.split(/\s+/)[0];
  return {
    to: data.email,
    from,
    name: "Asauvia Careers",
    replyTo: from,
    subject: `We received your application: ${role}`.replace(/[\r\n]+/g, " "),
    body: [
      `Hi ${firstName},`,
      "",
      `Thank you for applying for ${role} at Asauvia. This email confirms that we have received your application (reference ${id}).`,
      "",
      "Our team will review it, and we will contact you at this email address if we would like to take it forward.",
      "",
      "If you need to add or correct anything, reply to this email and quote your reference.",
      "",
      "Regards,",
      "Asauvia Careers",
      "",
      "This is an automated confirmation.",
    ].join("\n"),
  };
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

  const config = careerSheetConfig();
  if (!config) {
    console.error("[careers] CAREERS_SHEET_URL / CAREERS_SHEET_SECRET are not set");
    return Response.json({ error: "not_configured" }, { status: 503 });
  }

  const receivedAt = new Date();
  const submissionId = `APP-${receivedAt.toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8)}`;

  // Acknowledgement goes to the applicant's address, from CAREERS_TO_EMAIL. Without that variable no email is attempted.
  const sender = process.env.CAREERS_TO_EMAIL?.trim();
  let emailSent = false;

  try {
    // The script stores the CV in Drive and fills the "CV link" cell itself, so that cell is left empty here.
    const saved = await saveApplication(config, {
      header: HEADER,
      row: sheetRow(submissionId, data, resume.file.name, "", receivedAt),
      cv: {
        name: `${submissionId}-${resume.file.name}`,
        mimeType: resume.file.mimeType,
        base64: resume.file.bytes.toString("base64"),
      },
      ...(sender && { ack: acknowledgement(data, submissionId, sender) }),
    });
    emailSent = saved.emailSent;
    if (sender && !saved.emailSent) {
      const reason = saved.emailReported
        ? saved.emailError || "the script reported a failure without an error message"
        : "the deployed Apps Script returned no email result, so it is still the old version. In Apps Script use Deploy > Manage deployments > Edit > New version and approve the Gmail permission";
      console.error(`[careers] ${submissionId} saved, but the acknowledgement email was not sent. Error: ${reason}`);
    } else if (saved.emailSent && saved.emailFrom.toLowerCase() !== sender?.toLowerCase()) {
      console.warn(`[careers] acknowledgement for ${submissionId} was sent from ${saved.emailFrom}, not ${sender}; add ${sender} as a Gmail "Send mail as" alias on that Google account`);
    }
  } catch (error) {
    console.error(`[careers] save failed for ${submissionId}: ${error instanceof Error ? error.message : error}`);
    return Response.json({ error: "save_failed" }, { status: 502 });
  }

  return Response.json({ ok: true, id: submissionId, emailSent });
}
