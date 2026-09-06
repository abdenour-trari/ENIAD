# Nesture AI — LetterQuest Platform

> Gesture-based learning platform for neurodiverse learners.  
> Transforming movement into communication.

---

## Overview

LetterQuest is the first tool on the Nesture AI EdTech platform. It transforms the familiar RPM letter board into an AI-powered system that:

- Tracks hand motor patterns via **MediaPipe Hands** (21 landmarks, on-device processing)
- Detects **6 primitive reflex indicators** (Moro, ATNR, STNR, TLR, Spinal Galant, Palmar Grasp)
- Generates **OT exercise recommendations** tailored to each session
- Produces **downloadable PDF session reports** for parents and OT practitioners
- Serves **3 role-based dashboards**: Learner · Parent · OT/Educator

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18, Recharts, Framer Motion, Zustand |
| Backend     | FastAPI (Python 3.11), Pydantic v2  |
| Storage     | CSV files (production: swap for PostgreSQL) |
| PDF         | ReportLab                           |
| Hand tracking | @mediapipe/hands (edge, no video sent) |
| Proxy       | Nginx                               |
| Containers  | Docker + Docker Compose             |

---

## Quick Start

### Prerequisites
- Docker Desktop ≥ 24
- Docker Compose v2

### Run

```bash
# Clone the repo
git clone <repo-url> && cd nesture-ai

# Start all services
docker-compose up --build

# Open in browser
open http://localhost
```

### Demo Accounts

| Role       | Email                    | Password    |
|------------|--------------------------|-------------|
| Learner    | maya@example.com         | password123 |
| Parent     | jennifer@example.com     | password123 |
| OT         | sarah@example.com        | password123 |

All 3 accounts are also available as one-click buttons on the login screen.

---

## Project Structure

```
nesture-ai/
├── docker-compose.yml
├── nginx/                      ← Reverse proxy
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             ← FastAPI entry point
│       ├── api/                ← Route handlers
│       │   ├── users.py        ← Auth (JWT)
│       │   ├── learners.py
│       │   ├── sessions.py     ← Game lifecycle
│       │   ├── reports.py      ← PDF download
│       │   ├── exercises.py    ← OT library + prescriptions
│       │   └── reflexes.py     ← Reflex scores + trends
│       ├── core/
│       │   ├── config.py       ← Settings (env vars)
│       │   ├── csv_store.py    ← CSV persistence layer
│       │   └── data_init.py    ← Seed data
│       ├── models/
│       │   └── schemas.py      ← Pydantic schemas
│       └── services/
│           ├── ai_engine.py    ← Rule-based reflex analysis
│           └── report_generator.py ← ReportLab PDF
└── frontend/
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── App.js              ← Router + role-based guards
        ├── store/              ← Zustand (auth + session state)
        ├── services/api.js     ← Axios client
        ├── hooks/
        │   ├── useHandTracking.js   ← MediaPipe wrapper
        │   └── useSessionData.js    ← Data fetching hooks
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── LearnerHome.jsx      ← Game launcher
        │   ├── GamePage.jsx         ← LetterQuest game + tracking
        │   ├── SessionResults.jsx   ← Post-game analysis
        │   ├── ParentDashboard.jsx
        │   ├── OTDashboard.jsx
        │   └── LearnerDetail.jsx    ← OT per-learner deep-dive
        └── components/
            ├── game/
            │   ├── LetterBoard.jsx
            │   └── RealtimeMetricsPanel.jsx
            ├── dashboards/
            │   ├── SessionReportCard.jsx
            │   └── ExerciseCard.jsx
            └── shared/
                ├── Sidebar.jsx
                ├── ReflexScoreCard.jsx
                ├── LoadingScreen.jsx
                └── ErrorBoundary.jsx
```

---

## API Reference

### Auth
| Method | Endpoint              | Description                 |
|--------|-----------------------|-----------------------------|
| POST   | /api/users/login      | Returns JWT token           |
| GET    | /api/users/demo-accounts | Demo credentials         |

### Sessions (Game Lifecycle)
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | /api/sessions/start             | Start a new session      |
| POST   | /api/sessions/end               | End + run AI analysis    |
| GET    | /api/sessions/learner/{id}      | Session history          |
| GET    | /api/sessions/{id}/analysis     | AI analysis for session  |

