# ⚡ UGeen Automation

Automated IPTV activation code retrieval system with a modern React dashboard and Playwright browser automation.

## 🏗 Architecture

```
ugeen/
├── frontend/      → React + TypeScript + TailwindCSS dashboard
├── backend/       → Express + WebSocket server
├── automation/    → Playwright browser automation engine
├── database/      → SQLite schema & data
├── downloads/     → Downloaded activation code files
└── docker-compose.yml
```

## 📋 Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

## 🚀 Installation

### 1. Clone & install dependencies

```bash
# Install root dependencies
npm install

# Install all sub-project dependencies
cd backend && npm install && cd ..
cd automation && npm install && cd ..
cd frontend && npm install && cd ..
```

### 2. Install Playwright browsers

```bash
cd automation
npx playwright install chromium
cd ..
```

### 3. Configure environment

```bash
# Copy the template
cp .env.example .env

# Edit with your credentials
notepad .env   # Windows
# or: nano .env  # Linux/Mac
```

**Required variables:**

| Variable | Description | Default |
|----------|-------------|---------|
| `EMAIL` | Login email for ugeen.live | — |
| `PASSWORD` | Login password | — |
| `DOWNLOAD_PATH` | Where to save files | `./downloads` |
| `HEADLESS` | Run browser visibly (`false`) or hidden (`true`) | `false` |
| `PORT` | Backend server port | `3001` |
| `DATABASE_PATH` | SQLite database file path | `./database/ugeen.db` |

## ▶️ Running

### Development mode (recommended)

```bash
# Start both backend and frontend
npm run dev
```

This starts:
- **Backend** at `http://localhost:3001`
- **Frontend** at `http://localhost:5173`

### Run automation only (CLI)

```bash
npm run start-automation
```

### Build for production

```bash
npm run build
```

## 🖥 Dashboard

Open `http://localhost:5173` in your browser.

**Features:**
- **Start/Stop** controls
- **Live logs** with color-coded entries
- **Status indicator** (Idle → Running → Success/Error)
- **Workflow progress** (Login → Navigate → Intermediary → Download → Parse)
- **Activation code display** with copy button
- **Run history** table

## 🔧 Debug

### View backend logs

```bash
cd backend && npm run dev
```

### Run automation with visible browser

Set in `.env`:
```
HEADLESS=false
```

### Error screenshots

When the automation fails, an error screenshot is saved to `./downloads/error_screenshot_*.png`.

### Common issues

| Issue | Solution |
|-------|----------|
| Browser not launching | Run `cd automation && npx playwright install chromium` |
| WebSocket not connecting | Check backend is running on port 3001 |
| Login failing | Verify EMAIL and PASSWORD in `.env` |
| Download timeout | Intermediary pages may have changed; check screenshots |

## 🐳 Docker

```bash
docker-compose up -d
```

> **Note:** Docker runs with `HEADLESS=true` by default.

## 🔄 Workflow

1. **Login** → Opens ugeen.live, fills credentials, waits for dashboard
2. **Navigate** → Clicks through to download page (activation code → renew → request)
3. **Intermediary Pages** → Handles timers, countdowns, progress bars, redirects
4. **Download** → Saves `activation_code_YYYYMMDD.txt` to `./downloads/`
5. **Parse** → Reads file, extracts activation code, saves to database

## 📁 Key Files

| File | Purpose |
|------|---------|
| `automation/src/engine.ts` | Main automation orchestrator |
| `automation/src/steps/` | Individual workflow steps |
| `automation/src/utils/selectors.ts` | Smart DOM selector strategies |
| `backend/src/server.ts` | Express + WebSocket server |
| `backend/src/services/` | Business logic services |
| `frontend/src/components/Dashboard.tsx` | Main UI layout |

## 📜 License

Private use only.
