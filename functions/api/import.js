import { json, fehler, body, uuid, now, batchChunked } from '../../server/util.js';

// POST /api/import  → legt ein Projekt komplett an (Projekt, LV, Bereiche, optional ein Aufmaß mit Vorschlägen)
// Format: { projekt:{nr,name,adresse}, lv:[...], bereiche:[{gruppe,name}], aufmass:{bez,datum,freipos:[...],eintraege:[...]} }
export async function onRequestPost({ env, request }) {
  const d = await body(request);
  if (!d.projekt?.name) return fehler('Projektname fehlt');
  const db = env.DB, pid = uuid(), t = now();
  const st = [db.prepare('INSERT INTO projekte (id, nr, name, adresse, created_at, updated_at) VALUES (?,?,?,?,?,?)').bind(pid, d.projekt.nr || '', d.projekt.name, d.projekt.adresse || '', t, t)];
  (d.lv || []).forEach((o, i) => st.push(db.prepare('INSERT INTO lv_positionen (projekt_id, sort, typ, pos, bez, menge, me, in_liste) VALUES (?,?,?,?,?,?,?,?)')
    .bind(pid, i, o.typ, o.pos || '', o.bez || '', Number(o.menge) || 0, o.me || '', o.in_liste ? 1 : 0)));
  (d.bereiche || []).forEach((o, i) => st.push(db.prepare('INSERT INTO bereiche (projekt_id, sort, gruppe, name) VALUES (?,?,?,?)').bind(pid, i, o.gruppe || '', o.name)));
  let aid = null;
  if (d.aufmass) {
    aid = uuid(); const a = d.aufmass;
    st.push(db.prepare('INSERT INTO aufmasse (id, projekt_id, bez, datum, created_at, updated_at) VALUES (?,?,?,?,?,?)').bind(aid, pid, a.bez || 'Aufmaß', a.datum || t.slice(0, 10), t, t));
    (a.freipos || []).forEach(f => st.push(db.prepare('INSERT INTO aufmass_freipos (id, aufmass_id, nr, bez, me, titel, ref, updated_at) VALUES (?,?,?,?,?,?,?,?)')
      .bind(uuid(), aid, f.nr, f.bez, f.me || '', f.titel || '', f.ref || '', t)));
    (a.eintraege || []).forEach(e => st.push(db.prepare('INSERT INTO aufmass_eintraege (id, aufmass_id, pos_key, menge, ort, bemerkung, rg, pre, erfasst_von, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
      .bind(uuid(), aid, e.pos_key, Number(e.menge) || 0, e.ort || '', e.bemerkung || '', e.rg || '', e.pre ? 1 : 0, 'Import', t, t)));
  }
  await batchChunked(db, st);
  return json({ projekt_id: pid, aufmass_id: aid }, 201);
}
