import { PrismaClient } from '@prisma/client';
import * as dotenv from "dotenv";
import path from "path";

// Load environment variables
const envPathLocal = path.resolve(process.cwd(), ".env.local");
const envPath = path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPathLocal });
dotenv.config({ path: envPath });

// Override DATABASE_URL to use Supabase if available
if (process.env.SUPABASE_DB_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DB_URL;
  console.log("Using SUPABASE_DB_URL for verification.");
} else {
    console.log("Using default DATABASE_URL from env.");
}

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Import the actons? 
// No, we can't easily import Server Actions in a standalone script without Next.js build context usually because of 'use server' directives transpilation.
// Instead, we will replicate the query logic to verify the DB connection and schema compatibility.
// If the direct Prisma call works, then the DB is accessible.

async function verifyCollections() {
  console.log("--- Verifying Collections (Like /archive) ---");
  try {
    const collections = await prisma.collection.findMany({
      take: 1,
    });
    console.log(`✅ Success! Found ${collections.length} collections.`);
    if(collections.length > 0) console.log(`Sample: ${collections[0].name}`);
    return true;
  } catch (error) {
    console.error("❌ Collections Query Failed:", error);
    return false;
  }
}

async function verifyLayers() {
  console.log("--- Verifying Layers (Like /layers) ---");
  try {
    const layers = await prisma.layer.findMany({
      take: 1,
    });
    console.log(`✅ Success! Found ${layers.length} layers.`);
    if(layers.length > 0) console.log(`Sample: ${layers[0].name}`);
    return true;
  } catch (error) {
    console.error("❌ Layers Query Failed:", error);
    return false;
  }
}

async function verifyPosts() {
  console.log("--- Verifying Posts (Like /posts) ---");
  try {
    const posts = await prisma.post.findMany({
      take: 1,
    });
    console.log(`✅ Success! Found ${posts.length} posts.`);
    return true;
  } catch (error) {
    console.error("❌ Posts Query Failed:", error);
    return false;
  }
}

async function verifyMaps() {
    console.log("--- Verifying Maps (Like /maps) ---");
    try {
      const maps = await prisma.map.findMany({
        take: 1,
      });
      console.log(`✅ Success! Found ${maps.length} maps.`);
      return true;
    } catch (error) {
      console.error("❌ Maps Query Failed:", error);
      return false;
    }
  }

async function main() {
  console.log(`Checking connection to: ${process.env.DATABASE_URL?.split('@')[1] || 'Unknown Host'}`); // Mask password
  
  await verifyCollections();
  await verifyLayers();
  await verifyMaps();
  await verifyPosts();
}

main()
  .catch((e) => {
    console.error("Unexpected error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
