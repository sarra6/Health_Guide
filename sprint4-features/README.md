# Sprint 4: Profil, Médicaments & Rendez-vous (Semaine 5)

## Objectifs
- Gestion du profil utilisateur
- Suivi des médicaments
- Système de rendez-vous
- Dashboard médecin avancé

## Fichiers du Projet
```
backend/
├── controllers/
│   ├── doctorController.js     # Gestion patients/prescriptions
│   ├── medicationController.js  # CRUD médicaments
│   ├── appointmentController.js # CRUD rendez-vous
│   └── profileController.js     # Gestion profil
├── routes/
│   ├── doctorRoutes.js          # Routes médecin
│   ├── medicationRoutes.js      # Routes médicaments
│   ├── appointmentRoutes.js     # Routes rendez-vous
│   └── profileRoutes.js         # Routes profil
├── models/
│   ├── Medication.js            # Modèle médicament
│   ├── Prescription.js          # Modèle prescription
│   └── Appointment.js           # Modèle rendez-vous
└── services/
    └── recommendationService.js # Recommandations

frontend/src/pages/
├── Profile.jsx                  # Page profil
├── Profile.module.css           # Styles profil
├── Medications.jsx              # Liste médicaments
├── Appointments.jsx             # Gestion RDV
├── DoctorDashboard.jsx          # Dashboard médecin
├── DoctorDashboard.module.css   # Styles dashboard
├── Landing.jsx                  # Page d'accueil
└── Landing.module.css           # Styles landing

frontend/pages/
├── assistant.html               # Version HTML assistant
├── doctor-dashboard.html       # Version HTML dashboard
└── image-analysis.html          # Version HTML analyse
```

## Nouveaux Modèles de Données

### Medication
| Champ | Type | Description |
|-------|------|-------------|
| userId | UUID | Propriétaire |
| name | STRING | Nom médicament |
| dosage | STRING | Dosage |
| frequency | STRING | Fréquence |
| startDate | DATE | Date début |
| endDate | DATE | Date fin |
| status | ENUM | active/completed |

### Appointment
| Champ | Type | Description |
|-------|------|-------------|
| patientId | UUID | Patient |
| doctorId | UUID | Médecin |
| date | DATE | Date RDV |
| time | TIME | Heure RDV |
| location | STRING | Lieu |
| status | ENUM | scheduled/completed/cancelled |

### Prescription
| Champ | Type | Description |
|-------|------|-------------|
| patientId | UUID | Patient |
| doctorId | UUID | Médecin |
| medicationName | STRING | Médicament |
| dosage | STRING | Dosage |
| instructions | TEXT | Instructions |

## Fonctionnalités

### Patient
- Voir et modifier son profil
- Liste de ses médicaments
- Prendre des rendez-vous
- Voir ses ordonnances

### Médecin
- Dashboard avec liste patients
- Créer des ordonnances
- Gérer ses rendez-vous
- Voir historiques patients

## API Endpoints
| Méthode | Route | Description |
|---------|-------|-------------|
| GET/PUT | `/api/profile` | Profil utilisateur |
| GET/POST | `/api/medications` | Médicaments |
| GET/POST | `/api/appointments` | Rendez-vous |
| GET | `/doctor/patients` | Liste patients |
| GET/POST | `/doctor/prescriptions` | Ordonnances |

## Livrables
- [x] Gestion profil utilisateur
- [x] Suivi médicaments
- [x] Système rendez-vous
- [x] Dashboard médecin complet
