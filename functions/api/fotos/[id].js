import { json, fehler, body, now } from '../../../server/util.js';

// PUT /api/fotos/:id  → Foto anlegen, Notiz ändern oder löschen (neuere Änderung gewinnt)
export async function onRequestPut({ env, params, request }) {
  const d = await body(request);
  if (!d.eintrag_id || !d.projekt_id) return fehler('Eintrag oder Projekt fehlt');
  if (d.bild && d.bild.length > 1900000) return fehler('Foto zu groß');
  const t = d.updated_at || now();
  const r = await env.DB.prepare(`INSERT INTO bautagebuch_fotos (id, eintrag_id, projekt_id, sort, notiz, bild, created_at, updated_at, deleted)
    VALUES (?,?,?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET sort=excluded.sort, notiz=excluded.notiz, bild=COALESCE(excluded.bild, bautagebuch_fotos.bild),
      updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at >= COALESCE(bautagebuch_fotos.updated_at, '')`)
    .bind(params.id, d.eintrag_id, d.projekt_id, Number(d.sort) || 0, d.notiz || '', d.bild || null, d.created_at || t, t, d.deleted ? 1 : 0).run();
  return json({ ok: true, geaendert: r.meta.changes });
}
