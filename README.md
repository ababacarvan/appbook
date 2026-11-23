# AppBook — Digital Reading & Publishing Platform


---

## 🎯 Présentation du projet

**AppBook** est une plateforme numérique dédiée à la lecture, à la découverte et à la publication de contenus digitaux.

Inspirée des plateformes de lecture numérique telles que YouScribe, elle vise à proposer un environnement centralisé permettant aux lecteurs, auteurs et éditeurs d'accéder à une bibliothèque de contenus variés.

L'application est conçue autour d'une architecture moderne basée sur Next.js, Supabase et PostgreSQL, avec une gestion structurée des utilisateurs, des contenus, des abonnements et des interactions.

**Vision :** rendre la lecture numérique plus accessible grâce à une expérience moderne, intuitive et évolutive.

## ✨ Fonctionnalités clés

### 👤 Gestion des utilisateurs et authentification
- Inscription et connexion sécurisées.
- Gestion des profils utilisateurs.
- Gestion des rôles et des autorisations.
- Gestion des profils auteurs.
- Suivi des auteurs et abonnements aux auteurs.

### 📚 Catalogue de contenus numériques
- Gestion des livres et publications.
- Organisation par catégories et tags.
- Gestion des formats PDF, EPUB, MOBI et audio.
- Gestion des couvertures et fichiers numériques.
- Gestion des publications et des statuts de validation.
- Gestion des contenus gratuits et premium.

### 📖 Expérience de lecture
- Bibliothèque personnelle.
- Gestion des favoris.
- Création de collections personnalisées.
- Suivi de progression de lecture.
- Reprise de lecture.
- Gestion des pages des livres.

### 🎧 Expérience audio
- Gestion des livres audio.
- Organisation des chapitres.
- Suivi de progression d'écoute.
- Gestion des positions de lecture audio.

### ⭐ Interaction et engagement
- Système de notation et commentaires.
- Modération des avis.
- Notifications utilisateurs.
- Historique des activités.

### 💳 Abonnements et paiements
- Gestion des abonnements.
- Gestion des périodes d'essai.
- Suivi des transactions.
- Gestion des statuts de paiement.
- Gestion des offres premium.

### 🛡️ Administration
- Gestion des utilisateurs et des rôles.
- Gestion des auteurs et publications.
- Modération des contenus.
- Gestion des catégories et paramètres.
- Suivi de l'activité de la plateforme.

---

## 🏗️ Architecture technique

Le projet repose sur une architecture Full Stack utilisant les technologies suivantes :

| Couche | Technologies |
|---|---|
| Frontend | Next.js 14, React, TypeScript |
| Backend | Next.js App Router, API Routes |
| Authentification | Supabase Auth |
| Base de données | PostgreSQL |
| ORM | Prisma |
| Stockage | Supabase Storage |
| Styling | Tailwind CSS |
| Déploiement cible | Vercel |

### Architecture globale

```text
                 ┌──────────────────────┐
                 │       APPBOOK        │
                 │    Next.js 14        │
                 │  React + TypeScript  │
                 └──────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                │                      │
         ┌──────▼──────┐        ┌──────▼──────┐
         │  Frontend   │        │  Backend    │
         │  App Router │        │ API Routes  │
         └─────────────┘        └──────┬──────┘
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                    ┌────▼────┐ ┌─────▼────┐ ┌────▼─────┐
                    │ Supabase│ │ Prisma   │ │ Supabase │
                    │  Auth   │ │   ORM    │ │ Storage  │
                    └─────────┘ └─────┬────┘ └──────────┘
                                      │
                                ┌─────▼─────┐
                                │PostgreSQL │
                                │ Database  │
                                └───────────┘
```

## 🗄️ Modélisation des données

La base de données PostgreSQL est gérée avec Prisma ORM.

Le modèle de données couvre plusieurs domaines métier :

| Domaine | Principales entités |
|---|---|
| Utilisateurs | User, Author, AuthorFollow |
| Catalogue | Book, Category, Tag |
| Interaction | Review, Favorite |
| Bibliothèque | Library, Collection, CollectionBook |
| Lecture | BookPage, ReadingProgress |
| Audio | AudioChapter, ListeningProgress |
| Paiement | Subscription, Payment |
| Administration | Notification, ActivityLog, Setting |

La modélisation intègre également :
- Des relations entre les utilisateurs et les auteurs.
- Des contraintes d'unicité.
- Des index pour optimiser les recherches.
- Des relations avec suppression en cascade lorsque nécessaire.
- Des énumérations pour sécuriser les statuts métier.

## 📂 Structure du projet

```text
appbook/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   └── # Composants réutilisables
│
├── hooks/
│   └── # Hooks React personnalisés
│
├── lib/
│   └── # Configuration Supabase et utilitaires
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   └── # Images et ressources statiques
│
├── styles/
│   └── # Styles de l'application
│
├── types/
│   └── # Types TypeScript
│
├── middleware.ts
├── next.config.js
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

## ⚙️ Installation et démarrage

### Prérequis

- Node.js
- npm
- PostgreSQL ou un projet Supabase
- Un compte Supabase

### 1. Cloner le repository

```bash
git clone https://github.com/ababacarvan/appbook.git

cd appbook
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` :

```env
DATABASE_URL="YOUR_DATABASE_CONNECTION_URL"
DIRECT_URL="YOUR_DIRECT_DATABASE_URL"

NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

### 4. Initialiser Prisma

```bash
npx prisma generate

npx prisma migrate dev --name init
```

### 5. Démarrer l'application

```bash
npm run dev
```

Application accessible sur :

http://localhost:3000

---

## 🔐 Sécurité et bonnes pratiques

La conception du projet prend en compte plusieurs aspects de sécurité :

- Authentification centralisée avec Supabase Auth.
- Gestion des rôles et permissions.
- Protection des routes sensibles.
- Validation des données côté serveur.
- Gestion sécurisée des variables d'environnement.
- Gestion des accès aux fichiers.
- Politiques RLS pour les ressources exposées via Supabase.

## 🚀 Déploiement

La plateforme est conçue pour être déployée sur **Vercel**, avec Supabase pour les services d'authentification, de stockage et de base de données.

Le déploiement nécessite la configuration des variables d'environnement et l'application des migrations Prisma en production.

```bash
npx prisma migrate deploy
```

---

## 🧠 Compétences techniques démontrées

Ce projet constitue une mise en pratique de compétences en développement Full Stack :

- **Frontend Engineering :** React, Next.js, TypeScript.
- **Backend Development :** API REST avec Next.js.
- **Database Engineering :** PostgreSQL, Prisma ORM, modélisation relationnelle.
- **Authentication & Authorization :** Supabase Auth et gestion des rôles.
- **Cloud Storage :** Supabase Storage.
- **Software Architecture :** séparation des responsabilités et organisation modulaire.
- **Data Management :** relations complexes, contraintes et indexation.
- **Deployment :** préparation au déploiement avec Vercel.

---


