// Database Connection File
// Connects to MongoDB Atlas using Mongoose
// Has an in-memory fallback for local college offline testing if MONGODB_URI is not set

import mongoose from 'mongoose';

let isConnected = false;
let useMemoryStore = false;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (mongoUri && mongoUri.trim() !== '') {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 5000,
      });
      isConnected = true;
      console.log('>>> [MongoDB] Connected to MongoDB Atlas successfully!');
      return;
    } catch (err) {
      console.warn('>>> [MongoDB] Could not connect to MongoDB Atlas URI. Switching to in-memory store for student demo:', err.message);
      useMemoryStore = true;
    }
  } else {
    console.log('>>> [MongoDB] No MONGODB_URI provided in .env. Running with in-memory database store for easy internal mark evaluation.');
    useMemoryStore = true;
  }
};

export const isDbConnected = () => isConnected;
export const isUsingMemoryStore = () => useMemoryStore;
