import { json } from '../../../../server/util.js';

// GET /api/projekte/:id/bautagebuch  → Liste der Tageseinträge (ohne Unterschriftsbilder)
export async function onRequestGet({ env, params }) {
  const r = await env.DB.prepare(`SELECT id, datum, von, bis, pause_min, wetter, personen, verfasser, substr(taetigkeit,1,160) AS taetigkeit,
      (sig1 IS NOT NULL AND sig1 <> '') AS sig_ma, (sig2 IS NOT NULL AND sig2 <> '') AS sig_ag, updated_at,
      (SELECT COUNT(*) FROM bautagebuch_fotos f WHERE f.eintrag_id = bautagebuch.id AND f.deleted = 0) AS fotos
    FROM bautagebuch WHERE projekt_id = ? AND deleted = 0 ORDER BY datum DESC, created_at DESC`).bind(params.id).all();
  return json(r.results);
}
