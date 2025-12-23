<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1aLtat2RRnhZhMmqhqp84kBFWdG3kJwkJ

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


Ensure you have Node.js installed on your machine.
Check by running node -v in your terminal.
If not installed, download it from nodejs.org.
2. Create the Project Folder
Open your terminal or command prompt and run:
code
Bash
mkdir jules-dashboard
cd jules-dashboard
3. Initialize the Project
Create a package.json file to manage the development tools:
code
Bash
npm init -y
Now, install Vite and the necessary React types:
code
Bash
npm install vite @vitejs/plugin-react -D
npm install react react-dom lucide-react lightweight-charts
4. Setup the File Structure
You must organize the files exactly as they are named in your code. Create the following structure:
code
Text
jules-dashboard/
├── index.html
├── index.tsx
├── App.tsx
├── types.ts
├── vite.config.ts
└── components/
    ├── Header.tsx
    ├── Dashboard.tsx
    ├── WidgetWrapper.tsx
    ├── AuctionWidget.tsx
    ├── OptionChain.tsx
    ├── TradePanel.tsx
    ├── Heavyweights.tsx
    ├── SentimentWidget.tsx
    └── ActiveTrades.tsx
5. Create the Configuration Files
A. Create vite.config.ts (This tells Vite how to handle React):
code
TypeScript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
B. Update index.html:
In your provided index.html, you need to add one line inside the <body> tag to tell the browser to start your React code. Update your index.html so the body looks like this:
code
Html
<body>
  <div id="root"></div>
  <!-- Add this line below -->
  <script type="module" src="/index.tsx"></script>
</body>
6. Copy the Code
Now, copy and paste the content for every file you provided into the corresponding file in your new folder:
Paste START OF FILE index.tsx into index.tsx.
Paste START OF FILE components/Header.tsx into components/Header.tsx.
...and so on for all files.
7. Run the Application
In your terminal, inside the jules-dashboard folder, run:
code
Bash
npx vite
8. Access the UI
Vite will provide a URL, usually http://localhost:3000.
Open this in your browser.
The UI will show "Offline" initially. This is because it is waiting for your Java backend.
9. Connect the Backend
For the data to appear:
Ensure your Java System is running.
Ensure it is hosting a WebSocket server at ws://localhost:7070/data.
As soon as the Java server starts sending the JSON objects you provided, the dashboard will turn green ("Live") and the charts will start moving automatically.
Troubleshooting "Can't see anything"
If the screen is still blank:
Check Browser Console: Press F12 -> Console. Look for red errors.
Import Map conflict: Since we installed packages via npm in step 3, you can remove the <script type="importmap"> section from index.html. Vite handles those imports automatically.
WebSocket Errors: If you see "Connection Refused", your Java backend is either not running or blocked by a firewall on port 7070.
