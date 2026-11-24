/**
 * Server-only client for the Google Apps Script web app attached to the careers spreadsheet
 * (source: docs/careers-apps-script.gs). The script appends one row per submission and stores the CV in Drive.
 * It runs inside the sheet owner's Google account, so no service account, Google Cloud project or email API is involved.
 *
 * Required env: CAREERS_SHEET_URL (the web app's /exec URL) and CAREERS_SHEET_SECRET (shared secret, also set in the script).
 */
export type CareerSheetConfig = { url: string; secret: string };

export function careerSheetConfig(): CareerSheetConfig | null {
  const url = process.env.CAREERS_SHEET_URL?.trim();
  const secret = process.env.CAREERS_SHEET_SECRET?.trim();
  if (!url || !secret) return null;
  return { url, secret };
}

export type CareerSubmission = {
  header: string[];
  row: string[];
  cv: { name: string; mimeType: string; base64: string };
};

/** Saves one application. Resolves only when the script confirms the row was written; throws otherwise. */
export async function saveApplication(config: CareerSheetConfig, submission: CareerSubmission) {
  const res = await fetch(config.url, {
    method: "POST",
    // text/plain keeps this a simple request; Apps Script reads the raw body either way.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ secret: config.secret, ...submission }),
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`Sheet script responded ${res.status}`);
  let data: { ok?: boolean; row?: number; cvLink?: string; error?: string };
  try {
    data = await res.json();
  } catch {
    throw new Error("Sheet script returned a non-JSON response (check the deployment access setting)");
  }
  if (data.ok !== true || typeof data.row !== "number") {
    throw new Error(`Sheet script rejected the submission: ${data.error ?? "unknown error"}`);
  }
  return { row: data.row, cvLink: data.cvLink ?? "" };
}
