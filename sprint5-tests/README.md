# 🩺 HealthGuide AI — Smart Health Assistant

A full-stack medical AI assistant with three intelligent layers: symptom analysis, medical image analysis, and a doctor review dashboard.

---

## 🏗️ Architecture

```
health-guide/
├── backend/                  # Node.js + Express + MySQL
│   ├── server.js             # Entry point
│   ├── config/db.js          # MySQL/Sequelize connection
│   ├── models/               # Sequelize models
│   ├── routes/               # Express routes
│   ├── controllers/          # Request handlers
│   ├── middleware/           # Auth middleware (JWT + RBAC)
│   ├── services/             # AI logic layer
│   │   ├── smartAssistantService.js   # Symptom & chat AI
│   │   ├── imageAnalysisService.js    # Medical vision AI
│   │   └── recommendationService.js  # Rule-based engine
│   └── utils/promptBuilder.js
├── frontend/                 # Vanilla HTML/CSS/JS
│   ├── index.html            # Landing page
│   ├── style.css             # Design system
│   ├── app.js                # Auth & API helpers
│   └── pages/
│       ├── assistant.html    # AI chat + symptom checker
│       ├── image-analysis.html
│       └── doctor-dashboard.html
└── database/schema.sql       # Reference SQL schema
```

---

## 🚀 Quick Start

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and Anthropic API key
npm run dev
```

### Frontend

Open `frontend/index.html` in a browser, or serve with:
```bash
npx serve frontend
```

---

## 🔧 Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |
| `CLIENT_URL` | Frontend URL for CORS |
| `DB_HOST` | MySQL database host |
| `DB_PORT` | MySQL database port (default: 3306) |
| `DB_NAME` | MySQL database name |
| `DB_USER` | MySQL database username |
| `DB_PASS` | MySQL database password |
| `JWT_SECRET` | Secret key for JWT tokens (required) |
| `JWT_EXPIRES_IN` | JWT token expiration (default: 7d) |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI (required) |

---

## 🧠 AI Layers

### Layer 1: Traditional Web App
- JWT Authentication (patient / doctor / admin roles)
- CRUD health data tracking
- REST API with rate limiting

### Layer 2: Smart AI Assistant
- **smartAssistantService.js** — NLP symptom analysis via Claude API
- **recommendationService.js** — Rule-based risk detection (no ML required)
- Real-time chat with medical context

### Layer 3: Medical Image Analysis
- **imageAnalysisService.js** — Vision AI for X-rays and skin conditions
- Confidence scoring + structured findings
- Extendable to Flask/TensorFlow microservice

---

## 🔐 Security

- JWT Authentication
- Role-Based Access Control (patient / doctor / admin)
- Rate limiting (global + per-AI-endpoint)
- Input validation via express-validator
- Medical disclaimer on all AI outputs

---

## 📊 API Endpoints

### Auth
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |

### Health Data
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/health` | Add health record |
| GET | `/api/health` | Get history |
| GET | `/api/health/latest` | Latest record |

### AI
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/ai/symptoms` | Analyze symptoms |
| POST | `/api/ai/vitals` | Analyze vitals |
| POST | `/api/ai/image` | Analyze medical image |
| GET | `/api/ai/reports` | Get my reports |
| GET | `/api/ai/dashboard` | Doctor dashboard (doctor only) |
| PATCH | `/api/ai/reports/:id/review` | Add doctor review |

### Chat
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat/session` | Start session |
| POST | `/api/chat/message` | Send message |
| GET | `/api/chat/sessions` | Get sessions |

---

## ⚕️ Disclaimer

> HealthGuide AI is for informational purposes only. It does not replace professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider.
