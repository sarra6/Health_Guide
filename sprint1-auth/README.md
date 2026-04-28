# Sprint 1: Authentification (Semaine 2)

## Objectifs
- Système d'authentification JWT
- Inscription et connexion des utilisateurs
- Gestion des rôles (patient, doctor, admin)
- Middleware d'authentification

## Fichiers du Projet
```
backend/
├── controllers/
│   └── authController.js      # Logique inscription/connexion
├── routes/
│   └── authRoutes.js         # Routes API auth
├── middleware/
│   └── authMiddleware.js     # Vérification JWT + RBAC
├── models/
│   └── User.js               # Modèle utilisateur Sequelize
└── .env                      # JWT_SECRET config

frontend/src/
├── context/
│   └── AuthContext.jsx       # Gestion état auth React
├── pages/
│   └── Landing.jsx           # Page login/register
└── services/
    └── api.js               # Config API avec headers auth
```

## User Stories
| ID | Description |
|----|-------------|
| US1.1 | En tant qu'utilisateur, je peux m'inscrire avec email/mot de passe |
| US1.2 | En tant qu'utilisateur, je peux me connecter |
| US1.3 | En tant que patient, j'accède au dashboard patient |
| US1.4 | En tant que doctor, j'accède au dashboard médecin |
| US1.5 | En tant qu'admin, je peux gérer les utilisateurs |

## API Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/auth/register` | Inscription utilisateur |
| POST | `/api/auth/login` | Connexion |
| GET | `/api/auth/me` | Profil utilisateur |

## Livrables
- [x] Inscription avec validation mot de passe
- [x] Connexion JWT fonctionnelle
- [x] Gestion des rôles patient/doctor/admin
- [x] Protection des routes API
