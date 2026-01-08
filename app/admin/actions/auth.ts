"use server";

import { signIn as authSignIn, signOut as authSignOut, auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;

  if (!email || !password) {
      return { error: "Email and password are required" };
  }

  const existingUser = await prisma.user.findUnique({
      where: { email }
  });

  if (existingUser) {
      return { error: "User already exists" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
      await prisma.user.create({
          data: {
              email,
              name,
              passwordHash: hashedPassword,
              role: "CONTRIBUTOR", // Default role
          }
      });
      
      return { success: true, message: "Account created successfully" };
  } catch (error) {
      console.error("Error creating user:", error);
      return { error: "Failed to create account" };
  }
}

import { AuthError } from "next-auth";

// ... existing code ...

export async function signIn(prevState: any, formData: FormData) {
  try {
    await authSignIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials." };
        default:
          return { error: "Something went wrong." };
      }
    }
    throw error;
  }
}

export async function signOut() {
  await authSignOut();
}

export async function findUserByEmailWithPassword(email: string) {
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email },
  });
}

export async function getUser() {
  const session = await auth();
  return session?.user;
}

export async function getUserProfile() {
  const session = await auth();
  
  if (!session?.user?.email) return null;

  const profile = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  return profile;
}

