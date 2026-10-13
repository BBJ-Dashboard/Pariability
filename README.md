# Pariability V2 — GitHub Pages

Application statique (HTML, CSS, JavaScript), sans compilation, sans clé et sans base de données.

## Déploiement

Copier `index.html`, `styles.css` et `app.js` **à la racine** du dépôt GitHub `Pariability`. Dans Settings → Pages, choisir Deploy from a branch → main → /(root).

## Modules

- **Pronostics** : lecture des prochains matchs ou résultats depuis l'API publique TheSportsDB (`www.thesportsdb.com`). La V2 affiche quatre profils statistiques *descriptifs* à partir des derniers résultats de ligue. Il ne s'agit pas encore de tickets de matchs réellement prédits ; les cotes, les blessures et l'historique approfondi ne sont pas fournis.
- **Roulette** : saisie/import TXT/CSV d'une colonne de 0 à 36, maximum 500 tirages, fréquence par couleur/parité/douzaine/colonne, secteurs de roue, retards, score z, comparaison par demi-échantillons et backtest rétrospectif. Les données restent dans le navigateur (localStorage).

## Précisions mathématiques

- Pour la roulette européenne : rouge/noir, pair/impair et petit/grand ont chacun une probabilité de 18/37 ; douzaines et colonnes 12/37 ; un numéro 1/37.
- Le backtest par secteur utilise une **rémunération théorique proportionnelle à la couverture** pour comparer des familles de tailles différentes. Ce n'est pas une mise réelle standard de casino. Les secteurs peuvent se chevaucher avec d'autres catégories.
- Les écarts z ne sont pas corrigés pour tests multiples et ne prouvent pas un biais. Aucun algorithme ne peut déduire un avantage sur le prochain tirage d'une roulette équitable à partir de sa seule séquence passée.
- Le classement du tableau indique le plus fort écart **historique**. Il ne constitue pas une recommandation de mise.

## Limites de connexion

L'API sportive peut être indisponible, limitée ou changer ses politiques d'accès. GitHub Pages n'héberge pas de serveur proxy ; si l'API bloque CORS, il faudra ajouter un backend/proxy autorisé. Aucune récupération de cotes de bookmaker ni scraping non autorisé n'est implémenté.
