import 'dotenv/config';
import { MongoClient, ServerApiVersion } from 'mongodb';

let client;
let database;

export async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI is required. Set it in the server environment.');

  client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
  });
  await client.connect();
  await client.db('admin').command({ ping: 1 });
  database = client.db(process.env.MONGODB_DB || 'hotel');
  console.log(`Connected to MongoDB database: ${database.databaseName}`);
  return database;
}

export function getCollection(name = 'items') {
  if (!database) throw new Error('MongoDB connection is not ready.');
  return database.collection(name);
}

export async function closeMongo() {
  if (client) await client.close();
}
