import mongoose from "mongoose"

type MongooseCache = {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

const cache: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null
}

if (!global.mongooseCache) {
  global.mongooseCache = cache
}

export async function connectToDatabase() {
  if (cache.conn) {
    return cache.conn
  }

  const mongodbUri = process.env.MONGODB_URI
  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI in environment variables.")
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(mongodbUri, {
      dbName: process.env.MONGODB_DB_NAME || "izza_estetica"
    })
  }

  cache.conn = await cache.promise
  return cache.conn
}
