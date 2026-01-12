import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
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
}

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function main() {
  const email = process.argv[2] || 'admin@example.com';
  
  console.log(`🌐 Connecting to Database...`);
  console.log(`🔐 Resetting password for user: ${email}`);

  // Generate random password
  const password = process.env.ADMIN_PASSWORD || Math.random().toString(36).slice(-12);
  const hashedPassword = await bcrypt.hash(password, 10);

  // Upsert user (Update if exists, Create if not)
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      // Ensure role is ADMIN if updating
      role: 'ADMIN', 
    },
    create: {
      email,
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      createdAt: new Date(),
    },
  });

  console.log('------------------------------------------------');
  console.log('✅ Admin user password reset successfully');
  console.log(`📧 Email:    ${user.email}`);
  console.log(`🔑 New Password: ${password}`);
  console.log('------------------------------------------------');
  console.log('⚠️  Please login immediately and change this password.');
}

main()
  .catch((e) => {
    console.error("Error resetting admin password:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
