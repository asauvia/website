"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import Script from "next/script";
import { ArrowRight } from "lucide-react";
import { EXPERIENCE_LEVELS, openRoles } from "@/data/careers";
import { cn } from "@/lib/utils";

const GENERAL = "general";
const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ["pdf", "doc", "docx"];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Values = {
  name: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  experience: string;
  portfolio: string;
  message: string;
};
type Field = keyof Values | "resume";
type Errors = Partial<Record<Field, string>>;
type Status = "idle" | "submitting" | "success" | "not_configured" | "rate_limited" | "error";

const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, options: { sitekey: string; "response-field-name"?: string }) => string;
      reset: (id?: string) => void;
    };
  }
}

const inputClass =
  "h-12 w-full rounded-none border border-foreground/15 bg-transparent px-4 text-base text-foreground transition-colors placeholder:text-muted-foreground/60 hover:border-foreground/30 focus:border-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground aria-[invalid=true]:border-red-600";

function validate(values: Values, resume: File | null): Errors {
  const errors: Errors = {};
  if (!values.name.trim()) errors.name = "Enter your name";
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = "Enter a valid email";
  if (values.phone && !/^[+\d\s()-]*$/.test(values.phone)) errors.phone = "Use digits, spaces, + and - only";
  if (values.location.trim().length < 2) errors.location = "Enter your country or city";
  if (!values.role) errors.role = "Choose a role";
  if (!values.experience) errors.experience = "Choose your experience level";
  if (values.portfolio && !/^https?:\/\//i.test(values.portfolio.trim())) {
    errors.portfolio = "Start with http:// or https://";
  }
  if (values.message.length > 3000) errors.message = "Keep this under 3,000 characters";
  if (!resume) errors.resume = "Attach your CV or resume";
  else if (resume.size > MAX_RESUME_BYTES) errors.resume = "Your CV must be 5 MB or smaller";
  else if (!ACCEPTED_EXTENSIONS.includes(resume.name.split(".").pop()?.toLowerCase() ?? "")) {
    errors.resume = "Upload a PDF, DOC or DOCX file";
  }
  return errors;
}

