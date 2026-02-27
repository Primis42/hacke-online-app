# Public Deployment (Ein Klick Link fuer alle)

Ziel: `hacke.html` oeffentlich hosten + `server.js` oeffentlich hosten, damit alle direkt per Link einsteigen koennen.

## A) Backend deployen (Render)

1. Repo zu GitHub pushen.
2. Auf Render `New +` -> `Blueprint` waehlen und dieses Repo verbinden.
3. `render.yaml` wird erkannt.
4. Bei `CORS_ORIGIN` deine Frontend-Domain setzen (spaeter aus Vercel), z. B.:
   `https://hacke-game.vercel.app`
5. Deploy starten.
6. Ergebnis: oeffentliche Backend-URL, z. B.  
   `https://hacke-server.onrender.com`

## B) Frontend deployen (Vercel)

1. Auf Vercel `Add New...` -> `Project` -> Repo importieren.
2. Framework: `Other` / Static.
3. Deploy.
4. Ergebnis: oeffentliche Frontend-URL, z. B.  
   `https://hacke-game.vercel.app/hacke.html`

## C) Frontend mit Backend verbinden

In `app-config.js` eintragen:

```js
window.HACKE_DEFAULT_SERVER_URL = 'https://hacke-server.onrender.com';
```

Dann erneut Vercel deployen.

## D) CORS final setzen

In Render Umgebungsvariable:

`CORS_ORIGIN=https://hacke-game.vercel.app`

Wenn mehrere Domains erlaubt sein sollen:

`CORS_ORIGIN=https://hacke-game.vercel.app,https://www.hacke-game.vercel.app`

## Nutzung

1. Host oeffnet `https://.../hacke.html`
2. Host: `Raum erstellen`
3. `Link kopieren` senden
4. Andere klicken Link und treten mit `Raum beitreten` bei

## Hinweis

- Render Free kann beim ersten Aufruf schlafen (erste Verbindung dauert laenger).
- Fuer stabile Sessions spaeter auf einen bezahlten Plan wechseln.
