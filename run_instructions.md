# Jules-HF-ATS Startup Instructions

Follow these steps to replay your market data on your local machine.

## 1. Initial Setup
Open your terminal in the project root folder and install the necessary libraries:
```bash
npm install
```

## 2. Launch the Dashboard
Start the Vite frontend server:
```bash
npm run dev
```
The dashboard will open at: **http://localhost:5173**

## 3. Configure the Connection
1. Open the dashboard in your browser.
2. Click the **Gear Icon** (Settings) in the top right.
3. Select the **Auth & Network** tab.
4. Choose **Java/Mongo Bridge**.
5. Ensure the URL is: `ws://localhost:8080`
6. Click **Initiate Live Feed**.

## 4. Run the Replay Bridge
In a **new terminal window**, start the MongoDB replay script:
```bash
node mongo_bridge.js
```

### Terminal Feedback:
- The terminal will show `[REPLAY] Waiting for Dashboard...` until you click the button in Step 3.
- Once connected, it will begin streaming your historical `tick_data` into the charts.
- You can stop the replay at any time with `Ctrl+C`.

---

### Customizing Playback Speed
If you want the market to move faster, open `mongo_bridge.js` and change:
`const REPLAY_DELAY_MS = 50;` to `10;` (for 10x speed).
