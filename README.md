# SunsetPhone Mod

Surcouche indépendante pour SunsetPhone, pensée comme un **mod côté utilisateur**.

## État actuel

- Écran verrouillé + accueil type smartphone.
- Applications utilisateur : Messages, Photos, Téléphone, Contacts, Alertes et Réglages.
- Upload d'images depuis le téléphone.
- Réception testée de messages et d'images.
- Galerie synchronisée avec les médias reçus.
- Notifications locales.
- Persistance des données de test dans le navigateur.
- Mode **Founder Test** isolé du téléphone utilisateur.

## Founder Test

Pour ouvrir les outils de test fondateur :

`index.html#founder-test`

Le panneau permet d'injecter un message ou une image entrante. Le résultat apparaît ensuite dans l'interface utilisateur comme une vraie réception.

Le mode utilisateur normal ne montre aucun bouton fondateur.

## Architecture prévue

La couche actuelle utilise le stockage navigateur uniquement pour permettre un test immédiat sans serveur. Elle est volontairement séparée de l'interface afin de pouvoir brancher ensuite un backend temps réel pour :

- comptes utilisateurs ;
- conversations réelles ;
- messages entre utilisateurs ;
- upload et stockage d'images ;
- notifications temps réel ;
- synchronisation multi-appareils.

## Test

Ouvre `index.html`, déverrouille le téléphone, puis teste Messages et Photos.

Pour le test fondateur, utilise `#founder-test`.
