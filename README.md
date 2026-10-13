# Pariability — Sport V4

Déposer `index.html`, `styles.css` et `app.js` à la racine du dépôt GitHub `Pariability` (remplacer les anciens fichiers). Aucun build ni secret requis. Compatible GitHub Pages et Cloudflare Pages.

- Choix de période : aujourd'hui, demain, 7 jours ou dates personnalisées (max. 8 jours).
- Sélection/désélection des sports ; les sports désactivés ne sont pas interrogés.
- Récupération des rencontres par `eventsday.php` de l'API publique TheSportsDB.
- Quatre cartes de tickets avec rencontres et marchés indicatifs ; pas de cotes Melbet inventées.

**Limites importantes :** les marchés sont actuellement des propositions génériques, pas des prévisions issues d'un modèle calibré ; aucun lien officiel Melbet, aucune cote ni historique de performances. Certaines disciplines ou journées ne sont pas couvertes par l'API gratuite, et des requêtes peuvent échouer ou être limitées. La récupération de nombreux sports sur plusieurs jours peut prendre du temps. La connexion réseau doit être testée après déploiement.

Pour obtenir des pronostics réellement chiffrés et les cotes Melbet, il faudra connecter une source autorisée de statistiques historiques et de cotes, puis développer et valider un modèle de probabilités. Ne pas placer de clé API privée dans `app.js`.
