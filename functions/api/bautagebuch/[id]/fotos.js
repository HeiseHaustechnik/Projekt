import { json } from '../../../../server/util.js';

// GET /api/bautagebuch/:id/fotos  → alle Fotos eines Tageseintrags
export async function onRequestGet({ env, params }) {
  const r = await env.DB.prepare('SELECT id, eintrag_id, sort, notiz, bild, created_at, updated_at FROM bautagebuch_fotos WHERE eintrag_id = ? AND deleted = 0 ORDER BY sort, created_at')
    .bind(params.id).all();
  return json(r.results);
}
