# SunsetPhone Mod

Mod non officiel du téléphone SunsetGames.

## Fonctionnement

Le mod fournit une interface indépendante tout en pouvant se synchroniser avec le téléphone officiel via un bridge `postMessage`.

- `index.html` — téléphone du mod.
- `sunsetphone.mod.json` — manifeste du mod.
- `assets/sunsetgames-bridge.js` — bridge à charger côté page officielle.
- Le mod conserve un cache local pour rester utilisable même sans synchronisation.

## Synchronisation officielle

Le navigateur applique la same-origin policy : le mod ne peut pas lire directement le DOM de `sunsetgames.fr` depuis son propre domaine.

Pour une vraie synchronisation, le script `assets/sunsetgames-bridge.js` doit être chargé par la page officielle du téléphone.

Le protocole est simple :
- mod → site : `hello`, `phone-sync-request`, `phone-action`
- site → mod : `hello-ack`, `phone-sync`, `phone-message`, `phone-photo`
- les actions utilisateur sont relayées vers `gmod` côté téléphone officiel.
- les données restent sous l'autorité du téléphone officiel.

## Installation du bridge

Dans la page officielle du téléphone, charger le fichier `assets/sunsetgames-bridge.js` ou intégrer son contenu dans le bundle du téléphone.

Le chemin exact dépend de l'organisation du site officiel.

## Important

L'iframe officielle peut être bloquée par CSP ou X-Frame-Options. Dans ce cas, le mod reste utilisable en mode local, mais l'iframe ne peut pas être forcée par JavaScript.

Le bridge officiel est donc la partie qui rend la synchronisation réelle possible ; l'iframe seule ne suffit pas.

## Déploiement

Le dépôt peut être publié comme site statique avec GitHub Pages ou Cloudflare Pages. Aucun serveur n'est requis pour le mode local.
