import { json, body, uuid, now } from '../../../../server/util.js';

// GET /api/projekte/:id/aufmasse  → Liste der Aufmaße eines Projekts
export async function onRequestGet({ env, params }) {
  const r = await env.DB.prepare(`
    SELECT a.id, a.bez, a.datum, a.monteur, a.status, a.updated_at,
      (SELECT COUNT(*) FROM aufmass_eintraege e WHERE e.aufmass_id = a.id AND e.deleted = 0) AS anz_eintraege,
      (SELECT COUNT(*) FROM aufmass_eintraege e WHERE e.aufmass_id = a.id AND e.deleted = 0 AND e.pre = 1) AS anz_ungeprueft,
      (a.sig1 IS NOT NULL AND a.sig2 IS NOT NULL) AS unterschrieben
    FROM aufmasse a WHERE a.projekt_id = ? ORDER BY a.datum DESC, a.created_at DESC`).bind(params.id).all();
  return json(r.results);
}

// POST /api/projekte/:id/aufmasse  {bez, datum, monteur}
export async function onRequestPost({ env, params, request }) {
  const d = await body(request);
  const id = uuid();
  await env.DB.prepare('INSERT INTO aufmasse (id, projekt_id, bez, datum, monteur, created_at, updated_at) VALUES (?,?,?,?,?,?,?)')
    .bind(id, params.id, d.bez || 'Aufmaß', d.datum || now().slice(0, 10), d.monteur || '', now(), now()).run();
  return json({ id }, 201);
}
