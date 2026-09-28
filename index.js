import { json, fehler, body, uuid, now } from '../../../server/util.js';

// GET /api/projekte  → Liste aller Projekte mit Anzahl Aufmaße
export async function onRequestGet({ env }) {
  const r = await env.DB.prepare(`
    SELECT p.*, (SELECT COUNT(*) FROM aufmasse a WHERE a.projekt_id = p.id) AS anz_aufmasse,
           (SELECT COUNT(*) FROM lv_positionen l WHERE l.projekt_id = p.id AND l.typ = 'P') AS anz_lv
    FROM projekte p ORDER BY p.status, p.name`).all();
  return json(r.results);
}

// POST /api/projekte  {nr, name, adresse}
export async function onRequestPost({ env, request }) {
  const d = await body(request);
  if (!d.name) return fehler('Name fehlt');
  const id = uuid();
  await env.DB.prepare('INSERT INTO projekte (id, nr, name, adresse, created_at, updated_at) VALUES (?,?,?,?,?,?)')
    .bind(id, d.nr || '', d.name, d.adresse || '', now(), now()).run();
  return json({ id }, 201);
}
