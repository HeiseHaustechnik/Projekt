import { json, body, batchChunked, aufmassDaten, nutzer } from '../../../../server/util.js';

// POST /api/aufmasse/:id/sync  {eintraege:[...], freipos:[...]}
// Nimmt geänderte Einträge vom Gerät entgegen (inkl. gelöschter, deleted=1).
// Gewinnt jeweils die neuere Änderung (updated_at). Gibt den aktuellen Gesamtstand zurück.
export async function onRequestPost({ env, params, request }) {
  const d = await body(request);
  const db = env.DB, aid = params.id, wer = nutzer(request);
  const st = [];
  for (const f of d.freipos || []) {
    st.push(db.prepare(`INSERT INTO aufmass_freipos (id, aufmass_id, nr, bez, me, titel, ref, updated_at, deleted) VALUES (?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET nr=excluded.nr, bez=excluded.bez, me=excluded.me, titel=excluded.titel, ref=excluded.ref, updated_at=excluded.updated_at, deleted=excluded.deleted
      WHERE excluded.updated_at > COALESCE(aufmass_freipos.updated_at, '')`)
      .bind(f.id, aid, f.nr, f.bez, f.me || '', f.titel || '', f.ref || '', f.updated_at, f.deleted ? 1 : 0));
  }
  for (const e of d.eintraege || []) {
    st.push(db.prepare(`INSERT INTO aufmass_eintraege (id, aufmass_id, pos_key, menge, ort, bemerkung, rg, pre, erfasst_von, created_at, updated_at, deleted) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
      ON CONFLICT(id) DO UPDATE SET pos_key=excluded.pos_key, menge=excluded.menge, ort=excluded.ort, bemerkung=excluded.bemerkung, rg=excluded.rg, pre=excluded.pre, updated_at=excluded.updated_at, deleted=excluded.deleted
      WHERE excluded.updated_at > COALESCE(aufmass_eintraege.updated_at, '')`)
      .bind(e.id, aid, e.pos_key, Number(e.menge) || 0, e.ort || '', e.bemerkung || '', e.rg || '', e.pre ? 1 : 0, e.erfasst_von || wer, e.created_at || e.updated_at, e.updated_at, e.deleted ? 1 : 0));
  }
  if (st.length) await batchChunked(db, st);
  const a = await aufmassDaten(db, aid);
  return json({ eintraege: a.eintraege, freipos: a.freipos });
}
