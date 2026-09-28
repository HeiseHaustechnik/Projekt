-- Bautagebuch: Fotos je Tageseintrag (Bild als verkleinertes JPEG, Data-URL)
CREATE TABLE IF NOT EXISTS bautagebuch_fotos (
  id          TEXT PRIMARY KEY,
  eintrag_id  TEXT NOT NULL,
  projekt_id  TEXT NOT NULL,
  sort        INTEGER DEFAULT 0,
  notiz       TEXT,
  bild        TEXT,
  created_at  TEXT,
  updated_at  TEXT,
  deleted     INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_fotos_eintrag ON bautagebuch_fotos(eintrag_id);
