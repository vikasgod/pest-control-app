import mongoose from "mongoose";

type MongooseCache = {
  connection: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cache = global.mongooseCache ?? { connection: null, promise: null };
global.mongooseCache = cache;

export async function connectToDatabase() {
  if (cache.connection) return cache.connection;

  if (!cache.promise) {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("Missing MONGODB_URI environment variable.");

    cache.promise = mongoose.connect(mongoUri).catch((error: unknown) => {
      cache.promise = null;
      throw error;
    });
  }

  cache.connection = await cache.promise;
  return cache.connection;
}
