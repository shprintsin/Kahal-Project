import { PrismaClient } from '@prisma/client';
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

if (process.env.SUPABASE_DB_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DB_URL;
}

const prisma = new PrismaClient();

async function main() {
  const layers = await prisma.layer.findMany({
    select: { slug: true, name: true, status: true },
  });
  console.log("Layers in production DB:", JSON.stringify(layers, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
