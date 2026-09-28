import { json, fehler, body, now } from '../../../server/util.js';

// GET /api/bautagebuch/:id  → vollständiger Tageseintrag
export async function onRequestGet({ env, params }) {
  const e = await env.DB.prepare('SELECT * FROM bautagebuch WHERE id = ? AND deleted = 0').bind(params.id).first();
  return e ? json(e) : fehler('Eintrag nicht gefunden', 404);
}

// PUT /api/bautagebuch/:id  → anlegen oder aktualisieren (neuere Änderung gewinnt)
export async function onRequestPut({ env, params, request }) {
  const d = await body(request);
  if (!d.projekt_id || !d.datum) return fehler('Projekt oder Datum fehlt');
  const t = d.updated_at || now();
  const r = await env.DB.prepare(`INSERT INTO bautagebuch (id, projekt_id, datum, von, bis, pause_min, wetter, wetter_daten, personen, taetigkeit, besonderheiten, verfasser, ag_name, sig1, sig2, sig_ts, created_at, updated_at, deleted)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,0)
    ON CONFLICT(id) DO UPDATE SET datum=excluded.datum, von=excluded.von, bis=excluded.bis, pause_min=excluded.pause_min, wetter=excluded.wetter, wetter_daten=excluded.wetter_daten,
      personen=excluded.personen, taetigkeit=excluded.taetigkeit, besonderheiten=excluded.besonderheiten, verfasser=excluded.verfasser, ag_name=excluded.ag_name,
      sig1=excluded.sig1, sig2=excluded.sig2, sig_ts=excluded.sig_ts, updated_at=excluded.updated_at, deleted=0
    WHERE excluded.updated_at >= COALESCE(bautagebuch.updated_at, '')`)
    .bind(params.id, d.projekt_id, d.datum, d.von || '', d.bis || '', Number(d.pause_min) || 0, d.wetter || '', typeof d.wetter_daten === 'string' ? d.wetter_daten : JSON.stringify(d.wetter_daten || null),
      typeof d.personen === 'string' ? d.personen : JSON.stringify(d.personen || []), d.taetigkeit || '', d.besonderheiten || '', d.verfasser || '', d.ag_name || '',
      d.sig1 || null, d.sig2 || null, d.sig_ts || null, d.created_at || t, t).run();
  return json({ ok: true, geaendert: r.meta.changes });
}

// DELETE /api/bautagebuch/:id
export async function onRequestDelete({ env, params }) {
  await env.DB.prepare('UPDATE bautagebuch SET deleted = 1, updated_at = ? WHERE id = ?').bind(now(), params.id).run();
  return json({ ok: true });
}
