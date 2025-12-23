
import { WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

/**
 * REPLAY CONFIGURATION
 * Database: upstox_strategy_db
 * Collection: tick_data
 */
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'upstox_strategy_db';
const COLLECTION_NAME = 'tick_data';
const WS_PORT = 8080;

/**
 * REPLAY SETTINGS
 * 100ms = Standard (10 ticks/sec)
 * 50ms = 2x Speed
 * 10ms = 10x Speed (Fast Replay)
 */
const REPLAY_DELAY_MS = 50; 

const wss = new WebSocketServer({ port: WS_PORT });

console.log(`
=========================================
   JULES-HF-ATS MONGODB REPLAY BRIDGE
=========================================
WebSocket: ws://localhost:${WS_PORT}
Database:  ${DB_NAME}
Collection: ${COLLECTION_NAME}
Speed:     ${REPLAY_DELAY_MS}ms delay
=========================================
`);

async function startBridge() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('[MONGO] Connected to local instance.');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    // Get total count for progress reporting
    const totalDocs = await collection.countDocuments();
    if (totalDocs === 0) {
      console.warn('[EMPTY] No data found in tick_data. Ensure your Java system has saved some ticks.');
      process.exit(0);
    }

    console.log(`[REPLAY] Starting playback of ${totalDocs} ticks...`);
    await runReplay(collection, totalDocs);

  } catch (err) {
    console.error('[FATAL] Connection Failed:', err.message);
    setTimeout(startBridge, 5000);
  }
}

async function runReplay(collection, totalDocs) {
  // Sort by _id to ensure we follow the order the Java system inserted them
  const cursor = collection.find({}).sort({ _id: 1 });
  
  let count = 0;
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    
    // Pause if no dashboard is listening
    if (wss.clients.size === 0) {
      process.stdout.write(`\r[PAUSED] Waiting for Dashboard connection... `);
      while (wss.clients.size === 0) {
        await new Promise(r => setTimeout(r, 1000));
      }
      console.log('\n[RESUMED] Dashboard detected. Pumping ticks...');
    }

    broadcastToDashboard(doc);
    count++;
    
    // Log progress every 20 ticks
    if (count % 20 === 0 || count === totalDocs) {
      const progress = ((count / totalDocs) * 100).toFixed(1);
      process.stdout.write(`\r[PROGRESS] ${count}/${totalDocs} (${progress}%) | Instrument: ${doc.instrumentKey} `);
    }

    await new Promise(r => setTimeout(r, REPLAY_DELAY_MS));
  }
  
  console.log('\n\n[FINISH] Replay end of file reached. Restart bridge to replay again.');
}

function broadcastToDashboard(doc) {
  const key = doc.instrumentKey;
  if (!key || !doc.fullFeed) return;

  const payload = {
    feeds: {
      [key]: {
        fullFeed: doc.fullFeed,
        requestMode: doc.requestMode || 'full'
      }
    }
  };

  const message = JSON.stringify(payload);
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(message);
    }
  });
}

startBridge();
