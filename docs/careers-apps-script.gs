/**
 * Careers form receiver: Google Apps Script web app (free, runs in your own Google account).
 *
 * SETUP (about 3 minutes)
 * 1. Open the careers spreadsheet > Extensions > Apps Script. Delete the sample code and paste this whole file.
 * 2. Project Settings (gear icon) > Script properties > Add script property:
 *      SECRET = the same value as CAREERS_SHEET_SECRET in the website's .env
 *    Optional: TAB = sheet tab name (defaults to the first tab), CV_FOLDER_ID = an existing Drive folder for CVs
 *    (otherwise a folder named "Career CVs" is created in your Drive).
 * 3. Click Deploy > New deployment > type "Web app":
 *      Execute as: Me      Who has access: Anyone
 *    Click Deploy, approve the permission prompts (Sheets and Drive), and copy the Web app URL ending in /exec.
 * 4. Put that URL in the website's .env as CAREERS_SHEET_URL.
 * 5. After editing this script later, use Deploy > Manage deployments > Edit > New version so changes go live.
 *
 * ACKNOWLEDGEMENT EMAIL (free: sent from your own Gmail through this script)
 * After the row is saved, the script emails the applicant a confirmation. The website supplies the recipient (the address the
 * applicant typed) and the wanted sender (CAREERS_TO_EMAIL). The script only sends if the recipient equals the Email column of
 * the row it just saved, so it cannot be used to mail anyone else. The sender is CAREERS_TO_EMAIL only when this Google account
 * is that address or has it as a Gmail "Send mail as" alias (Gmail > Settings > Accounts and Import); otherwise the mail goes
 * out from this account's own address with Reply-To set to CAREERS_TO_EMAIL, and the response says which address was used.
 * Limits: about 100 emails/day on a free Gmail account, 1,500/day on Google Workspace. No cost either way.
 * The first deploy after adding this needs Deploy > Manage deployments > Edit > New version, then approve the Gmail permission.
 *
 * Every request must carry the SECRET, so only the website can add rows. Rows are always added below the last
 * row; nothing is overwritten. Cells are written as plain text, so submitted text can never run as a formula.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var props = PropertiesService.getScriptProperties();
    var body = JSON.parse(e.postData.contents);

    if (!props.getProperty("SECRET") || body.secret !== props.getProperty("SECRET")) {
      return json_({ ok: false, error: "unauthorized" });
    }
    if (!Array.isArray(body.row) || !Array.isArray(body.header)) {
      return json_({ ok: false, error: "bad request" });
    }

    lock.waitLock(30000); // serialises simultaneous submissions so each gets its own row

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var tab = props.getProperty("TAB");
    var sheet = (tab && ss.getSheetByName(tab)) || ss.getSheets()[0];

    // Header only when the sheet is completely empty.
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, body.header.length).setValues([body.header]).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    var cvLink = "";
    if (body.cv && body.cv.base64) {
      var blob = Utilities.newBlob(Utilities.base64Decode(body.cv.base64), body.cv.mimeType, body.cv.name);
      var file = cvFolder_(props).createFile(blob);
      cvLink = file.getUrl();
    }

    // "CV link" is the second-to-last column in the website's row layout.
    var row = body.row.slice();
    if (cvLink && row.length >= 2) row[row.length - 2] = cvLink;

    var rowNumber = sheet.getLastRow() + 1;
    var range = sheet.getRange(rowNumber, 1, 1, row.length);
    range.setNumberFormat("@"); // plain text: no formulas, no date or number auto-conversion
    range.setValues([row]);
    SpreadsheetApp.flush();

    var result = { ok: true, row: rowNumber, cvLink: cvLink, emailSent: false };
    if (body.ack) {
      // The application is already saved; an email problem is reported but never undoes or fails the save.
      try {
        result.emailFrom = sendAck_(body.ack, body.header, row);
        result.emailSent = true;
      } catch (mailErr) {
        result.emailError = String(mailErr && mailErr.message ? mailErr.message : mailErr);
      }
    }
    return json_(result);
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

// Visiting the URL in a browser is harmless and just confirms the deployment is live.
function doGet() {
  return json_({ ok: true, service: "careers form receiver" });
}

function sendAck_(ack, header, row) {
  var to = String(ack.to || "").trim();
  var emailCol = header.indexOf("Email");
  if (emailCol < 0 || to.toLowerCase() !== String(row[emailCol]).trim().toLowerCase()) {
    throw new Error("recipient does not match the application email");
  }
  if (!/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(to)) throw new Error("invalid recipient address");

  var options = { name: String(ack.name || "Asauvia Careers") };
  var own = String(Session.getEffectiveUser().getEmail()).toLowerCase();
  var wanted = String(ack.from || "").trim().toLowerCase();
  var sentFrom = own;
  if (wanted) {
    options.replyTo = wanted;
    var aliases = GmailApp.getAliases().map(function (a) { return String(a).toLowerCase(); });
    if (aliases.indexOf(wanted) >= 0) { options.from = wanted; sentFrom = wanted; }
    else if (wanted === own) { sentFrom = own; }
  }
  var subject = String(ack.subject || "We received your application").replace(/[\r\n]+/g, " ");
  GmailApp.sendEmail(to, subject, String(ack.body || ""), options);
  return sentFrom;
}

function cvFolder_(props) {
  var id = props.getProperty("CV_FOLDER_ID");
  if (id) return DriveApp.getFolderById(id);
  var existing = DriveApp.getFoldersByName("Career CVs");
  return existing.hasNext() ? existing.next() : DriveApp.createFolder("Career CVs");
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
