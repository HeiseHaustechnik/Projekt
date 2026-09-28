-- Heise Projekt-Plattform: Datenbankschema (Cloudflare D1 / SQLite)
-- Einmalig in der D1-Konsole ausführen. Kann gefahrlos erneut ausgeführt werden (IF NOT EXISTS).

CREATE TABLE IF NOT EXISTS projekte (
  id          TEXT PRIMARY KEY,
  nr          TEXT,
  name        TEXT NOT NULL,
  adresse     TEXT,
  status      TEXT DEFAULT 'aktiv',
  lat         REAL,
  lon         REAL,
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);

-- Leistungsverzeichnis je Projekt. typ: L = Los, T = Titel, X = Zwischenüberschrift, P = Position
CREATE TABLE IF NOT EXISTS lv_positionen (
  projekt_id  TEXT NOT NULL,
  sort        INTEGER NOT NULL,
  typ         TEXT NOT NULL,
  pos         TEXT,
  bez         TEXT,
  menge       REAL DEFAULT 0,
  me          TEXT,
  in_liste    INTEGER DEFAULT 0,
  PRIMARY KEY (projekt_id, sort)
);
CREATE INDEX IF NOT EXISTS idx_lv_pos ON lv_positionen(projekt_id, pos);

-- Bereiche (Raum / Ort) je Projekt
CREATE TABLE IF NOT EXISTS bereiche (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  projekt_id  TEXT NOT NULL,
  sort        INTEGER NOT NULL,
  gruppe      TEXT,
  name        TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_bereiche_projekt ON bereiche(projekt_id, sort);

-- Aufmaß-Kopf
CREATE TABLE IF NOT EXISTS aufmasse (
  id          TEXT PRIMARY KEY,
  projekt_id  TEXT NOT NULL,
  bez         TEXT,
  datum       TEXT,
  monteur     TEXT,
  ag          TEXT,
  bemerkung   TEXT,
  sig1        TEXT,
  sig2        TEXT,
  sig_ts      TEXT,
  status      TEXT DEFAULT 'offen',
  created_at  TEXT DEFAULT (datetime('now')),
  updated_at  TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_aufmasse_projekt ON aufmasse(projekt_id);

-- Freie Positionen (nicht im LV) je Aufmaß
CREATE TABLE IF NOT EXISTS aufmass_freipos (
  id          TEXT PRIMARY KEY,
  aufmass_id  TEXT NOT NULL,
  nr          TEXT NOT NULL,
  bez         TEXT NOT NULL,
  me          TEXT,
  titel       TEXT,
  ref         TEXT,
  updated_at  TEXT,
  deleted     INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_freipos_aufmass ON aufmass_freipos(aufmass_id);

-- Einzelaufmaße
CREATE TABLE IF NOT EXISTS aufmass_eintraege (
  id          TEXT PRIMARY KEY,
  aufmass_id  TEXT NOT NULL,
  pos_key     TEXT NOT NULL,
  menge       REAL NOT NULL,
  ort         TEXT,
  bemerkung   TEXT,
  rg          TEXT,
  pre         INTEGER DEFAULT 0,
  erfasst_von TEXT,
  created_at  TEXT,
  updated_at  TEXT,
  deleted     INTEGER DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_eintraege_aufmass ON aufmass_eintraege(aufmass_id);

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

