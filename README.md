# SunsetPhone (mod)
Mod non officiel du téléphone Sunset, **100 % statique** : aucun serveur, aucune base de données.
- `index.html` : la page du téléphone, inchangée.
- `assets/bridge.js` : remplace le pont Lua. Textes -> `localStorage`, images -> IndexedDB.

## Déploiement Cloudflare Pages
Pages > Create > connecter ce dépôt. Aucune commande de build, dossier de sortie `/`.
Copier aussi `assets/apps/` et `assets/wallpapers/` du téléphone original.

## Limites
Les données restent sur l'appareil et le navigateur de chaque personne : pas de messages entre deux personnes, pas de synchro avec le site officiel.
