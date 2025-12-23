# Jules-HF-ATS Local Setup

This project uses **Vite** for the frontend and a **Node.js WebSocket Bridge** for MongoDB integration.

## Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally)

## How to Run

### 1. Start the Dashboard (Frontend)
Simply double-click the `run_dashboard.bat` file.
- It will automatically run `npm install` for you.
- It will start the dev server at `http://localhost:5173`.

### 2. Start the MongoDB Bridge (Backend)
Open a new terminal window and run:
```bash
node mongo_bridge.js
```
*Note: Make sure your MongoDB service is started.*

### 3. Connect the UI
1. Open `http://localhost:5173` in your browser.
2. Click the **Settings** (Gear icon) in the top right.
3. Go to **Auth & Network**.
4. Select **Java/Mongo Bridge**.
5. Ensure the URL is `ws://localhost:8080`.
6. Click **Initiate Live Feed**.

## Troubleshooting
- **Port Conflict**: If port 5173 is in use, check `vite.config.ts`.
- **Mongo Connection**: If the bridge fails, verify `MONGO_URI` in `mongo_bridge.js`.
