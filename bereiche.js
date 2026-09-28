import { json, fehler, body, batchChunked } from '../../../../server/util.js';

// PUT /api/projekte/:id/bereiche  [{gruppe, name}, ...]  → ersetzt die Bereichsliste
export async function onRequestPut({ env, params, request }) {
  const b = await body(request);
  if (!Array.isArray(b)) return fehler('Liste erwartet');
  const db = env.DB;
  const st = [db.prepare('DELETE FROM bereiche WHERE projekt_id = ?').bind(params.id)];
  b.forEach((o, i) => st.push(db.prepare('INSERT INTO bereiche (projekt_id, sort, gruppe, name) VALUES (?,?,?,?)').bind(params.id, i, o.gruppe || '', o.name)));
  await batchChunked(db, st);
  return json({ ok: true, anzahl: b.length });
}
