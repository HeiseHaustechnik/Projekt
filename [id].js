import { json, fehler, body, now, aufmassDaten, projektDaten } from '../../../server/util.js';

// GET /api/aufmasse/:id  → Aufmaß mit Einträgen, freien Positionen, LV und Bereichen des Projekts
export async function onRequestGet({ env, params }) {
  const a = await aufmassDaten(env.DB, params.id);
  if (!a) return fehler('Aufmaß nicht gefunden', 404);
  const p = await projektDaten(env.DB, a.kopf.projekt_id);
  return json({ ...a, ...p });
}

// PUT /api/aufmasse/:id  → Kopfdaten und Unterschriften speichern
export async function onRequestPut({ env, params, request }) {
  const d = await body(request);
  await env.DB.prepare(`UPDATE aufmasse SET bez = ?, datum = ?, monteur = ?, ag = ?, bemerkung = ?, sig1 = ?, sig2 = ?, sig_ts = ?, status = COALESCE(?, status), updated_at = ? WHERE id = ?`)
    .bind(d.bez || '', d.datum || '', d.monteur || '', d.ag || '', d.bemerkung || '', d.sig1 || null, d.sig2 || null, d.sig_ts || null, d.status ?? null, now(), params.id).run();
  return json({ ok: true });
}

// DELETE /api/aufmasse/:id  → Aufmaß komplett löschen
export async function onRequestDelete({ env, params }) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM aufmass_eintraege WHERE aufmass_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM aufmass_freipos WHERE aufmass_id = ?').bind(params.id),
    env.DB.prepare('DELETE FROM aufmasse WHERE id = ?').bind(params.id),
  ]);
  return json({ ok: true });
}
