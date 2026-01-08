"use server";

import prisma from "@/lib/prisma";

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  return users || [];
}
