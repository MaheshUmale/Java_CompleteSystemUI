
import { WebSocketServer } from 'ws';
import { MongoClient } from 'mongodb';

/**
 * CONFIGURATION
 * Database: upstox_strategy_db
 * Collection: tick_data
 */
const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'upstox_strategy_db';
const COLLECTION_NAME = 'tick_data';
const WS_PORT = 8080;

/**
 * REPLAY SETTINGS
 * Set REPLAY_MODE to true to play back historical data.
 * Set REPLAY_DELAY_MS to control the speed of the playback.
 */
const REPLAY_MODE = true; 
const REPLAY_DELAY_MS = 100; // 100ms between ticks (approx 10 ticks/sec)

const wss = new WebSocketServer({ port: WS_PORT });
console.log(`[BRIDGE] WebSocket Server: ws://localhost:${WS_PORT}`);
console.log(`[BRIDGE] Target: ${DB_NAME}.${COLLECTION_NAME}`);
console.log(`[BRIDGE] Mode: ${REPLAY_MODE ? 'REPLAY (Historical)' : 'LIVE (New Ticks)'}`);

async function startBridge() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('[BRIDGE] Connected to MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    if (REPLAY_MODE) {
      await runReplay(collection);
    } else {
      await runLive(collection);
    }

  } catch (err) {
    console.error('[BRIDGE] Connection Error:', err);
    setTimeout(startBridge, 5000);
  }
}

/**
 * REPLAY MODE: Fetches existing data and plays it back
 */
async function runReplay(collection) {
  console.log('[REPLAY] Fetching historical ticks for playback...');
  
  // Sort by _id to ensure chronological order of insertion
  const cursor = collection.find({}).sort({ _id: 1 });
  
  let count = 0;
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    
    // Wait for at least one client to be connected before starting/continuing
    while (wss.clients.size === 0) {
      process.stdout.write('\r[REPLAY] Waiting for dashboard connection...      ');
      await new Promise(r => setTimeout(r, 1000));
    }

    broadcastToDashboard(doc);
    count++;
    
    if (count % 10 === 0) {
      process.stdout.write(`\r[REPLAY] Processed ${count} ticks...`);
    }

    // Delay to simulate time passing
    await new Promise(r => setTimeout(r, REPLAY_DELAY_MS));
  }
  
  console.log('\n[REPLAY] Finished playing back all available ticks.');
}

/**
 * LIVE MODE: Polls for new documents (Standard behavior)
 */
async function runLive(collection) {
  let lastProcessedId = null;
  console.log('[LIVE] Watching for new ticks via polling...');
  
  setInterval(async () => {
    try {
      const query = lastProcessedId ? { _id: { $gt: lastProcessedId } } : {};
      const newDocs = await collection.find(query).sort({ _id: 1 }).limit(20).toArray();
      
      for (const doc of newDocs) {
        broadcastToDashboard(doc);
        lastProcessedId = doc._id;
      }
    } catch (err) {
      console.error('[BRIDGE] Polling Error:', err);
    }
  }, 100);
}

/**
 * Broadcast payload to all connected clients
 */
function broadcastToDashboard(doc) {
  const key = doc.instrumentKey;
  if (!key || !doc.fullFeed) return;

  const payload = {
    feeds: {
      [key]: {
        fullFeed: doc.fullFeed,
        requestMode: doc.requestMode
      }
    }
  };

  const message = JSON.stringify(payload);
  
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
}

startBridge();
