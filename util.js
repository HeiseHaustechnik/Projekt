// Gemeinsame Hilfsfunktionen für die API (Cloudflare Pages Functions)
export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export const fehler = (msg, status = 400) => json({ fehler: msg }, status);

export const now = () => new Date().toISOString();
export const uuid = () => crypto.randomUUID();

// E-Mail des angemeldeten Nutzers (gesetzt von Cloudflare Access, sonst leer)
export const nutzer = (request) => request.headers.get('cf-access-authenticated-user-email') || '';

export async function body(request) {
  try { return await request.json(); } catch { throw new HttpError('Ungültige Daten (kein JSON)', 400); }
}

export class HttpError extends Error { constructor(msg, status) { super(msg); this.status = status; } }

// Viele Statements in Päckchen ausführen (D1-Batch)
export async function batchChunked(db, stmts, size = 80) {
  for (let i = 0; i < stmts.length; i += size) await db.batch(stmts.slice(i, i + size));
}

export async function projektDaten(db, id) {
  const projekt = await db.prepare('SELECT * FROM projekte WHERE id = ?').bind(id).first();
  if (!projekt) return null;
  const lv = (await db.prepare('SELECT typ, pos, bez, menge, me, in_liste FROM lv_positionen WHERE projekt_id = ? ORDER BY sort').bind(id).all()).results;
  const bereiche = (await db.prepare('SELECT gruppe, name FROM bereiche WHERE projekt_id = ? ORDER BY sort').bind(id).all()).results;
  return { projekt, lv, bereiche };
}

export async function aufmassDaten(db, id) {
  const kopf = await db.prepare('SELECT * FROM aufmasse WHERE id = ?').bind(id).first();
  if (!kopf) return null;
  const freipos = (await db.prepare('SELECT * FROM aufmass_freipos WHERE aufmass_id = ? AND deleted = 0 ORDER BY nr').bind(id).all()).results;
  const eintraege = (await db.prepare('SELECT * FROM aufmass_eintraege WHERE aufmass_id = ? AND deleted = 0 ORDER BY created_at').bind(id).all()).results;
  return { kopf, freipos, eintraege };
}
