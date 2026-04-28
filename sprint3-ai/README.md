# Sprint 3: IA & Analyse d'Images (Semaine 4)

## Objectifs
- Assistant IA pour analyse de symptômes
- Analyse d'images médicales (X-rays, peau)
- Dashboard médecin pour revue de rapports IA
- Architecture OpenRouter avec fallback

## Architecture OpenRouter
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Client    │────▶│  Backend     │────▶│ OpenRouter  │
│  (React)    │     │  (Express)   │     │  (GPT-4o)   │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Fallback   │
                    │  (Règles DB) │
                    └──────────────┘
```

## Fichiers du Projet
```
backend/
├── controllers/
│   ├── aiController.js       # Gestion requêtes IA
│   └── chatController.js     # Chat IA
├── routes/
│   └── aiRoutes.js           # Routes IA
├── services/
│   ├── aiProvider.js         # Client OpenRouter
│   ├── smartAssistantService.js  # Analyse symptômes
│   ├── imageAnalysisService.js    # Analyse images
│   └── recommendationService.js   # Moteur règles
├── models/
│   ├── AIReport.js           # Modèle rapports IA
│   └── ChatHistory.js        # Modèle historique chat
└── utils/
    └── promptBuilder.js      # Construction prompts

frontend/src/pages/
├── Assistant.jsx             # Interface chat IA
├── Assistant.module.css      # Styles assistant
├── ImageAnalysis.jsx         # Upload & analyse images
└── ImageAnalysis.module.css  # Styles analyse
```

## Fonctionnalités IA

### Layer 1: Symptom Analysis
- Analyse des symptômes via NLP
- Génération de recommandations
- Évaluation du niveau de risque

### Layer 2: Medical Image Analysis
- Upload d'images (X-rays, mélanomes)
- Analyse via Vision AI (GPT-4o)
- Score de confiance et findings structurés

### Layer 3: Doctor Dashboard
- Vue des rapports IA en attente
- Ajout de notes cliniques
- Suivi des cas critiques

## API Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/api/ai/symptoms` | Analyser symptômes |
| POST | `/api/ai/vitals` | Analyser constantes |
| POST | `/api/ai/image` | Analyser image |
| GET | `/api/ai/reports` | Liste rapports |
| GET | `/api/ai/dashboard` | Dashboard médecin |
| PATCH | `/api/ai/reports/:id/review` | Ajouter revue |

## Livrables
- [x] Assistant IA avec chat en temps réel
- [x] Analyse d'images médicales
- [x] Dashboard médecin pour revues
- [x] Architecture avec fallback
