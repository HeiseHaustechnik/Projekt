import { json, fehler, body, now, projektDaten } from '../../../server/util.js';

// GET /api/projekte/:id  → Projekt mit LV und Bereichen
export async function onRequestGet({ env, params }) {
  const d = await projektDaten(env.DB, params.id);
  return d ? json(d) : fehler('Projekt nicht gefunden', 404);
}

// PUT /api/projekte/:id  {nr, name, adresse, status}
export async function onRequestPut({ env, params, request }) {
  const d = await body(request);
  await env.DB.prepare('UPDATE projekte SET nr = COALESCE(?, nr), name = COALESCE(?, name), adresse = COALESCE(?, adresse), status = COALESCE(?, status), updated_at = ? WHERE id = ?')
    .bind(d.nr ?? null, d.name ?? null, d.adresse ?? null, d.status ?? null, now(), params.id).run();
  return json({ ok: true });
}
