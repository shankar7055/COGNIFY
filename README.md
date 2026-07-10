# Cognify — AI Operations Platform

Cognify is an enterprise-grade AI Operations Platform designed for technical teams to build, simulate, and manage AI-driven workflows visually. Featuring a custom drag-and-drop workspace canvas, multi-agent registries, team collaboration comment threads, vector memory search interfaces, and integrated payment checkouts, Cognify provides a comprehensive SaaS cockpit for autonomous AI pipelines.

---

## 🚀 Key Features

### 1. Visual Workflow Graph Builder
* **Drag-and-Drop Editor**: Powered by `@xyflow/react` (React Flow) for managing nodes, connectors, and parameters.
* **Auto Layout Grid**: Leverages Dagre positioning algorithms to auto-arrange complex workflow loops dynamically.
* **Property Inspector**: Configure trigger events, specify execution parameters, and link integrations (Slack, Notion, Google Sheets) per node.
* **Execution Logs Panel**: Inspect step-by-step telemetry, timing info, and exceptions from worker runs.

### 2. Multi-Agent Engine & Memory Register
* **Agent Personalization**: Spin up customized personas (Code Review, Market Research, Business Analysis) to run parallelized queries.
* **Vector Memory Search**: Explore ingested documents with semantic search, querying similarity indexes mapped directly to vector embeddings (1536 dimensions).
* **Ingestion Logging**: View ingestion pipelines status feeds (Ready, Ingestion in progress, Processing failed) in real time.

### 3. Real-time Collaboration Hub
* **Threaded Commenting**: Engage team members on shared workspaces.
* **Rich Interactions**: Includes user mentions (`@member`), resource tagging (`#workspace`), and emoji reaction pills (👍, ❤️, 🔥, 🚀) with interactive state counters.
* **Access Control Guardrails**: Restrict folders, files, prompts, and chats dynamically using workspace team membership middleware.

### 4. Razorpay & Stripe Payment Integration
* **Dynamic Checkout**: Integrated Razorpay Checkout modal for Indian credit cards, UPI, and Netbanking payments. Falls back to Stripe Hosted Checkout Sessions globally.
* **Secured Upgrades**: Verified signatures using HMAC-SHA256 handles on the server to prevent tamper exploits.
* **Polished Pricing UI**: Integrated monthly/yearly pricing toggles with opacity transitions, token count highlight metrics, and a secure payment trust footer.

### 5. Production Infrastructure
* **PM2 Clustering**: Run Express backend services on multi-core environments in cluster mode (`exec_mode: "cluster"`) for load balancing and fault tolerance.
* **Error Tracking**: Complete Sentry SDK integration capturing unhandled middleware errors and tracking frontend trace diagnostics.
* **Auto Deployment**: Clean Shell scripts (`deploy.sh`) coordinating git pulling, database migrations, package compiling, and zero-downtime clustering reloads.

---

## 🛠️ Tech Stack

### Frontend Client
* **Core Framework**: React 18, Vite, TypeScript
* **State & Routing**: React Router DOM, React Contexts
* **Visual Graph**: `@xyflow/react` (React Flow), Dagre Layout
* **Animations**: Framer Motion / Motion
* **Styling**: Tailwind CSS, Vanilla CSS HSL tokens, Lucide Icons

### Backend Server
* **Core Runtime**: Node.js, Express, TypeScript
* **Database & ORM**: PostgreSQL, Prisma ORM
* **Queue Worker**: BullMQ, Redis (event-driven workflow execution)
* **Gateways**: Razorpay Node SDK, Stripe SDK
* **Logging & Monitoring**: Sentry SDK, Winston Loggers

---

## 📁 Repository Structure

