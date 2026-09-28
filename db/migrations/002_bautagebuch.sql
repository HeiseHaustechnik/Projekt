-- Bautagebuch: Personen je Projekt, Tageseinträge, Koordinaten für das Wetter
CREATE TABLE IF NOT EXISTS projekt_personen (
  id          TEXT PRIMARY KEY,
  projekt_id  TEXT NOT NULL,
  name        TEXT NOT NULL,
  firma       TEXT,
  rolle       TEXT,
  updated_at  TEXT,
  deleted     INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_personen_projekt ON projekt_personen(projekt_id);

CREATE TABLE IF NOT EXISTS bautagebuch (
  id            TEXT PRIMARY KEY,
  projekt_id    TEXT NOT NULL,
  datum         TEXT NOT NULL,
  von           TEXT,
  bis           TEXT,
  pause_min     INTEGER DEFAULT 0,
  wetter        TEXT,
  wetter_daten  TEXT,
  personen      TEXT,
  taetigkeit    TEXT,
  besonderheiten TEXT,
  verfasser     TEXT,
  ag_name       TEXT,
  sig1          TEXT,
  sig2          TEXT,
  sig_ts        TEXT,
  created_at    TEXT,
  updated_at    TEXT,
  deleted       INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_btb_projekt ON bautagebuch(projekt_id, datum);

-- einmalig ausführen (Fehler "duplicate column" bei zweitem Lauf ist unkritisch)
ALTER TABLE projekte ADD COLUMN lat REAL;
ALTER TABLE projekte ADD COLUMN lon REAL;
