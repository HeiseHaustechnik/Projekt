import { json, fehler, body, now, uuid } from '../../../../server/util.js';

// GET /api/projekte/:id/personen  → Personen auf der Baustelle (Stammliste des Projekts)
export async function onRequestGet({ env, params }) {
  const r = await env.DB.prepare('SELECT id, name, firma, rolle, updated_at FROM projekt_personen WHERE projekt_id = ? AND deleted = 0 ORDER BY name').bind(params.id).all();
  return json(r.results);
}

// POST /api/projekte/:id/personen  {id?, name, firma, rolle, deleted?}  → anlegen oder ändern
export async function onRequestPost({ env, params, request }) {
  const d = await body(request);
  if (!d.name && !d.deleted) return fehler('Name fehlt');
  const id = d.id || uuid(), t = d.updated_at || now();
  await env.DB.prepare(`INSERT INTO projekt_personen (id, projekt_id, name, firma, rolle, updated_at, deleted) VALUES (?,?,?,?,?,?,?)
    ON CONFLICT(id) DO UPDATE SET name=excluded.name, firma=excluded.firma, rolle=excluded.rolle, updated_at=excluded.updated_at, deleted=excluded.deleted
    WHERE excluded.updated_at >= COALESCE(projekt_personen.updated_at, '')`)
    .bind(id, params.id, d.name || '', d.firma || '', d.rolle || '', t, d.deleted ? 1 : 0).run();
  return json({ id });
}
