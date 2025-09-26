// lib/mongodb.js
import mongoose from 'mongoose';

// IMPORTANT: NEVER expose this URI directly in code. Use environment variables (.env.local)
const MONGODB_URI = 'mongodb+srv://mukilanp:cyber19@cluster0.w639azh.mongodb.net/proofly'; 
// The database name is appended here: 'proofly'
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectMongo() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Recommended for serverless environments
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
