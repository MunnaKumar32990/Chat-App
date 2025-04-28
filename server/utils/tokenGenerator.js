const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

/**
 * Generates a JWT token with custom user data
 * 
 * @param {Object} userData - User data to include in the token
 * @returns {Object} Object containing the token and decoded data
 */
const generateToken = (userData = {}) => {
  // Ensure we have a JWT_SECRET
  const JWT_SECRET = process.env.JWT_SECRET || '4b27c973a5c2f1d646ecec5fc54d41b8a917d0273c46b38f7cf708b2a3e6e265';
  
  // Default user ID if not provided
  const userId = userData.id || userData._id || '65fcd3e20a7c46b89d7c5a99';
  
  // Create a more robust payload
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: userId,
    email: userData.email || 'test@example.com',
    username: userData.username || 'testuser',
    iat: now,
    exp: now + (30 * 24 * 60 * 60), // 30 days
    jti: Math.random().toString(36).substring(2) + Date.now().toString(36)
  };
  
  // Generate the token
  const token = jwt.sign(payload, JWT_SECRET);
  
  // Decode token for verification (without verification)
  const decoded = jwt.decode(token);
  
  return {
    token,
    decoded,
    expiresAt: new Date(decoded.exp * 1000).toLocaleString()
  };
};

// If this script is run directly, generate a token and display it
if (require.main === module) {
  // Get user ID from command line if provided
  const userId = process.argv[2];
  const userData = userId ? { id: userId } : {};
  
  const result = generateToken(userData);
  
  console.log('===============================');
  console.log('JWT TOKEN GENERATOR');
  console.log('===============================');
  console.log('TOKEN:');
  console.log(result.token);
  console.log('\nDECODED DATA:');
  console.log(JSON.stringify(result.decoded, null, 2));
  console.log('\nEXPIRES AT:');
  console.log(result.expiresAt);
  console.log('===============================');
  
  // Optionally save token to a file
  const tokenDir = path.join(__dirname, '../tokens');
  if (!fs.existsSync(tokenDir)) {
    fs.mkdirSync(tokenDir, { recursive: true });
  }
  
  const tokenFile = path.join(tokenDir, `token_${Date.now()}.txt`);
  fs.writeFileSync(tokenFile, `${result.token}\n\nDecoded: ${JSON.stringify(result.decoded, null, 2)}\nExpires: ${result.expiresAt}`);
  console.log(`Token saved to: ${tokenFile}`);
}

module.exports = { generateToken }; 