# Portfolio KIM Anicet

Site statique : aucune installation, aucun build. Ouvre `index.html` (ou héberge le dossier tel quel : GitHub Pages, Netlify, etc.).

## Modifier ton portfolio (espace admin)
1. Clique sur le petit cadenas en bas de page (ou ajoute `#admin` à l'adresse).
2. À la première ouverture, crée ton code d'accès.
3. Le mode édition s'active : boutons + / corbeille sur le carrousel, crayon / corbeille sur chaque compétence et projet, bouton « Ajouter », et un panneau (Profil, Photos, Compétences, Projets, Données).

## Publier tes modifications
Les modifications sont enregistrées dans ton navigateur, sur cet appareil. Pour que les visiteurs les voient :
Panneau > Données > « Exporter data.js », puis remplace `js/data.js` sur ton hébergement.

## Structure
- `index.html` : structure de la page
- `css/style.css` : design
- `js/data.js` : contenu publié (profil, photos, compétences, projets)
- `js/app.js` : carrousel, navigation, espace admin
- `images/` : photos optimisées