function FieldShell({
  id,
  label,
  optional,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {optional ? <span className="ml-2 font-normal text-muted-foreground">Optional</span> : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ApplicationForm({ defaultRole = GENERAL }: { defaultRole?: string }) {
  const initialValues: Values = {
    name: "",
    email: "",
    phone: "",
    location: "",
    role: defaultRole,
    experience: "",
    portfolio: "",
    message: "",
  };
  const [values, setValues] = useState<Values>(initialValues);
  const [resume, setResume] = useState<File | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [submittedName, setSubmittedName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileId = useRef<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  const renderTurnstile = () => {
    if (!turnstileSiteKey || !turnstileRef.current || !window.turnstile) return;
    if (turnstileRef.current.childElementCount > 0) return;
    turnstileId.current = window.turnstile.render(turnstileRef.current, { sitekey: turnstileSiteKey });
  };

  const update =
    (field: keyof Values) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const value = event.target.value;
      setValues((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const onResume = (event: ChangeEvent<HTMLInputElement>) => {
    setResume(event.target.files?.[0] ?? null);
    if (errors.resume) setErrors((prev) => ({ ...prev, resume: undefined }));
  };

  const describedBy = (field: Field, hasHint = false) => {
    if (errors[field]) return `${field}-error`;
    return hasHint ? `${field}-hint` : undefined;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "submitting" || !formRef.current) return;

    const next = validate(values, resume);
    if (Object.keys(next).length > 0) {
      setErrors(next);
      const first = (Object.keys(initialValues) as Field[]).concat("resume").find((key) => next[key]);
      if (first) formRef.current.querySelector<HTMLElement>(`#${first}`)?.focus();
      return;
    }

    setErrors({});
    setStatus("submitting");

    // FormData from the form includes the honeypot and the Turnstile token automatically.
    const payload = new FormData(formRef.current);
    payload.set("name", values.name.trim());
    payload.set("email", values.email.trim());
    payload.set("location", values.location.trim());
    payload.set("portfolio", values.portfolio.trim());
    if (resume) payload.set("resume", resume);

    try {
      const res = await fetch("/api/careers/apply", { method: "POST", body: payload });
      if (res.ok) {
        setSubmittedName(values.name.trim().split(/\s+/)[0]);
        setStatus("success");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Errors };
      if (res.status === 503 && data.error === "not_configured") {
        setStatus("not_configured");
        return;
      }
      if (res.status === 429) {
        setStatus("rate_limited");
        return;
      }
      if (res.status === 400 && data.error === "invalid" && data.fields) {
        setErrors(data.fields);
      }
      if (window.turnstile && turnstileId.current) window.turnstile.reset(turnstileId.current);
      setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        className="border border-foreground/10 p-8 focus:outline-none lg:p-12"
        role="status"
        aria-live="polite"
      >
        <span className="mb-6 inline-flex items-center gap-3 font-mono text-sm text-muted-foreground">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
          Application received
        </span>
        <h2 className="font-display text-4xl tracking-tight lg:text-5xl">Thanks{submittedName ? `, ${submittedName}` : ""}.</h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          We have your application and CV. We review every application and reply to you by email.
        </p>
      </div>
    );
  }

  const roleOptions = [{ slug: GENERAL, title: "General application (no specific role)" }, ...openRoles];

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="relative flex flex-col gap-8">
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onReady={renderTurnstile}
        />
      ) : null}

      {/* Honeypot: hidden from people, filled in by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <FieldShell id="name" label="Full name" error={errors.name}>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            value={values.name}
            onChange={update("name")}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={describedBy("name")}
            className={inputClass}
          />
        </FieldShell>

        <FieldShell id="email" label="Email" error={errors.email}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            value={values.email}
            onChange={update("email")}
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={describedBy("email")}
            className={inputClass}
          />
        </FieldShell>

        <FieldShell id="phone" label="Phone" optional error={errors.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            value={values.phone}
            onChange={update("phone")}
            aria-invalid={errors.phone ? true : undefined}
            aria-describedby={describedBy("phone")}
            className={inputClass}
          />
        </FieldShell>

        <FieldShell id="location" label="Country or city" error={errors.location}>
          <input
            id="location"
            name="location"
            type="text"
            autoComplete="country-name"
            required
            value={values.location}
            onChange={update("location")}
            aria-invalid={errors.location ? true : undefined}
            aria-describedby={describedBy("location")}
            className={inputClass}
          />
        </FieldShell>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        <FieldShell id="role" label="Role" error={errors.role}>
          <select
            id="role"
            name="role"
            required
            value={values.role}
            onChange={update("role")}
            aria-invalid={errors.role ? true : undefined}
            aria-describedby={describedBy("role")}
            className={inputClass}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roleOptions.map((role) => (
              <option key={role.slug} value={role.slug}>
                {role.title}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell id="experience" label="Years of experience" error={errors.experience}>
          <select
            id="experience"
            name="experience"
            required
            value={values.experience}
            onChange={update("experience")}
            aria-invalid={errors.experience ? true : undefined}
            aria-describedby={describedBy("experience")}
            className={inputClass}
          >
            <option value="" disabled>
              Select a range
            </option>
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </FieldShell>
      </div>

      <FieldShell
        id="resume"
        label="CV or resume"
        error={errors.resume}
        hint="PDF, DOC or DOCX, up to 5 MB."
      >
        <input
          id="resume"
          name="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          required
          onChange={onResume}
          aria-invalid={errors.resume ? true : undefined}
          aria-describedby={describedBy("resume", true)}
          className="block w-full border border-foreground/15 bg-transparent px-4 py-3 text-base file:mr-4 file:border-0 file:bg-foreground file:px-4 file:py-2 file:text-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        />
      </FieldShell>

      <FieldShell id="portfolio" label="Portfolio, LinkedIn or GitHub" optional error={errors.portfolio}>
        <input
          id="portfolio"
          name="portfolio"
          type="url"
          inputMode="url"
          placeholder="https://"
          value={values.portfolio}
          onChange={update("portfolio")}
          aria-invalid={errors.portfolio ? true : undefined}
          aria-describedby={describedBy("portfolio")}
          className={inputClass}
        />
      </FieldShell>

      <FieldShell
        id="message"
        label="Cover note"
        optional
        error={errors.message}
        hint="Why Asauvia, and what kind of work are you best at?"
      >
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={update("message")}
          aria-invalid={errors.message ? true : undefined}
          aria-describedby={describedBy("message", true)}
          className={cn(inputClass, "h-auto min-h-32 resize-y py-3 leading-relaxed")}
        />
      </FieldShell>

      {turnstileSiteKey ? <div ref={turnstileRef} /> : null}

      {status === "not_configured" ? (
        <p role="alert" className="text-sm text-red-700">
          Applications are not switched on yet. Please email your CV to the address above instead.
        </p>
      ) : null}
      {status === "rate_limited" ? (
        <p role="alert" className="text-sm text-red-700">
          Too many attempts from this connection. Please wait a few minutes and try again.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="text-sm text-red-700">
          We could not send your application. Check the highlighted fields and try again.
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
          We use your details only to review this application. Read our{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:no-underline">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex h-14 items-center justify-center whitespace-nowrap rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
        >
          {status === "submitting" ? "Sending…" : "Submit application"}
          {status === "submitting" ? null : (
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          )}
        </button>
      </div>
    </form>
  );
}
