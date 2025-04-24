const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // download dari Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'gs://iot-uts-1352130.firebasestorage.app', // ganti dengan bucket kamu
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

module.exports = { db, bucket };
