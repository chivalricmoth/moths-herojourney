/**
 * north star — Google Drive sync (Google Apps Script web app)
 *
 * Stores your app data as one JSON file ("northstar-data.json") in YOUR Google Drive.
 * The app sends/receives it over HTTPS and merges changes client-side.
 *
 * 1. Change TOKEN below to a long random phrase (the same one goes in the app's Settings).
 * 2. Deploy → New deployment → type "Web app".
 *      Execute as: Me      Who has access: Anyone
 * 3. Copy the web-app URL (ends in /exec) into the app's Settings.
 *
 * "Anyone" means anyone who has BOTH the URL and the token can read the data,
 * so keep both private. Without the token the script returns an error.
 */
const TOKEN = "CHANGE-ME-to-a-long-random-phrase";
const FILE_NAME = "northstar-data.json";

function findFile_() {
  const it = DriveApp.getFilesByName(FILE_NAME);
  return it.hasNext() ? it.next() : null;
}
function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  if (!e || !e.parameter || e.parameter.t !== TOKEN) return json_({ error: "Wrong or missing token." });
  const f = findFile_();
  if (!f) return json_({ empty: true });
  return ContentService.createTextOutput(f.getBlob().getDataAsString()).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.token !== TOKEN) return json_({ error: "Wrong or missing token." });
    if (!body.data || !body.data.settings) return json_({ error: "That didn't look like north star data." });
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const f = findFile_();
      const text = JSON.stringify(body.data);
      if (f) f.setContent(text); else DriveApp.createFile(FILE_NAME, text, MimeType.PLAIN_TEXT);
    } finally { lock.releaseLock(); }
    return json_({ ok: true, saved: new Date().toISOString() });
  } catch (err) {
    return json_({ error: String(err) });
  }
}
