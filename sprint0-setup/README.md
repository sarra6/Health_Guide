# Sprint 0: Setup & Configuration (Semaine 1)

## Objectifs
- Configuration de l'environnement de développement
- Initialisation du projet Node.js et React
- Mise en place de la base de données MySQL
- Configuration des variables d'environnement

## Fichiers du Projet
```
health-guide/
├── backend/
│   ├── package.json          # Dependencies backend
│   ├── server.js             # Point d'entrée Express
│   ├── config/db.js          # Configuration Sequelize/MySQL
│   └── .env.example          # Template variables d'environnement
├── frontend/
│   ├── package.json          # Dependencies frontend
│   ├── vite.config.js        # Configuration Vite
│   └── index.html            # Point d'entrée HTML
├── database/
│   └── schema.sql            # Schéma de base de données
├── .gitignore
└── README.md
```

## Tâches Détailées
1. **Jour 1-2**: Initialisation Node.js + installation Express, Sequelize, cors, dotenv
2. **Jour 2-3**: Setup MySQL et création du schéma (users, health_data, appointments, etc.)
3. **Jour 4**: Configuration React avec Vite
4. **Jour 5**: Connexion backend-frontend et test API

## Livrables
- [x] Backend fonctionnel avec Express
- [x] Base de données MySQL opérationnelle
- [x] Frontend React configuré avec Vite
- [x] API endpoints de base accessibles
