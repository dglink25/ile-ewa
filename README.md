# Ilé Ẹwà — Site + Back Office

Site dynamique complet inspiré de la structure de cercle-nv.com, avec back office
complet pour un client non-informaticien.

## Stack
- **Backend** : Node.js + Express + MySQL (via Knex — migrations évolutives)
- **Frontend** : React (Vite) + React Router
- **Éditeur de contenu** : TipTap (type Word — gras, italique, couleurs, tableaux, liens), aucune connaissance HTML requise
- **Thème** : sombre / clair / système, avec bascule manuelle en haut à droite

## Arborescence
```
ile-ewa/
  backend/     -> API Node.js/Express + migrations MySQL
  frontend/    -> Application React (site public + back office admin)
```

## 1. Installation de la base de données

```bash
mysql -u root -p -e "CREATE DATABASE ile_ewa CHARACTER SET utf8mb4;"
```

## 2. Backend

```bash
cd backend
cp .env.example .env
# éditez .env : DB_HOST, DB_USER, DB_PASSWORD, JWT secrets...
npm install
npm run migrate      # crée toutes les tables
npm run seed         # crée les rôles + un compte admin par défaut
npm run dev           # démarre l'API sur http://localhost:4000
```

**Compte admin par défaut créé par le seed :**
`admin@ile-ewa.com` / `ChangeMoi123!` — à changer immédiatement une fois connecté
(prévoir un écran "changer mon mot de passe" avant mise en prod, pas encore livré
dans ce MVP).

### Gestion des migrations évolutives

Chaque modification de schéma (ajout de colonne, nouvelle table, etc.) se fait
en créant une **nouvelle** migration, jamais en modifiant une ancienne déjà
exécutée en production — ainsi aucune donnée existante n'est perdue :

```bash
npm run migrate:make -- nom_de_la_modification
# éditez le fichier généré dans src/db/migrations/
npm run migrate
```

Pour annuler la dernière migration (développement uniquement) :
```bash
npm run migrate:rollback
```

## 3. Frontend

```bash
cd frontend
npm install
npm run dev   # démarre sur http://localhost:5173, proxy API configuré vers :4000
```

## Fonctionnalités livrées (MVP complet)

**Site public**
- Accueil, page "Présentation" éditable, autres pages dynamiques par slug
- Annuaire public des membres (fiches publiées uniquement)
- Blog avec catégories
- Inscription à la newsletter
- Formulaire de contact
- Inscription visiteur → devient membre automatiquement
- Bascule de thème sombre / clair / système

**Espace membre** (rôle `member`)
- Connexion / inscription publique
- Édition de sa propre fiche (nom, ville, téléphone, photo, présentation riche)
  — visible dans l'annuaire une fois validée par l'admin

**Back office admin** (rôle `admin`)
- Gestion des pages du site (éditeur riche type Word : gras, couleurs, tableaux, liens)
- Gestion du blog (articles, catégories, statut brouillon/publié)
- Gestion des membres (validation / publication des fiches dans l'annuaire)
- Gestion du menu de navigation (ajout/suppression/ordre)
- Médiathèque (upload d'images/PDF, copie de lien à réutiliser partout)
- Paramètres du site (nom, logo, couleur d'accent, réseaux sociaux, pied de page)

## Prochaines étapes suggérées
- Écran "changer mon mot de passe" / réinitialisation par email
- Export CSV des abonnés newsletter (déjà en base, à brancher sur un bouton)
- Envoi d'emails transactionnels (confirmation inscription, contact)
- Application des couleurs de `settings` (logo, accent_color) dynamiquement dans le frontend
- Déploiement (ex: VPS avec Nginx + PM2, ou Railway/Render pour l'API et Vercel/Netlify pour le frontend)
