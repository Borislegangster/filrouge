# Système de Gestion d'Équipement

## Aperçu

Ceci est une application web full-stack conçue pour la gestion de l'inventaire d'équipements, des prêts, des retours, des problèmes signalés et des tâches administratives associées. Elle dispose d'un frontend en React (TypeScript) et d'une API backend en Laravel (PHP).

## Fonctionnalités

*   **Gestion des Utilisateurs :**
    *   Authentification (Connexion, Inscription)
    *   Réinitialisation de mot de passe (Mot de passe oublié, Vérification par code)
    *   Invitations d'utilisateurs par email
    *   Contrôle d'accès basé sur les rôles (implicite)
    *   Gestion du profil utilisateur
*   **Gestion de l'Inventaire et des Actifs :**
    *   CRUD (Créer, Lire, Mettre à jour, Supprimer) pour les Équipements
    *   Gestion des Salles (CRUD)
    *   Gestion des Fournisseurs (CRUD)
*   **Opérations :**
    *   Système de prêt et de retour d'équipement
    *   Signalement et suivi des problèmes pour les équipements
    *   Demandes d'acquisition (incluant le flux d'approbation/rejet)
*   **Fonctionnalités Système :**
    *   Tableau de bord général
    *   Système de notifications
    *   Tâches planifiées (ex: identification des prêts en retard)
    *   Architecture orientée API (backend Laravel servant un frontend React)

## Stack Technique

*   **Backend :**
    *   PHP / Framework Laravel
    *   Laravel Sanctum (Authentification API)
    *   Composer (Gestion des dépendances)
    *   API Mailjet (pour l'envoi d'emails comme les invitations et réinitialisations de mot de passe)
    *   MySQL / PostgreSQL / SQLite (Base de données - le type dépend de la configuration `.env`)
    *   PHPUnit (Tests)
*   **Frontend :**
    *   React (avec TypeScript)
    *   Vite (Outil de build)
    *   CSS (Potentiellement Tailwind CSS ou CSS standard - à confirmer)
    *   Axios/Fetch (pour la communication API - déduit)
    *   React Router (pour le routage - déduit)
    *   Context API (pour la gestion d'état - déduit)
    *   NPM (Gestion des dépendances)
*   **Développement :**
    *   VS Code (Configuration éditeur présente)
    *   ESLint (Linting de code pour le frontend)

## Structure du Projet

Le projet est organisé en deux répertoires principaux :

*   `backend/`: Contient l'application API Laravel.
*   `client/`: Contient l'application frontend React.

## Démarrage

### Prérequis

*   PHP (>= version spécifiée dans `backend/composer.json`)
*   Composer
*   Node.js et NPM
*   Un serveur de base de données (MySQL, PostgreSQL, SQLite, etc.) compatible avec Laravel.
*   Clés API Mailjet (si la fonctionnalité d'email est requise)

### Configuration Backend

1.  **Naviguer vers le répertoire backend :**
    ```bash
    cd backend
    ```
2.  **Installer les dépendances PHP :**
    ```bash
    composer install
    ```
3.  **Créer le fichier d'environnement :**
    ```bash
    cp .env.example .env
    ```
4.  **Configurer votre environnement :**
    *   Mettre à jour `.env` avec vos identifiants de base de données (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`, etc.).
    *   Ajouter vos clés API Mailjet (`MAILJET_APIKEY`, `MAILJET_APISECRET`).
    *   Définir `APP_URL` et `FRONTEND_URL`.
5.  **Générer la clé d'application :**
    ```bash
    php artisan key:generate
    ```
6.  **Exécuter les migrations et les seeders (optionnel mais recommandé pour la configuration initiale) :**
    ```bash
    php artisan migrate --seed
    ```
7.  **Servir l'application :**
    ```bash
    php artisan serve
    ```
    *(Ou configurer un serveur web comme Nginx ou Apache)*

### Configuration Frontend

1.  **Naviguer vers le répertoire client :**
    ```bash
    cd ../client
    ```
2.  **Installer les dépendances Node.js :**
    ```bash
    npm install
    ```
3.  **Configurer le point de terminaison de l'API :**
    *   S'assurer que la configuration du point de terminaison de l'API (probablement dans `src/api/api.ts` ou une variable d'environnement) pointe vers votre backend en cours d'exécution (ex: `http://localhost:8000` si vous utilisez `php artisan serve`).
4.  **Démarrer le serveur de développement :**
    ```bash
    npm run dev
    ```
5.  Ouvrez votre navigateur et naviguez vers l'URL fournie par Vite (généralement `http://localhost:5173`).

## Lancer les Tests

*   **Backend :**
    ```bash
    cd backend
    php artisan test
    ```
    *(Ou `./vendor/bin/phpunit`)*
*   **Frontend :** (En supposant que les tests sont configurés dans `package.json`)
    ```bash
    cd client
    npm test
    ```

## Licence

(Licence MIT)

---