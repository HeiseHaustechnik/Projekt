import { json } from '../../server/util.js';

// Fängt Fehler ab und prüft, ob die Datenbank verknüpft ist
export async function onRequest(context) {
  if (!context.env.DB) return json({ fehler: 'Datenbank nicht verknüpft (Binding "DB" fehlt)' }, 500);
  try {
    return await context.next();
  } catch (e) {
    return json({ fehler: e.message || String(e) }, e.status || 500);
  }
}
