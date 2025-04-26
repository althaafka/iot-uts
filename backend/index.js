require("dotenv").config();
const express = require("express");
const cors = require('cors');
const decryptBase64AES = require('./decrypt.js')

const mqtt = require("mqtt");
const { db, bucket } = require('./firebase');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req, res) => {
    res.json("hello")
});

// ===== MQTT CONFIGURATION =====
const MQTT_BROKER = process.env.MQTT_BROKER || "mqtt://mosquitto:1883";
const MQTT_TOPIC = process.env.MQTT_TOPIC || "13521130/image";

const chunkBuffer = {};

// Connect to MQTT Broker
const mqttClient = mqtt.connect(MQTT_BROKER);
mqttClient.on('connect', () => {
    console.log(`Connected to MQTT broker at ${MQTT_BROKER}`);
    mqttClient.subscribe(MQTT_TOPIC, () => {
      console.log(`Subscribed to topic: ${MQTT_TOPIC}`);
    });
});

// Handle incoming MQTT messages
mqttClient.on('message', async (topic, message) => {
    try {
      const { id, chunk_id, timestamp, is_last, data: encrypted_data } = JSON.parse(message.toString());
      const data = decryptBase64AES(encrypted_data);

      const receiveTime = Date.now();
      const messageTimestamp = typeof timestamp === 'string' ? 
          new Date(timestamp).getTime() : 
          timestamp * (timestamp < 1e12 ? 1000 : 1);
      const latency = Math.max(receiveTime - messageTimestamp, 0);
      
      console.log(`Latensi chunk ${chunk_id} untuk gambar ${id}: ${latency} ms, ${receiveTime} dan ${messageTimestamp}`);

      // First chunk
      if (!chunkBuffer[id]) {
        chunkBuffer[id] = {
          chunks: [],
          lastChunkId: null,
          sendAt: messageTimestamp
        };
      }
  
      chunkBuffer[id].chunks[chunk_id] = data;
  
      if (is_last) {
        chunkBuffer[id].lastChunkId = chunk_id;
      }
  
      const { chunks, lastChunkId } = chunkBuffer[id];
  
      if (lastChunkId !== null) {
        const isComplete = chunks.length === lastChunkId + 1 && chunks.every(c => c !== undefined);
        
        if (isComplete) {
          chunkBuffer[id].receiveAt = receiveTime;
          const base64 = chunks.join('');
          const buffer = Buffer.from(base64, 'base64');
          const fileName = `image-${id}-${Date.now()}.jpg`;
          const file = bucket.file(fileName);
          
          await file.save(buffer, { contentType: 'image/jpeg' });
          
          const imageUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
          
          await db.collection('images').add({
            id,
            url: imageUrl,
            sendAt: chunkBuffer[id].sendAt,
            receiveAt: chunkBuffer[id].receiveAt,
            createdAt: Date.now()
          });
          
          console.log(`Gambar ${id} diupload ke Firebase: ${imageUrl}`);
          
          delete chunkBuffer[id];
        }
      }
  
    } catch (err) {
      console.error("Error parsing MQTT message:", err.message);
    }
});

// Get all images
app.get('/images', async (req, res) => {
    try {
      const snapshot = await db.collection('images').orderBy('createdAt', 'asc').get();
      
      const images = [];
      snapshot.forEach(doc => {
        images.push({
          id: doc.id,
          ...doc.data()
        });
      });
  
      res.json(images);
    } catch (error) {
      console.error("Failed to get images:", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
});
  

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
