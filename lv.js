import { json, fehler, body, batchChunked } from '../../../../server/util.js';

// PUT /api/projekte/:id/lv  [{typ,pos,bez,menge,me,in_liste}, ...]  → ersetzt das komplette LV
export async function onRequestPut({ env, params, request }) {
  const lv = await body(request);
  if (!Array.isArray(lv) || !lv.length) return fehler('LV ist leer');
  const db = env.DB;
  const st = [db.prepare('DELETE FROM lv_positionen WHERE projekt_id = ?').bind(params.id)];
  lv.forEach((o, i) => st.push(db.prepare('INSERT INTO lv_positionen (projekt_id, sort, typ, pos, bez, menge, me, in_liste) VALUES (?,?,?,?,?,?,?,?)')
    .bind(params.id, i, o.typ, o.pos || '', o.bez || '', Number(o.menge) || 0, o.me || '', o.in_liste ? 1 : 0)));
  await batchChunked(db, st);
  return json({ ok: true, anzahl: lv.length });
}
