const crypto = require('crypto');

const key = Buffer.from('12345678901234567890123456789012', 'utf8');
const iv = Buffer.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

function decryptBase64AES(encryptedBase64) {
  try {
    const encryptedData = Buffer.from(encryptedBase64, 'base64');
    
    if (encryptedData.length % 16 !== 0) {
      throw new Error(`Invalid encrypted data length: ${encryptedData.length}`);
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    decipher.setAutoPadding(true);
    
    let decrypted = decipher.update(encryptedData, null, 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (err) {
    console.error("Decryption error:", err.message);
    console.log("Failed Base64 input:", encryptedBase64);
    return null;
  }
}

module.exports = decryptBase64AES;