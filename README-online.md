# Hacke Online (MVP)

Diese Version enthält einen einfachen Realtime-Mehrspieler-MVP mit Room-Code.

## 1) Server starten

```bash
npm install
npm start
```

Standard-Port: `3000`  
Health-Check: `http://localhost:3000`

## 2) Spiel öffnen

`hacke.html` im Browser öffnen (auf allen Geräten).

## 3) Raum verbinden

Im Setup-Bereich:

1. `Online-Modus aktivieren`
2. Server URL eintragen (z. B. `http://<DEINE-IP>:3000`)
3. Namen eingeben
4. Einer klickt `Raum erstellen`
5. Alle anderen geben den Raum-Code ein und klicken `Raum beitreten`

Danach kann das Spiel normal gestartet werden. Der Spielzustand wird zwischen verbundenen Geräten synchronisiert.

## Hinweise

- Das ist ein MVP (Snapshot-Sync), nicht final abgesichert.
- Für Nutzung im Internet braucht ihr:
  - öffentlich erreichbaren Server
  - HTTPS/Domain
  - CORS passend gesetzt (`CORS_ORIGIN` Umgebungsvariable)

Beispiel:

```bash
CORS_ORIGIN=https://deine-domain.example npm start
```
