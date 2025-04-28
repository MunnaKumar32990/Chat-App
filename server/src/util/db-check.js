const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables from the correct path
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

// Attempt to connect to MongoDB
console.log('Attempting to connect to MongoDB...');
console.log('Environment file path:', envPath);
console.log('MongoDB URI:', process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chat-app')
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    // List collections
    const db = mongoose.connection.db;
    db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
        return mongoose.connection.close();
      }
      
      console.log('Collections in database:');
      collections.forEach(collection => {
        console.log(`- ${collection.name}`);
      });
      
      mongoose.connection.close();
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Stack trace:', err.stack);
    
    if (err.name === 'MongoNetworkError' || err.message.includes('ECONNREFUSED')) {
      console.log('\nPossible solutions:');
      console.log('1. Make sure MongoDB is installed and running locally');
      console.log('   On Windows: Check if MongoDB service is running in Services');
      console.log('   Try installing MongoDB Compass or MongoDB Community Edition');
      console.log('2. Consider using MongoDB Atlas (cloud database) instead of local MongoDB');
      console.log('   Update your .env file with a MongoDB Atlas connection string');
      console.log('3. Check firewall settings to ensure MongoDB port is accessible (default: 27017)');
      
      console.log('\nTo use MongoDB Atlas:');
      console.log('1. Go to https://www.mongodb.com/cloud/atlas/register');
      console.log('2. Sign up and create a free cluster');
      console.log('3. Click "Connect" and choose "Connect your application"');
      console.log('4. Copy the connection string and add it to your .env file:');
      console.log('   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/chat-app');
    }
    
    process.exit(1);
  }); 