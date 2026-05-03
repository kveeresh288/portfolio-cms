import mongoose from 'mongoose';

// Singleton pattern required for Next.js serverless (avoids opening a new
// connection on every Route Handler invocation during hot reload)
declare global {
  // eslint-disable-next-line no-var
  var _mongoCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

if (!global._mongoCache) {
  global._mongoCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (global._mongoCache.conn) return global._mongoCache.conn;

  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI environment variable is not set');

  if (!global._mongoCache.promise) {
    global._mongoCache.promise = mongoose.connect(uri, { bufferCommands: false });
  }

  global._mongoCache.conn = await global._mongoCache.promise;
  return global._mongoCache.conn;
}
