# Sprint 2: Dashboard & Statistiques (Semaine 3)

## Objectifs
- Tableau de bord patient interactif
- Calcul du Health Score
- Graphiques de tendances santé
- Statistiques en temps réel

## Fichiers du Projet
```
backend/
├── controllers/
│   ├── healthController.js    # CRUD données de santé
│   └── statsController.js    # Calculs statistiques
├── routes/
│   ├── healthRoutes.js       # Routes données santé
│   └── statsRoutes.js        # Routes statistiques
├── models/
│   ├── HealthData.js         # Modèle données vitales
│   └── HealthProfile.js      # Modèle profil santé
└── services/
    └── recommendationService.js  # Moteur de recommandations

frontend/src/
├── components/
│   └── Layout.jsx            # Layout avec sidebar
├── pages/
│   ├── Dashboard.jsx         # Dashboard principal
│   ├── Dashboard.module.css  # Styles dashboard
│   └── App.jsx               # Routing React
└── index.css                 # Styles globaux
```

## Algorithme Health Score
Le Health Score (0-100) est calculé basé sur:
- Tension artérielle (20 points)
- Fréquence cardiaque (15 points)
- Oxygène sanguin (15 points)
- Glucose (20 points)
- Poids/BMI (15 points)
- Température (15 points)

## Composants Graphiques
- **AreaChart**: Tendances sur le temps
- **PieChart**: Distribution des risques
- **BarChart**: Records par mois
- **StatCards**: Métriques clés

## API Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/health` | Ajouter données santé |
| GET | `/api/health` | Historique données |
| GET | `/api/health/latest` | Dernières données |
| GET | `/api/stats/overview` | Vue d'ensemble |
| GET | `/api/stats/trends` | Données tendances |
| GET | `/api/stats/alerts` | Alertes santé |

## Livrables
- [x] Dashboard interactif avec Chart.js/Recharts
- [x] Calcul automatique du Health Score
- [x] Graphiques de tendances santé
- [x] Système d'alertes
