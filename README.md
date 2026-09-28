# Heise Projekt-Plattform

Web-App für Aufmaße (später auch Bautagebücher) mit Datenbank.
Läuft auf Cloudflare Pages mit Pages Functions und einer D1-Datenbank.

## Aufbau

```
public/                 Was im Browser läuft
  index.html            Projektübersicht, LV-Import, Aufmaße anlegen
  aufmass/index.html    Aufmaß-App (offlinefähig, gleicht automatisch ab)
  lib/                  ExcelJS, jsPDF (für Excel-/PDF-Ausgabe und LV-Import)
  sw.js                 Service Worker (App funktioniert auch ohne Netz)
functions/api/          Serverfunktionen (API)
server/util.js          Gemeinsame Hilfsfunktionen der API
db/schema.sql           Datenbanktabellen
```

## Einrichtung (einmalig)

1. Cloudflare Pages mit diesem Repo verbinden: Build-Befehl leer, Ausgabeordner `public`.
2. D1-Datenbank anlegen und im Pages-Projekt unter Settings → Bindings als `DB` verknüpfen.
3. Inhalt von `db/schema.sql` in der D1-Konsole ausführen.
4. Neu bereitstellen (Deployments → Retry deployment oder neuer Push).
5. Empfohlen: Cloudflare Access vor die Seite schalten, damit nur Mitarbeiter Zugriff haben.

## API

| Methode | Pfad | Zweck |
|---|---|---|
| GET / POST | `/api/projekte` | Projekte auflisten / anlegen |
| GET / PUT | `/api/projekte/:id` | Projekt mit LV und Bereichen / ändern |
| PUT | `/api/projekte/:id/lv` | LV ersetzen |
| PUT | `/api/projekte/:id/bereiche` | Bereichsliste ersetzen |
| GET / POST | `/api/projekte/:id/aufmasse` | Aufmaße des Projekts / neues Aufmaß |
| GET / PUT / DELETE | `/api/aufmasse/:id` | Aufmaß laden / Kopf und Unterschriften speichern / löschen |
| POST | `/api/aufmasse/:id/sync` | Geänderte Einträge und freie Positionen abgleichen |
| POST | `/api/import` | Projekt komplett aus Importdatei anlegen |

## Offline und Abgleich

Die Aufmaß-App speichert jede Änderung sofort im Browser des Geräts und schickt sie an die
Datenbank, sobald Netz da ist. Oben rechts steht der Stand („✓ gespeichert“ oder
„offline · x Änderungen warten“). Bearbeiten zwei Geräte denselben Eintrag, gilt die zuletzt
abgeglichene Änderung.
