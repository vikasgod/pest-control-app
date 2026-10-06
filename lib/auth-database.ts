import { MongoClient, type Db } from "mongodb";

type MongoCache = {
  client: MongoClient | null;
  database: Db | null;
};

declare global {
  var authMongoCache: MongoCache | undefined;
}

const cache = global.authMongoCache ?? {
  client: null,
  database: null,
};
global.authMongoCache = cache;

export function getAuthDatabase() {
  if (cache.database) return cache.database;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("Missing MONGODB_URI environment variable.");

  cache.client = new MongoClient(uri);
  cache.database = cache.client.db();
  return cache.database;
}