```text
Cognify/
├── backend/                  # Legacy/Archived source folder
└── cognify/                  # Active codebase directory
    ├── cognify-client/       # React Frontend Application
    │   ├── landingSettings/  # Marketing pages & pricing settings
    │   ├── notusComponents/  # UI elements (landing, navbar, sign-in/up)
    │   ├── src/
    │   │   ├── pages/        # Dashboard (AIChat, Workspaces, Collaboration)
    │   │   ├── utils/        # Axios API clients
    │   │   └── index.css     # CSS tokens, animations, and custom utility base
    │   └── vite.config.ts    # Frontend builder configuration
    │
    ├── cognify-server/       # Express Backend Application
    │   ├── prisma/           # Database schema definition
    │   ├── src/
    │   │   ├── config/       # Env variables, Redis connections, Razorpay SDK
    │   │   ├── middleware/   # Auth gates & Workspace Access verification
    │   │   ├── queues/       # BullMQ tasks, worker logic & execution engine
    │   │   ├── routes/       # Auth routes, billing checkouts, workspace logs
    │   │   └── server.ts     # Express engine startup with Sentry SDK
    │   ├── ecosystem.config.js # PM2 clustering properties
    │   └── package.json
    │
    └── deploy.sh             # Production server deploy script
```

---

## ⚙️ Setup & Installation

### Prerequisites
* **Node.js**: `v18+` or `v20+`
* **PostgreSQL**: A running instance database URL
* **Redis**: Active service for BullMQ workflow queues
* **Razorpay / Stripe Credentials**: Keys set up for checkout routing

### 1. Database Setup
Create a PostgreSQL database and copy the connection string. In the `cognify-server` directory, create a `.env` file containing:
```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/cognify"
JWT_SECRET="your_jwt_secret"

# Redis
REDIS_HOST="127.0.0.1"
REDIS_PORT=6379

# Razorpay (India)
RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."

# Stripe (Global)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Sentry
SENTRY_DSN="https://..."
```

Run database migrations to generate database tables:
```bash
cd cognify/cognify-server
npm install
npx prisma db push
```

### 2. Run Backend Server (Development)
```bash
npm run dev
```
The server will boot up and start listening on `http://localhost:3000`.

### 3. Run Frontend Client (Development)
Navigate to the frontend application and set up the connection endpoints inside the local configurations.
```bash
cd ../cognify-client
npm install
npm run dev
```
The development hot-reload server will host the client application on `http://localhost:5173`.

---

## 🛡️ Workspace Access Control Middleware

To prevent leakage of private workspace configurations in multi-user teams, all document, file, prompt, and workflow routes are secured by `workspaceAccess.middleware.ts`:
```typescript
// src/middleware/workspaceAccess.middleware.ts
export const verifyWorkspaceAccess = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  const workspaceId = req.params.workspaceId || req.body.workspaceId;

  // Checks database relations ensuring that the request issuer is the 
  // workspace owner OR is a member of the team linked to the workspace.
  const hasAccess = await workspaceService.validateUserAccess(workspaceId, userId);
  if (!hasAccess) {
    return res.status(403).json({ message: "Workspace access denied." });
  }
  next();
};
```

---

## 📦 PM2 Production Clustering & Deployment

Deploying changes on a remote instance is fully automated using the custom clustering settings.

### PM2 Configuration (`ecosystem.config.js`)
Configured to scale backend nodes cleanly across all available core threads:
```javascript
module.exports = {
  apps: [{
    name: "cognify-server",
    script: "./dist/server.js",
    instances: "max",
    exec_mode: "cluster",
    autorestart: true,
    max_memory_restart: "1G",
    env_production: {
      NODE_ENV: "production"
    }
  }]
};
```

### Zero-Downtime Deployment
Deploy code instantly on the host server:
```bash
chmod +x deploy.sh
./deploy.sh
```

The script automates code downloads, database updates, compiler targets, and runs zero-downtime reloads:
```bash
git pull origin main
cd cognify-server
npm install
npx prisma db push
npm run build
pm2 reload ecosystem.config.js --env production
```

---

## 📄 License
This project is proprietary and confidential. All rights reserved by Shankar.