### Learners
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/learners/                  | All learners             |
| GET    | /api/learners/{id}              | Learner by ID            |
| GET    | /api/learners/by-parent/{id}    | Learners for parent      |
| GET    | /api/learners/by-ot/{id}        | Learners for OT          |

### Reports
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/reports/{session_id}/pdf   | Download PDF report      |

### Exercises
| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| GET    | /api/exercises/                 | All exercises (filterable) |
| POST   | /api/exercises/prescribe        | OT prescribes exercise   |
| GET    | /api/exercises/prescriptions/{learner_id} | Prescriptions  |

### Reflexes
| Method | Endpoint                              | Description           |
|--------|---------------------------------------|-----------------------|
| GET    | /api/reflexes/learner/{id}/latest     | Latest scores         |
| GET    | /api/reflexes/learner/{id}/summary    | Scores + trend        |
| GET    | /api/reflexes/learner/{id}/trend      | History for one reflex |

Full interactive docs: `http://localhost:8000/docs`

---

## AI Engine — Primitive Reflex Detection

The engine is rule-based (production: replace with trained ML model).

### Reflex → Indicator mapping

| Reflex        | Key Indicators                                           | Confidence Threshold |
|---------------|----------------------------------------------------------|----------------------|
| Moro          | fail_rate > 50%, head-hand coupling > 70%               | High: 3+ indicators  |
| ATNR          | midline crossings < 5, asymmetry, head-hand coupling    | Medium: 2 indicators |
| STNR          | frequent breaks, postural fatigue, early fatigue        |                      |
| TLR           | response time > 8s, spatial drift, poor trajectory      |                      |
| Spinal Galant | erratic control, high variability, high invalid rate    |                      |
| Palmar Grasp  | slow timing, missed accurate grabs, precision difficulty|                      |

Only **High** and **Medium** confidence flags are surfaced to parents/OT.  
**Low** confidence = monitor only (not shown in reports).

### LPI (Learner Progress Index)

Composite 0–100 score:
- Accuracy × 40%
- Response time (normalised) × 25%
- Trajectory smoothness × 20%
- Average reflex integration × 15%

---

## Demo Scenarios

Two scenarios are pre-seeded for demonstration:

**Happy Path (Maya Chen — learner-001)**
- 10 sessions showing improving accuracy (62% → 84%)
- LPI rising from 52 → 84
- Moro and ATNR trending positive

**Alternate Path (Liam Park — learner-002)**
- 5 sessions with flat/declining metrics
- Accuracy ~40%, response time ~7.5s
- Moro flagged High confidence
- OT dashboard shows "Needs Attention" flag

---

## Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest tests/ -v
```

---

## CSV Data Files

All data is stored in `backend/app/data/`:

| File                | Contents                              |
|---------------------|---------------------------------------|
| users.csv           | Users (hashed passwords)              |
| learners.csv        | Learner profiles                      |
| sessions.csv        | Session summaries                     |
| gestures.csv        | Per-gesture raw data                  |
| reflex_scores.csv   | Reflex scores per session             |
| exercises.csv       | OT exercise library (15 exercises)    |
| prescriptions.csv   | OT exercise assignments               |

To replace with a real database: implement the same interface as `csv_store.py` using SQLAlchemy or similar.

---

## Environment Variables

Copy `.env.example` to `.env` in `backend/`:

```
ENV=development
DATA_DIR=/app/data
CORS_ORIGINS=http://localhost:3000
SECRET_KEY=change-me-in-production
```

---

## Language & Terminology

Per the product brief — this is an **EdTech** platform, not healthcare:

| ✓ Use              | ✗ Avoid         |
|--------------------|-----------------|
| Learner            | Patient         |
| OT / Educator      | Clinician       |
| Session report     | Medical record  |
| EdTech platform    | Healthcare app  |

---

## Roadmap (Post-Phase 1)

- [ ] Real MediaPipe ML model training on collected gesture data
- [ ] Additional games: Numbers/Math, Tracing, Life Skills
- [ ] Mobile app (React Native)
- [ ] Production auth + HIPAA-compliant storage
- [ ] Real email delivery for session reports
- [ ] App store deployment

---

*Nesture AI · Confidential · March 2026*
